import React from 'react';

import { classNames } from '../../utils';

import './menu.scss';

type MenuProps = {
  activeTabName: string;
  onTabClick: (string) => void,
};

const Menu: React.FC<MenuProps> = ({ activeTabName, onTabClick }) => (
  <div className="menu">
    <button
      type="button"
      className={classNames({ active: activeTabName === 'playlist' })}
      onClick={() => onTabClick('playlist')}
    >
      <span className="icon material-icons">queue_music</span>
    </button>
    <button
      type="button"
      className={classNames({ active: activeTabName === 'file-explorer' })}
      onClick={() => onTabClick('file-explorer')}
    >
      <span className="icon material-icons">folder_open</span>
    </button>
  </div>
);

export default Menu;
