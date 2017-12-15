import React from 'react';
import { Sidebar, Menu } from 'semantic-ui-react';

import './ControlPanel.scss';

const menuItems = [
  {
    id: 'home',
    name: 'Home',
    icon: 'home'
  },
  {
    id: 'alarm',
    name: 'Alarm',
    icon: 'dialpad'
  },
  {
    id: 'climate',
    name: 'Climate',
    icon: 'nest-thermostat'
  },
  {
    id: 'lights',
    name: 'Lights',
    icon: 'lightbulb'
  },
  {
    id: 'garage',
    name: 'Garage',
    icon: 'garage'
  },
  {
    id: 'irrigation',
    name: 'Irrigation',
    icon: 'water-pump'
  }
];

export default class ControlPanel extends React.Component {
  render() {
    const { activePage, changePage } = this.props;

    const menu = menuItems.map(item => {
      return (
        <Menu.Item
          key={item.id}
          name={item.id}
          active={activePage === item.id}
          onClick={changePage}
        >
          <i className={`icon mdi mdi-${item.icon}`} />
          {item.name}
        </Menu.Item>
      );
    });

    return (
      <Sidebar
        as={Menu}
        animation='push'
        borderless
        icon='labeled'
        id='control-panel'
        inverted
        vertical
        visible
      >
        {menu}
      </Sidebar>
    );
  }
}
