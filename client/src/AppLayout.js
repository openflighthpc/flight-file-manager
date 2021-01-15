import { useContext } from 'react';

import AnimatedRouter from './AnimatedRouter';
import BrandBar from './BrandBar';
import Footer from './Footer';
import { routes, unconfiguredRoutes } from './routes';
import { Context as ConfigContext } from './ConfigContext';

function AppLayout() {
  const { unconfigured } = useContext(ConfigContext);

  return (
    <>
    <BrandBar />
    <div
      className="container-fluid"
      id="main"
    >
      <div id="toast-portal"></div>
      <div className="content">
        <AnimatedRouter
          exact={!unconfigured}
          routes={unconfigured ? unconfiguredRoutes : routes}
          sideNav={SideNav}
        />
      </div>
    </div>
    <Footer />
    </>
  );
}

function SideNav() {
  return (
    <div className="col-sm-2 sidenav"></div>
  );
}

export default AppLayout;
