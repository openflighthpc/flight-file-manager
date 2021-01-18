import Dashboard from './Dashboard';
import UnconfiguredDashboard from './UnconfiguredDashboard';

// We need this to prevent the route for `/sessions/:id` from matching the
// string `/sessions/new`.
// const uuidRegExp = '\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b'

const routes = [
  {
    path: '/browse',
    name: 'XXX Name needed',
    Component: <div>XXX component needed</div>,
    authenticated: true,
    sideNav: false,
  },
  {
    path: '/',
    name: 'Home',
    Component: Dashboard,
    sideNav: true,
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
