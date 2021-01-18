import { useState } from 'react';
import classNames from 'classnames';

import ErrorBoundary, { DefaultErrorMessage } from './ErrorBoundary';
import FileManager from './FileManager';
import FullscreenButton from './FullscreenButton';
import Spinner from './Spinner';
import styles from './FileManager.module.css';

function FileManagerPage() {
  const [ loaded, setLoaded ] = useState(false);
  const [ error, setError ] = useState(false);

  let loadingMessage = null;
  if (!loaded && !error) {
    loadingMessage = <Spinner text="Loading file manager..." />;
  }
  let errorMessage = null;
  if (error) {
    errorMessage = <DefaultErrorMessage />;
  }

  return (
    <>
    {loadingMessage}
    {errorMessage}

    <Layout
      className={classNames({ 'd-none': !loaded, 'd-some': true})}
      onZenChange={ () => {} }
    >
      <ErrorBoundary>
        <div className={`fullscreen-content ${styles.FileManagerWrapper}`} >
          <FileManager
            onLoad={() => setLoaded(true) }
            onError={() => setError(true) }
          />
        </div>
      </ErrorBoundary>
    </Layout>
    </>
  );
}

function Layout({
  children,
  className,
  onZenChange,
}) {
  return (
    <div className={classNames("overflow-auto", className)}>
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
