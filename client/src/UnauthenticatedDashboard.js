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
        The Flight Desktop Access Service allows you to access interactive
        GUI (graphical user interface) desktop sessions running on your
        cluster from the comfort of your browser.
        Powered by the Flight Desktop tool, part of the OpenFlightHPC user
        suite, this app allows you to launch, manage and connect to GUI
        desktop sessions that operate within your OpenFlightHPC environment.
      </p>

      <p>
        To start interacting with desktop sessions and gain access to your
        HPC environment sign in below.
      </p>

      <div className="card-deck">
        <ClusterOverviewCard />
        <SignInCard />
      </div>
    </div>
  );
}


export default UnauthenticatedDashboard;
