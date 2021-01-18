import { useContext } from 'react';

import addStylesheetRules from './addStylesheetRules';
import styles from './FileManager.module.css';
import { Context as ConfigContext } from './ConfigContext';

export default function FileManager({ onLoad, onError }) {
  const { filesApiRootUrl } = useContext(ConfigContext);

  return (
    <iframe
      className={styles.FileManager}
      src={filesApiRootUrl}
      title="OpenFlight File Manager"
      onLoad={function(event) {
        const doc = event.target.contentDocument;
        if (doc && doc.body.querySelector('.fm .files')) {
          addStylesheetRules(doc, [
            ['.fm',               ['height', '100%'], ['margin-top', '0.5em']],
            ['.fm .panel-single', ['border', 'none'], ['margin', '1px']],
            ['.fm .files',        ['height', '100%'], ['margin-top', '0.25em']],
            ['.fm .fm-header',    ['text-transform', 'capitalize']],
          ]);

          if (onLoad) { onLoad(); }
        } else {
          if (onError) { onError(); }
        }
      }}
    >
    </iframe>
  );
}
