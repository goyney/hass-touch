import React from 'react';
import idx from 'idx';
import cx from 'classnames';
import { Container } from 'semantic-ui-react';

import './Alarm.scss';

export default class Alarm extends React.Component {
  _handleKeypadEntry = key => () => {
    console.log('Pressed', key);
  }

  _determineSystemStatus() {
    const { entities } = this.props;
    const systemReady = idx(entities, _ => _.alarm_control_panel.alarm_panel.attributes.ready);
    return <h1 className={`system-status alarm-${!systemReady ? 'not-' : ''}ready`}>System {!systemReady ? 'Not ' : ''}Ready</h1>;
  }

  _generateButtons(buttons) {
    return buttons.map((key, i) => {
      let id, output;

      if (typeof key === 'object') {
        id = key.name;
        output = <i className={`mdi ${key.icon}`} />;
      } else {
        id = key;
        output = key;
      }

      return (
        <button
          key={i}
          className={`button-${id}`}
          onClick={this._handleKeypadEntry(id)}
        >
          {output}
        </button>
      );
    });
  }

  render() {
    const { entities } = this.props;
    const chime = idx(entities, _ => _.alarm_control_panel.alarm_panel.attributes.chime);

    return (
      <Container id='alarm-panel'>
        <header>
          {this._determineSystemStatus()}
          <div id='input-status'></div>
        </header>
        <div className='alarm-control'>
          <div className='alarm-panic-chime'>{this._generateButtons([{ name: 'chime', icon: `mdi-bell${!chime ? '-off' : ''}` }, 'panic'])}</div>
          <div className='alarm-keypad'>{this._generateButtons([1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'])}</div>
          <div className='alarm-mode'>{this._generateButtons(['off', 'stay', 'away'])}</div>
        </div>
      </Container>
    );
  }
}
