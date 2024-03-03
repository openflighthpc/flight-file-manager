import { useContext } from 'react';
import classNames from "classnames";

import {
  DefaultErrorMessage,
  ErrorBoundary,
  Overlay,
  OverlayContainer,
  Spinner,
} from 'flight-webapp-components';

import CloudCmdSkeleton from './CloudCmdSkeleton';
import Toolbar from './Toolbar';
import styles from './FileManager.module.css';
import useFileManager from './useFileManager';
import {
  Context as FileManagerContext,
  Provider as FileManagerProvider,
} from './FileManagerContext';
import FileManagerLayout from './FileManagerLayout';

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
                    <Toolbar onZenChange={onZenChange} />
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

function AuthenticatedDashboard() {
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

  // return (
  //   <>
  //     <div
  //       className="centernav col-12 fullscreen"
  //     >
  //       <FileManagerLayout
  //         onDisconnect={onDisconnect}
  //         onFullscreenChange={focus}
  //         onReconnect={onReconnect}
  //         onZenChange={resizeTerminal}
  //         fileManagerState={fileManagerState}
  //         title={title}
  //       >
  //         <div
  //           id="files-container"
  //           className={
  //             classNames("files-wrapper fullscreen-content bg-black", {
  //               'file-manager-connected': fileManagerState === 'connected',
  //               'file-manager-disconnected': fileManagerState !== 'connected',
  //             })
  //           }
  //           ref={fileManagerContainer}
  //         />
  //       </FileManagerLayout>
  //     </div>
  //   </>
  // );
}

export default AuthenticatedDashboard;
