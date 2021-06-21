import mkDebug from 'debug';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from "react-router-dom"

import { loadConfig, loadCSS, loadScript } from './utils';
import { useLaunchSession } from './api';

const debug = mkDebug('flight:fm:useFileManager');

function useRequestedDirectory() {
  const history = useHistory();
  const dirRef = useRef(new URLSearchParams(history.location.search).get('dir'));

  return {
    requestedDir: dirRef.current,
    clearSearchParams: () => history.replace({ query: '' }),
  };
}

export default function useFileManager() {
  const { requestedDir, clearSearchParams } = useRequestedDirectory();
  const { post: launchSession, response } = useLaunchSession(requestedDir);
  // Holds details about the session returned by the API.
  const sessionRef = useRef(null);
  // Holds the cloudcmd config returned by the backend.
  const configRef = useRef(null);

  // Possible states are:
  // * `launching`: waiting on API to launch the cloudcmd process.
  // * `retrieving`: retrieving asssets from cloudcmd process.
  // * `retrieved`: asssets retrieved.
  // * `connecting`: connecting to cloudcmd process.
  // * `connected`: file manager process is connected.
  // * `failed`: something went wrong.
  const [ state, setState ] = useState('launching');


  useEffect(() => {
    debug('Launching session');
    launchSession().then((responseBody) => {
      if (response.ok) {
        // CloudCmd session has been launched, we can now retrieve the
        // javascript, css and config.
        sessionRef.current = {
          url: responseBody.url,
          dir: responseBody.dir,
        };
        debug('Retrieving assets %s', sessionRef.current.url);
        setState('retrieving');
        const url = sessionRef.current.url;
        Promise.all([
          loadConfig(`${url}/api/v1/config`),
          loadScript(`${url}/dist/cloudcmd.common.js`),
          loadScript(`${url}/dist/cloudcmd.js`),
          loadCSS(`${url}/dist/cloudcmd.css`),
        ]).then(([config, ...rest]) => {
          configRef.current = config;
          debug('Assets retrieved');
          setState('retrieved');
        });
      } else {
        setState('failed');
      }
    });
    // We're expecting `response` to change and don't want to re-run the hook
    // when it does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchSession]);

  useEffect(() => {
    if (state === 'retrieved') {
      const onConnected = () => {
        const dir = sessionRef.current.dir || '/';
        debug('Loading directory %s', dir);
        window.CloudCmd.addListener('current-file', currentFileListener);
        window.CloudCmd.loadDir({path: dir});
        // XXX Add this in properly.
        // .then(() => {
        //   if (true) {
        //     window.DOM.setCurrentByName('stuff.md');
        //     setTimeout(() => window.CloudCmd.View.show(), 0)
        //   }
        // });
        setState('connected');
        clearSearchParams();
      };

      if (typeof window.CloudCmd === 'function') {
        debug('Connecting to backend %o', configRef.current);
        setState('connecting');
        window.CloudCmd(configRef.current).then(() => {
          onConnected();
        });
      } else {
        debug('Already connected to backend');
        onConnected();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return {
    terminalState: state,
  };
}
