import React from 'react';
import idx from 'idx';
import cx from 'classnames';
import { Container } from 'semantic-ui-react';

import './Alarm.scss';

const exitDelayDefault = 60;
const disarmDelayDefault = 30;

export default class Alarm extends React.Component {
  constructor() {
    super();
    this.state = {
      status: 'unknown',
      currentInput: ''
    };
  }

  _initializeAlarmPanel(props) {
    const { entities } = props;
    this._determineArmingState(entities);
  }

  _determineArmingState(entities) {
    const panelState = idx(entities, _ => _.sensor.alarm_panel_display.state) || '';
    const systemState = idx(entities, _ => _.alarm_control_panel.alarm_panel.state);
    const systemReady = idx(entities, _ => _.alarm_control_panel.alarm_panel.attributes.ready);

    if (systemState === 'triggered') {
      this.setState({ status: systemState });
    } else if (systemState === 'disarmed') {
      this.setState({ status: systemReady ? 'ready' : 'not_ready' });
    } else if (panelState.includes('DISARM SYSTEM')) {
      this.setState({ status: 'disarm_now' });
      this._startDisarmDelay();
    } else if (panelState.includes('You may exit now')) {
      this.setState({ status: `${systemState}_exit_now` });
      this._startExitDelay();
    } else {
      this.setState({ status: systemState });
    }
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
      clearTimeout(this.keypadTimeout);
      this.keypadTimeout = setTimeout(() => this._resetInput(), 10000);
    } else {
      this._sendCommand(key);
    }
  }

  _sendCommand(command) {
    const { connection } =  this.props;
    const actionToService = {
      off: 'alarm_disarm',
      away: 'alarm_arm_away',
      stay: 'alarm_arm_home',
      chime: 'alarmdecoder_alarm_toggle_chime'
    };

    if (this.state.currentInput.length === 4 && Object.keys(actionToService).includes(command)) {
      connection.callService('alarm_control_panel', actionToService[command], { code: this.state.currentInput });
    }

    this._resetInput();
  }

  _resetInput() {
    clearTimeout(this.keypadTimeout);
    this.setState({ currentInput: '' });
  }

  _startExitDelay() {
    if (!this.exitDelayTimer) {
      this.setState({ exitDelay: exitDelayDefault });
      this.exitDelayTimer = setInterval(() => {
        if (this.state.exitDelay === 0) {
          clearInterval(this.exitDelayTimer);
          this.exitDelayTimer = null;
        } else {
          this.setState({ exitDelay: this.state.exitDelay - 1 });
        }
      }, 1000);
    }
  }

  _startDisarmDelay() {
    if (!this.disarmDelayTimer) {
      this.setState({ disarmDelay: disarmDelayDefault });
      this.disarmDelayTimer = setInterval(() => {
        if (this.state.disarmDelay === 0) {
          clearInterval(this.disarmDelayTimer);
          this.disarmDelayTimer = null;
        } else {
          this.setState({ disarmDelay: this.state.disarmDelay -1 });
        }
      }, 1000);
    }
  }

  _generateSystemStatus() {
    let status, animation = false;
    switch (this.state.status) {
      case 'ready':
        status = 'System Ready';
        break;
      case 'not_ready':
        status = 'System Not Ready';
        break;
      case 'disarm_now':
        status = `Disarm Now (${this.state.disarmDelay})`;
        animation = this.state.disarmDelay < 11 ? 'tada' : 'pulse';
        break;
      case 'armed_home_exit_now':
      case 'armed_away_exit_now':
        status = `Arming System (${this.state.exitDelay})`;
        animation = 'pulse';
        break;
      case 'armed_home':
        status = 'System Armed - Stay';
        break;
      case 'armed_away':
        status = 'System Armed - Away';
        break;
      case 'triggered':
        status = 'ALARM TRIGGERED';
        animation = 'tada';
        break;
      default:
        status = 'Unknown';
        break;
    }

    return (
      <h1 className={cx({
        'system-status': true,
        [`alarm-${this.state.status}`]: true,
        animated: animation !== false,
        infinite: animation !== false,
        [animation]: true
      })}>
        {status}
      </h1>
    );
  }

  _generateButtons(buttons) {
    return buttons.map((key, i) => {
      let id, output, disabled = false;

      if (typeof key === 'object') {
        id = key.name;
        output = <i className={`mdi ${key.icon}`} />;
        disabled = key.disabled;
      } else {
        id = key;
        output = key;
        disabled = key === '';
      }

      return (
        <button key={i} className={`button-${id}`} onClick={this._handleKeypadEntry(id)} disabled={disabled}>
          {output}
        </button>
      );
    });
  }

  _generateCurrentInput() {
    return this.state.currentInput.split('').map((input, i) => <span key={i}>&bull;</span>);
  }

  componentWillReceiveProps(newProps) {
    this._initializeAlarmPanel(newProps);
  }

  componentDidMount() {
    this._initializeAlarmPanel(this.props);
  }

  render() {
    const { entities } = this.props;
    const chime = idx(entities, _ => _.alarm_control_panel.alarm_panel.attributes.chime);

    return (
      <Container id='alarm-panel'>
        <header>
          {this._generateSystemStatus()}
          <div className='input-status'>{this._generateCurrentInput()}</div>
        </header>
        <div className='alarm-control'>
          <div className='alarm-panic-chime'>
            {this._generateButtons([
              {
                name: 'chime',
                icon: `mdi-bell${!chime ? '-off' : ''}`,
                disabled: !['ready', 'not_ready'].includes(this.state.status)
              }
            ])}
          </div>
          <div className='alarm-keypad'>{this._generateButtons([1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, { name: 'backspace', icon: 'mdi-backspace' }])}</div>
          <div className='alarm-mode'>{this._generateButtons(['off', 'stay', 'away'])}</div>
        </div>
      </Container>
    );
  }
}
