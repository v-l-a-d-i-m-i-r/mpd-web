import React from 'react';

import './menu.scss';

const Menu: React.FC = () => (
  <section className="menu">
    <div className="wrapper">
      <button type="button">
        <i className="fas fa-th-list" />
      </button>
      <button type="button">
        <i className="fas fa-cog" />
      </button>
    </div>
  </section>
);

export default Menu;
