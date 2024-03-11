import React from 'react';
import Logo from './assets/files.png';

function Blurb() {
  return (
    <>
      <div
        className="app-card blurb"
        style={{ width: 'unset' }}
      >
        <img
          className="app-icon mr-3"
          alt=""
          src={Logo}
        />
        <h2 className="card-title card-text">
          flight<strong>FileManager</strong>
        </h2>
        <p className="tagline card-subtitle card-text">
          Access interactive file manager.
        </p>
      </div>
    </>
  );
}

export default Blurb;
