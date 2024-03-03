import React from 'react';

function UnconfiguredDashboard() {
  return (
    <div>
      <p>
        Flight Console Service allows you to access an interactive terminal
        console session running on your cluster from the comfort of your
        browser.
      </p>

      <p>
        Before Flight Console Service can be used, it needs to be configured
        by your system administrator.  It can be configured by running:
      </p>

      <div className="card card-body">
        <pre className="mb-0">
          <code>
            flight service configure console-webapp
          </code>
        </pre>
      </div>
    </div>
  );
}

export default UnconfiguredDashboard;
