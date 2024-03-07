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
    clearSearchParams: () => {
      if (dirRef.current != null) {
        // Deliberately use `window.history` and `window.location` instead of
        // `history` and location provided by react-router in order to avoid a
        // re-rendering.
        //
        // Due to (possible) idiosyncrasies in
        // react-router/react-transition-group, using `history` would result
        // in a new page being animated in with the now incorrect search
        // params, which would result in the wrong directory being displayed.
        //
        // There may be a better way of avoiding this.
        const url = new URL(window.location);
        url.searchParams.delete('dir');
        window.history.pushState({}, '', url);
      }
    },
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
  const [ user, setUser ] = useState(null);
  const [ currentDir, setCurrentDir ] = useState(null);
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
      debug('current-file changed: root=%s path=%s isFile=%s isRootDir=%s',
        configRef.current.root,
        Info.dirPath + Info.name,
        !Info.isDir,
        Info.dirPath === '/',
      );
      if (configRef.current.root === '/') {
        const absDir = Info.dirPath;
        setCurrentAbsDir(absDir);
        setCurrentDir(`${absDir.startsWith(Info.homeDir) ? absDir.replace(Info.homeDir, '~').replace(/\/$/, "") : absDir.replace(/\/$/, "")}`);
      } else {
        const absDir = configRef.current.root + Info.dirPath;
        setCurrentAbsDir(absDir);
        setCurrentDir(`${absDir.startsWith(Info.homeDir) ? absDir.replace(Info.homeDir, '~').replace(/\/$/, "") : absDir.replace(/\/$/, "")}`);
      }
      setUser(Info.homeDirName);
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
          homeDir: responseBody.home_dir,
          file: responseBody.file
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
        const file = sessionRef.current.file;
        debug('Loading directory %s', dir);
        window.CloudCmd.addListener('current-file', currentFileListener);
        window.CloudCmd.loadDir({path: dir})
          .then(() => {
            if (file) {
              debug("Displaying file %s", file);
              window.DOM.setCurrentByName(file);
              window.CloudCmd.View.show();
            }
          });
        const homeDir = sessionRef.current.homeDir;
        const homeDirNames = homeDir.split('/');
        window.DOM.CurrentInfo.homeDir = homeDir;
        window.DOM.CurrentInfo.homeDirName = homeDirNames[homeDirNames.length - 1];
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

  const navigate = useCallback((dir) => {
    if (state === 'connected') {
      const path = (dir.path.startsWith('/')) ?
        dir.path :
        sessionRef.current.homeDir + '/' + dir.path

      window.CloudCmd.loadDir({path: path});
    }
  }, [state]);

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
    currentDir,
    user,
    isFileSelected,
    isRootDir,
    state,
    navigate
  };
}
