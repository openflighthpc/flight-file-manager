import React from 'react';
import { DashboardLogo } from 'flight-webapp-components';

import Blurb from './Blurb';
import ClusterOverview from './ClusterOverview';

function UnauthenticatedDashboard() {
  return (
    <div>
      <DashboardLogo />
      <ClusterOverview className="mt-2 mb-2" />
      <Blurb />
      <p>
        To start managing your files with Flight File Manager sign in below.
      </p>
    </div>
  );
}


export default UnauthenticatedDashboard;
