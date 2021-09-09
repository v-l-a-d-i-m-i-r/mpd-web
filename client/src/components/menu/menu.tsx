import React from 'react';

import './menu.scss';

const Menu: React.FC = () => (
  <div className="menu">
    <button type="button">
      <i className="fas fa-th-list" />
    </button>
    <button type="button">
      <i className="fas fa-cog" />
    </button>
  </div>
);

export default Menu;
