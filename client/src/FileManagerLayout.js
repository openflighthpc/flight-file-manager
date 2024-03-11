import { useContext } from 'react';

import {
  DefaultErrorMessage,
  Overlay,
  OverlayContainer,
  Spinner,
  FullscreenButton
} from 'flight-webapp-components';

import {
  Context as FileManagerContext,
} from './FileManagerContext';

import FileToolbar from './FIleToolbar';

function FileManagerLayout({
  children
}) {
  const { state, currentAbsDir, user, currentDir } = useContext(FileManagerContext);
  let loadingMessage = null;
  if (state !== 'connected' && state !== 'failed') {
    loadingMessage = <Loading text="Loading file manager..." />;
  }
  let errorMessage = null;
  if (state === 'failed') {
    errorMessage = <DefaultErrorMessage />;
  }

  return (
      <div className="overflow-auto">
        <div className="row no-gutters">
          <div className="col">
            <div className="card-header toolbar text-light">
              <div className="row no-gutters">
                <div className="col">
                  <div className="d-flex align-items-center">
                    <h5 className="flex-grow-1 mb-0">
                      <span className="font-weight-bolder">{user} - </span>
                      {currentDir}
                    </h5>
                    <Toolbar
                      fileManagerState={state}
                      onZenChange={ () => {} }
                      currentAbsDir={currentAbsDir}
                    />
                  </div>
                </div>
              </div>
            </div>
            <FileToolbar />
            <div className="bg-white">
              {loadingMessage}
              {errorMessage}
              {children}
            </div>
          </div>
        </div>
      </div>
  );
}

function Toolbar({
    onFullscreenChange,
    onZenChange,
    currentAbsDir,
    fileManagerState
}) {
  const RefreshButton = fileManagerState === 'connected' ? (
    <i
      className="fa fa-arrows-rotate ml-2 link white-text"
      title="refresh (Ctrl+R)"
      onClick={refresh}
    >
    </i>
  ) : null;

  const ToConsoleButton = fileManagerState === 'connected' ? (
    <i
      title="Open in terminal"
    >
      <a
        className="fa fa-terminal ml-2 link white-text"
        href={`../console?dir=${currentAbsDir}`}
      >
      </a>
    </i>
  ) : null;

  const fullscreenBtn = fileManagerState === 'connected' ?
    <FullscreenButton
      onFullscreenChange={onFullscreenChange}
      onZenChange={onZenChange}
    /> :
    null;

  return (
    <div className="btn-toolbar">
      {fullscreenBtn}
      {ToConsoleButton}
      {RefreshButton}
    </div>
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

function refresh() {
  document.querySelector('.path-icon.icon-refresh').click();
}

export default FileManagerLayout;