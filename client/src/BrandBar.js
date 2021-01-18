import React, { useContext } from 'react';
import { Link } from "react-router-dom";

import Logo from './png_trans_logo-navbar.png';
import styles from './BrandBar.module.css';
import { Context as ConfigContext } from './ConfigContext';
import { Context as CurrentUserContext } from './CurrentUserContext';

export default function BrandBar({ className }) {
  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-white border-bottom ${styles.BrandBar} ${className}`}>
      <a
        className="navbar-brand"
        href="/"
      >
        <img
          src={Logo}
          alt="openflightHPC Logo"
          height="75">
        </img>
      </a>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav mr-auto">
          <NavItems />
        </ul>
        <ul className="navbar-nav">
          <UserNavItems />
        </ul>
        <div className="my-2 my-lg-0">
          <a href="https://github.com/openflighthpc">
            <span className="fa fa-3x fa-github"></span>
          </a>
        </div>
      </div>

    </nav>
  );
}

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
        to="/files"
      >
        Manage your files
      </Link>
    </li>
    </>
  );
}

function UserNavItems() {
  const { currentUser, actions } = useContext(CurrentUserContext);
  const { clusterName } = useContext(ConfigContext);
  if (currentUser == null) { return null; }

  return (
    <>
    <li className="nav-item">
      <span className="nav-link nav-menu-text">
        {currentUser.username} ({clusterName})
      </span>
    </li>
    <li className="nav-item">
      <button
        className="btn btn-link nav-link nav-menu-button"
        onClick={actions.signOut}
      >
        Sign out
      </button>
    </li>
    </>
  );
}
