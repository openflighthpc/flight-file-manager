import React from 'react';

import { DashboardLogo } from 'flight-webapp-components';

import ClusterOverview from './ClusterOverview';

function UnauthenticatedDashboard() {
  return (
    <div>
      <DashboardLogo />
      <ClusterOverview className="mt-2 mb-2" />
      <p>
        The Flight File Manager Service allows you to manage your files on
        your cluster in a familiar file browser GUI (graphical user interface)
        from within the comfort of your browser.
      </p>

      <p>
        To start managing your files with Flight File Manager sign in below.
      </p>
    </div>
  );
}


export default UnauthenticatedDashboard;
