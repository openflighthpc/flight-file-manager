import React from 'react';

import { DashboardLogo } from 'flight-webapp-components';

import ClusterOverview from './ClusterOverview';

function UnauthenticatedDashboard() {
  return (
    <div>
      <DashboardLogo />
      <p>
        The Flight File Manager Service allows you to manage your files on
        your cluster in a familiar file browser GUI (graphical user interface)
        from within the comfort of your browser.
      </p>

      <p>
        To start managing your files with Flight File Manager sign in below.
      </p>

      <div className="card-deck">
        <ClusterOverview />
      </div>
    </div>
  );
}


export default UnauthenticatedDashboard;
