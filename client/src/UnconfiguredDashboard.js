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
        The Flight Desktop Access Service allows you to access interactive
        GUI (graphical user interface) desktop sessions running on your
        cluster from the comfort of your browser.
        Powered by the Flight Desktop tool, part of the OpenFlightHPC user
        suite, this app allows you to launch, manage and connect to GUI
        desktop sessions that operate within your OpenFlightHPC environment.
      </p>

      <p>
        Before Flight Desktop Access Service can be used, it needs to be
        configured by your system administrator.  It can be configured by
        running:
      </p>

      <div className="card card-body">
        <pre className="mb-0">
          <code>
            flight service configure desktop-webapp
          </code>
        </pre>
      </div>
    </div>
  );
}


export default UnconfiguredDashboard;
