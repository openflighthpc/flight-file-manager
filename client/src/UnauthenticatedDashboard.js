import React from 'react';

import ClusterOverviewCard from './ClusterOverviewCard';
import Logo from './png_trans_logo.png';
import SignInCard from './SignInCard';

function UnauthenticatedDashboard() {
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
        To start managing your files with Flight File Manager sign in below.
      </p>

      <div className="card-deck">
        <ClusterOverviewCard />
        <SignInCard />
      </div>
    </div>
  );
}


export default UnauthenticatedDashboard;
