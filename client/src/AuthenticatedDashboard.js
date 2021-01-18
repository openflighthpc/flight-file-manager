import { Link } from "react-router-dom";

import { CardFooter } from './CardParts';
import Logo from './png_trans_logo.png';

function AuthenticatedDashboard() {
  return (
    <div>
      <img
        src={Logo}
        alt="OpenflightHPC Logo"
        className="center"
        width="100%"
      >
      </img>

      <div className="card-deck">
        <div className="card">
          <div className="card-body fa-background fa-background-desktop">
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
              <i className="fa fa-file mr-1"></i>
              <span>Manage files</span>
            </Link>
          </CardFooter>
        </div>
      </div>
    </div>
  );
}

export default AuthenticatedDashboard;
