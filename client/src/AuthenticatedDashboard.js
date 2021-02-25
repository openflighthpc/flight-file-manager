import { Link } from "react-router-dom";

import { DashboardLogo } from 'flight-webapp-components';

import { CardFooter } from './CardParts';

function AuthenticatedDashboard() {
  return (
    <div>
      <DashboardLogo />
      <div className="card-deck">
        <div className="card" style={{ minHeight: "225px" }} >
          <div className="card-body fa-background fa-background-files-o">
            <h5 className="card-title text-center">
              Manage your compute environment files
            </h5>
            <p className="card-text">
              Manage the files on your compute environment by clicking on the
              button below.
            </p>
          </div>
          <CardFooter>
            <Link
              className="btn btn-success btn-block"
              to="/browse"
            >
              <i className="fa fa-files-o mr-1"></i>
              <span>Manage files</span>
            </Link>
          </CardFooter>
        </div>
      </div>
    </div>
  );
}

export default AuthenticatedDashboard;
