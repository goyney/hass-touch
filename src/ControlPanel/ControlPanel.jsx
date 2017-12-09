import React from 'react';
import { Sidebar, Menu } from 'semantic-ui-react';

import './ControlPanel.scss';

export default class ControlPanel extends React.Component {
  render () {
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
        widths='7'
      >
        <Menu.Item name='home' active>
          <i className='icon mdi mdi-home' />
          Home
        </Menu.Item>
        <Menu.Item name='alarm'>
          <i className='icon mdi mdi-dialpad' />
          Alarm
        </Menu.Item>
        <Menu.Item name='climate'>
          <i className='icon mdi mdi-nest-thermostat' />
          Climate
        </Menu.Item>
        <Menu.Item name='lights'>
          <i className='icon mdi mdi-lightbulb' />
          Lights
        </Menu.Item>
        <Menu.Item name='garage'>
          <i className='icon mdi mdi-garage' />
          Garage
        </Menu.Item>
        <Menu.Item name='irrigation'>
          <i className='icon mdi mdi-water-pump' />
          Irrigation
        </Menu.Item>
      </Sidebar>
    );
  }
}
