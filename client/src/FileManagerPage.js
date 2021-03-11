import { useRef } from 'react';
import classNames from 'classnames';

import {
  DefaultErrorMessage,
  ErrorBoundary,
  FullscreenButton,
  Spinner,
} from 'flight-webapp-components';

import styles from './FileManager.module.css';
import useFileManager from './useFileManager';

function FileManagerPage() {
  const iframeRef = useRef(null);
  const { terminalState } = useFileManager(iframeRef);

  return (
    <Layout
      onZenChange={ () => {} }
      terminalState={terminalState}
    >
      <ErrorBoundary>
        <div className={`fullscreen-content ${styles.FileManagerWrapper}`} >
          <iframe
            ref={iframeRef}
            className={styles.FileManager}
            title="OpenFlight File Manager"
          />
        </div>
      </ErrorBoundary>
    </Layout>
  );
}

function Layout({ children, className, onZenChange, terminalState }) {
  let loadingMessage = null;
  if (terminalState === 'initialising') {
    loadingMessage = <Spinner text="Loading file manager..." />;
  }
  let errorMessage = null;
  if (terminalState === 'failed') {
    errorMessage = <DefaultErrorMessage />;
  }

  return (
    <div className={classNames("overflow-hidden", className)}>
      <div className="row no-gutters">
        <div className="col">
          <div className="card border-primary">
            <div className="card-header bg-primary text-light">
              <div className="row no-gutters">
                <div className="col">
                  <div className="d-flex align-items-center">
                    <h5 className="flex-grow-1 mb-0">
                      Your files
                    </h5>
                    <Toolbar
                      onZenChange={onZenChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {loadingMessage}
              {errorMessage}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toolbar({ onZenChange }) {
  const fullscreenBtn = <FullscreenButton onZenChange={onZenChange} />;
  return (
    <div className="btn-toolbar" style={{ minHeight: '31px' }}>
      {fullscreenBtn}
    </div>
  );
}

export default FileManagerPage;
