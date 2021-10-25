import classNames from 'classnames';
import { useContext } from 'react';
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { CurrentUserContext } from 'flight-webapp-components';

function NavItems() {
  const { currentUser } = useContext(CurrentUserContext);

  if (currentUser == null) {
    return null;
  }

  return (
    <>
    <NavLink path="/">Home</NavLink>
    <NavLink path="/browse">My files</NavLink>
    </>
  );
}

function NavLink({ path, children }) {
  const location = useLocation();
  const active = location.pathname === path;

  return (
    <li className={classNames("nav-item", { active: active})}>
      <Link
        className={classNames("nav-link nav-menu-button", { active: active })}
        to={path}
      >
        {children}
      </Link>
    </li>
  );
}

export default NavItems;
