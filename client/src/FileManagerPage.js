import { useContext } from 'react';
import classNames from 'classnames';

import {
  DefaultErrorMessage,
  ErrorBoundary,
  Overlay,
  OverlayContainer,
  Spinner,
} from 'flight-webapp-components';

import CloudCmdSkeleton from './CloudCmdSkeleton';
import FileToolbar from './FIleToolbar';
import styles from './FileManager.module.css';
import useFileManager from './useFileManager';
import {
  Context as FileManagerContext,
  Provider as FileManagerProvider,
} from './FileManagerContext';

function FileManagerPage() {
  const contextData = useFileManager();

  return (
    <FileManagerProvider value={contextData}>
      <Layout onZenChange={ () => {} } >
        <ErrorBoundary>
          <div className={`fullscreen-content ${styles.FileManagerWrapper}`} >
            <CloudCmdSkeleton />
          </div>
        </ErrorBoundary>
      </Layout>
    </FileManagerProvider>
  );
}

function Loading({ text }) {
  return (
    <OverlayContainer>
      <Overlay>
        <Spinner text={text} />
      </Overlay>
    </OverlayContainer>
  );
}

function Layout({ children, className, onZenChange }) {
  const { state } = useContext(FileManagerContext);
  let loadingMessage = null;
  if (state !== 'connected' && state !== 'failed') {
    loadingMessage = <Loading text="Loading file manager..." />;
  }
  let errorMessage = null;
  if (state === 'failed') {
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
                    <FileToolbar onZenChange={onZenChange} />
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

export default FileManagerPage;
