import Dashboard from './Dashboard';
import FileManagerPage from './FileManagerPage';
import UnconfiguredDashboard from './UnconfiguredDashboard';
import NotFoundDashboard from './NotFoundDashboard';

const routes = [
  {
    path: '/browse',
    name: 'Manage your files',
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
  {
    name: 'Not found',
    Component: NotFoundDashboard,
    sideNav: true
  },
]

const unconfiguredRoutes = [
  {
    path: '/',
    name: 'Home',
    Component: UnconfiguredDashboard,
    sideNav: true,
  },
];

export {
  routes,
  unconfiguredRoutes,
};
