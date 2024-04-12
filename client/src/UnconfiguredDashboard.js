import React from 'react';

function UnconfiguredDashboard() {
  return (
    <div>
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
