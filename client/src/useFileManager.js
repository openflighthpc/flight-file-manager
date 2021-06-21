import mkDebug from 'debug';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [ currentAbsDir, setCurrentAbsDir ] = useState(null);
  const [ isFileSelected, setIsFileSelected ] = useState(null);
  const [ isRootDir, setIsRootDir ] = useState(null);

  // Possible states are:
  // * `launching`: waiting on API to launch the cloudcmd process.
  // * `retrieving`: retrieving asssets from cloudcmd process.
  // * `retrieved`: asssets retrieved.
  // * `connecting`: connecting to cloudcmd process.
  // * `connected`: file manager process is connected.
  // * `failed`: something went wrong.
  const [ state, setState ] = useState('launching');

  const currentFileListener = useCallback(() => {
    setTimeout(() => {
      const Info = window.DOM.CurrentInfo;
      debug('current-file changed. absPath=%s path=%s isFile=%s isRootDir=%s',
        sessionRef.current.root + Info.dirPath + Info.name,
        Info.dirPath + Info.name,
        !Info.isDir,
        Info.dirPath === '/',
      );
      if (sessionRef.current.root === '/') {
        setCurrentAbsDir(Info.dirPath);
      } else {
        setCurrentAbsDir(sessionRef.current.root + Info.dirPath);
      }
      setIsFileSelected(!Info.isDir);
      setIsRootDir(Info.dirPath === '/');
    }, 0);
  }, []);

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

  function goToParentDir() { if (state === 'connected') { window.CloudCmd.goToParentDir(); } };
  function promptNewFile() { if (state === 'connected') { window.DOM.promptNewFile(); } };
  function promptNewDir()  { if (state === 'connected') { window.DOM.promptNewDir(); } };
  function view()          { if (state === 'connected') { window.CloudCmd.View.show(); } };
  function edit()          { if (state === 'connected') { window.CloudCmd.EditFile.show(); } };
  function rename()        { if (state === 'connected') { window.DOM.renameCurrent(); } };
  function del()           { if (state === 'connected') { window.CloudCmd.Operation.show('delete'); } };
  function cut()           { if (state === 'connected') { window.DOM.Buffer.cut(); } };
  function copy()          { if (state === 'connected') { window.DOM.Buffer.copy(); } };
  function paste()         { if (state === 'connected') { window.DOM.Buffer.paste(); } };
  function upload()        { if (state === 'connected') { window.CloudCmd.Upload.show(); } };
  function download()      { if (state === 'connected') { window.CloudCmd.execFromModule('Menu', 'preDownload'); } };
  function pack()          { if (state === 'connected') { window.CloudCmd.Operation.show('pack'); } };
  function extract()       { if (state === 'connected') { window.CloudCmd.Operation.show('extract'); } };
  function toggleAllSelectedFiles() { if (state === 'connected') { window.DOM.toggleAllSelectedFiles(); } };

  return {
    goToParentDir: useCallback(goToParentDir, [state]),
    promptNewFile: useCallback(promptNewFile, [state]),
    promptNewDir:  useCallback(promptNewDir,  [state]),
    view:          useCallback(view,          [state]),
    edit:          useCallback(edit,          [state]),
    rename:        useCallback(rename,        [state]),
    del:           useCallback(del,           [state]),
    cut:           useCallback(cut,           [state]),
    copy:          useCallback(copy,          [state]),
    paste:         useCallback(paste,         [state]),
    upload:        useCallback(upload,        [state]),
    download:      useCallback(download,      [state]),
    pack:          useCallback(pack,          [state]),
    extract:       useCallback(extract,       [state]),
    toggleAllSelectedFiles: useCallback(toggleAllSelectedFiles, [state]),

    currentAbsDir,
    isFileSelected,
    isRootDir,
    state,
  };
}
