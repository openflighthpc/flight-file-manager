import { useEffect, useRef, useState } from 'react';

import addStylesheetRules from './addStylesheetRules';
import { useLaunchSession } from './api';
import { useHistory } from "react-router-dom"

function handleOnLoad(event, setTerminalState) {
  const doc = event.target.contentDocument;
  if (doc && doc.body.querySelector('.fm .files')) {
    addStylesheetRules(doc, [
      ['html',              ['height', 'calc( 100vh - 75px )']],
      ['body',              ['height', '100%']],
      ['.fm',               ['height', '100%'],  ['margin-top', '0.5em']],
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
  const history = useHistory();
  const dirRef = useRef(new URLSearchParams(history.location.search).get('dir'));
  const { post: launchSession, response } = useLaunchSession(dirRef.current);
  const urlRef = useRef(null);
  // Possible states are `initialising`, `connected`, `failed`.
  const [ terminalState, setTerminalState ] = useState('initialising');

  useEffect(() => {
    if (containerRef.current == null) { return; }

    launchSession().then((responseBody) => {
      if (response.ok) {
        urlRef.current = responseBody.url;
        containerRef.current.onload = (event) => { handleOnLoad(event, setTerminalState); }
        containerRef.current.src = responseBody.url;

      } else if (dirRef.current) {
        // The directory we used was no good.  Let's try the default directory
        // instead.  The `history.replace()` below will cause the component to
        // re-render.
        dirRef.current = null;
        // XXX Display an error message that the directory could not be found.
        // Perhaps a useToast toast.

      } else {
        // XXX: What should happen if the error persists? Currently it just hangs.
        // NOOP - ¯\_(ツ)_/¯
      }

      // In all cases clear the query string.  This causes the component to
      // rerender if the query string has changed.
      history.replace({ query: '' });
    });

    // We're expecting `response` to change and don't want to re-run the hook
    // when it does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, launchSession]);

  return {
    terminalState,
  };
}
