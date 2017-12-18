import React from 'react';
import idx from 'idx';
import cx from 'classnames';
import { Container } from 'semantic-ui-react';

import './Alarm.scss';

const actionsToNumber = {
  off: 1,
  away: 2,
  stay: 3,
  chime: 9
};

export default class Alarm extends React.Component {
  constructor() {
    super();
    this.state = {
      currentInput: ''
    };
  }

  _handleKeypadEntry = key => () => {
    const numberPressed = !isNaN(parseFloat(key)) && isFinite(key);
    if (numberPressed || key === 'backspace') {
      let currentInput = this.state.currentInput;
      if (key === 'backspace') {
        currentInput = currentInput.slice(0, -1);
      } else if (currentInput.length < 4) {
        currentInput = `${currentInput}${key}`;
      }

      this.setState({ currentInput });
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this._resetInput(), 10000);
    } else {
      this._sendCommand(key);
    }
  }

  _sendCommand(command) {
    if (this.state.currentInput.length === 4) {
      console.log('SENDING COMMAND', command, this.state.currentInput);
    }

    this._resetInput();
  }

  _resetInput() {
    clearTimeout(this.timeout);
    this.setState({ currentInput: '' });
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
        <button key={i} className={`button-${id}`} onClick={this._handleKeypadEntry(id)} disabled={key === ''}>
          {output}
        </button>
      );
    });
  }

  _generateCurrentInput() {
    return this.state.currentInput.split('').map((input, i) => <span key={i}>&bull;</span>);
  }

  render() {
    const { entities } = this.props;
    const chime = idx(entities, _ => _.alarm_control_panel.alarm_panel.attributes.chime);

    return (
      <Container id='alarm-panel'>
        <header>
          {this._determineSystemStatus()}
          <div className='input-status'>{this._generateCurrentInput()}</div>
        </header>
        <div className='alarm-control'>
          <div className='alarm-panic-chime'>{this._generateButtons([{ name: 'chime', icon: `mdi-bell${!chime ? '-off' : ''}` }])}</div>
          <div className='alarm-keypad'>{this._generateButtons([1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, { name: 'backspace', icon: 'mdi-backspace' }])}</div>
          <div className='alarm-mode'>{this._generateButtons(['off', 'stay', 'away'])}</div>
        </div>
      </Container>
    );
  }
}
