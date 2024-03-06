import { useContext } from 'react';
import classNames from 'classnames';

import {
  DefaultErrorMessage,
  ErrorBoundary,
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
  const { state, currentAbsDir } = useContext(FileManagerContext);
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
                      {currentAbsDir}
                    </h5>
                    <Toolbar
                      fileManagerState={state}
                      onZenChange={ () => {} }
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
    fileManagerState
}) {
  const fullscreenBtn = fileManagerState === 'connected' ?
    <FullscreenButton
      onFullscreenChange={onFullscreenChange}
      onZenChange={onZenChange}
    /> :
    null;

  return (
    <div className="btn-toolbar">
      {fullscreenBtn}
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

export default FileManagerLayout;