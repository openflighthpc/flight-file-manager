import React from 'react';

import Logo from './png_trans_logo.png';

function UnconfiguredDashboard() {
  return (
    <div>
      <img
        src={Logo}
        alt="OpenflightHPC Logo"
        className="center"
        width="100%"
      >
      </img>

      <p>
        The Flight File Manager Service allows you to manage your files on
        your cluster in a familiar file browser GUI (graphical user interface)
        from within the comfort of your browser.
      </p>

      <p>
        Before Flight File Manager Service can be used, it needs to be
        configured by your system administrator.  It can be configured by
        running:
      </p>

      <div className="card card-body">
        <pre className="mb-0">
          <code>
            flight service configure file-manager-webapp
          </code>
        </pre>
      </div>
    </div>
  );
}


export default UnconfiguredDashboard;
