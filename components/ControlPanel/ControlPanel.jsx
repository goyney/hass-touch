import React from 'react';
import { Sidebar, Menu, Ref } from 'semantic-ui-react';

import './ControlPanel.scss';

const menuItems = [
  {
    id: 'home',
    name: 'Home',
    icon: 'home-assistant'
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
    id: 'music',
    name: 'Music',
    icon: 'music-note'
  },
  {
    id: 'irrigation',
    name: 'Irrigation',
    icon: 'water-pump'
  }
];

export default class ControlPanel extends React.Component {
  constructor() {
    super();
    this.menuItems = {};
  }

  componentDidMount() {
    this.menuItems[this.props.activePage].scrollIntoView({ behavior: 'smooth' });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.activePage !== nextProps.activePage;
  }

  render() {
    const { activePage, changePage } = this.props;

    const menu = menuItems.map(item => {
      return (
        <Ref key={item.id} innerRef={ref => this.menuItems[item.id] = ref}>
          <Menu.Item
            name={item.id}
            active={activePage === item.id}
            onClick={changePage}
          >
            <div>
              <i className={`icon mdi mdi-${item.icon}`} />
              {item.name}
            </div>
          </Menu.Item>
        </Ref>
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
