import { Link } from 'react-router-dom';
import { NotFound } from 'flight-webapp-components';

import Dashboard from './Dashboard';
import FileManagerPage from './FileManagerPage';
import UnconfiguredDashboard from './UnconfiguredDashboard';

const notFoundRoute = {
  name: 'Not found',
  Component: () => (
    <NotFound
      homeLink={
        <Link
          className="btn btn-link"
          to="/"
        >
          <span>Move Along...</span>
        </Link>
      }
    />
  ),
  sideNav: true,
  key: 'notfound',
};

const routes = [
  {
    path: '/browse',
    name: 'My files',
    Component: FileManagerPage,
    authenticated: true,
    sideNav: false,
  },
  {
    path: '/',
    name: 'Home',
    Component: Dashboard,
    sideNav: true,
  },
  notFoundRoute,
]

const unconfiguredRoutes = [
  {
    path: '/',
    name: 'Home',
    Component: UnconfiguredDashboard,
    sideNav: true,
  },
  notFoundRoute,
];

export {
  routes,
  unconfiguredRoutes,
};
