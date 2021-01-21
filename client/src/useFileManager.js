import { useEffect, useRef, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';

import addStylesheetRules from './addStylesheetRules';
import useEventListener from './useEventListener';
import { useLaunchSession } from './api';

function handleOnLoad(event, setTerminalState) {
  const doc = event.target.contentDocument;
  if (doc && doc.body.querySelector('.fm .files')) {
    addStylesheetRules(doc, [
      ['.fm',               ['height', '100%'], ['margin-top', '0.5em']],
      ['.fm .panel-single', ['border', 'none'], ['margin', '1px']],
      ['.fm .files',        ['height', '100%'], ['margin-top', '0.25em']],
      ['.fm .fm-header',    ['text-transform', 'capitalize']],
    ]);

    setTerminalState('connected');
  } else {
    setTerminalState('failed');
  }
}

export default function useFileManager(containerRef) {
  const { post: launchSession, response } = useLaunchSession();
  const urlRef = useRef(null);
  // Possible states are `initialising`, `connected`, `failed`.
  const [ terminalState, setTerminalState ] = useState('initialising');

  useBeforeunload(removeCredentials);
  useEventListener(window, 'signout', removeCredentials);

  useEffect(() => {
    if (containerRef.current == null) { return; }

    launchSession().then((responseBody) => {
      if (response.ok) {
        urlRef.current = responseBody.url;
        containerRef.current.onload = (event) => { handleOnLoad(event, setTerminalState); }
        containerRef.current.src = responseBody.url;
      }
    });

    // We're expecting `response` to change and don't want to re-run the hook
    // when it does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, launchSession]);

  // Invalidate the basic authentication added for the iframe.  This ensures
  // that if another user logs in they will have to enter their own
  // credentials.
  function removeCredentials() {
    if (urlRef.current == null) { return }
    const str = urlRef.current.replace("http://", "http://" + new Date().getTime() + "@");
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", str, true);
    xmlhttp.setRequestHeader("Authorization", "Basic ")
    xmlhttp.send();
    return false;
  }

  return {
    terminalState,
  };
}
