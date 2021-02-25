import { useContext } from 'react';
import { Link } from "react-router-dom";

import { CurrentUserContext } from 'flight-webapp-components';

function NavItems() {
  const { currentUser } = useContext(CurrentUserContext);
  if (currentUser == null) { return null; }

  return (
    <>
    <li className="nav-item">
      <Link
        className="nav-link nav-menu-button"
        to="/"
      >
        Home
      </Link>
    </li>
    <li className="nav-item">
      <Link
        className="nav-link nav-menu-button"
        to="/browse"
      >
        Manage your files
      </Link>
    </li>
    </>
  );
}

export default NavItems;
