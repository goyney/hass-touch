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
  constructor(props) {
    super(props);
    this.state = {
      activeItem: 'home'
    };
  }

  _switchPage = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const menu = menuItems.map(item => {
      return (
        <Menu.Item
          name={item.id}
          active={this.state.activeItem === item.id}
          onClick={this._switchPage}
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
