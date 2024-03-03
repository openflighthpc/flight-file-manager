import { FullscreenButton } from 'flight-webapp-components';

function Toolbar({
    onDisconnect,
    onFullscreenChange,
    onReconnect,
    onZenChange,
    fileManagerState: fileManagerState,
}) {
  const disconnectBtn = fileManagerState === 'connected' ? (
    <i
      className="fa fa-times ml-2 link white-text"
      title="Disconnect"
      onClick={onDisconnect}
    ></i>
  ) : null;

  const reconnectBtn = fileManagerState === 'disconnected' ? (
    <i
      className="fa fa-bolt ml-2 link white-text"
      title="Reconnect"
      onClick={onReconnect}
    ></i>
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
      {disconnectBtn}
      {reconnectBtn}
    </div>
  );
}
  
function FileManagerLayout({
    children,
    onDisconnect,
    onFullscreenChange,
    onReconnect,
    onZenChange,
    terminalState: fileManagerState,
    title,
  }) {
    return (
      <div className="overflow-auto">
        <div className="row no-gutters">
          <div className="col">
            <div className="card-header toolbar text-light">
              <div className="row no-gutters">
                <div className="col">
                  <div className="d-flex align-items-center">
                    <h5 className="flex-grow-1 mb-0">
                      {title}
                    </h5>
                    <Toolbar
                      fileManagerState={fileManagerState}
                      onDisconnect={onDisconnect}
                      onFullscreenChange={onFullscreenChange}
                      onReconnect={onReconnect}
                      onZenChange={onZenChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default FileManagerLayout;