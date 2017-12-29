import React from 'react';
import Sound from 'react-sound';
import idx from 'idx';

import beep from './quick-beep.wav';
import chime from './chime.wav';
import disarm from './disarm.wav';

// Notifications can exist in a few ways:
// * Sound only (e.g. Alarm Chime when door opens)
// * Sound + Redirection to a specific panel (e.g. Alarm goes into Disarm state)
// * Sound + Pop-up notification (e.g. Garage Door left open for x time)
// * Redirection to specific panel only
// * Pop-up notification only

const soundsDefinition = { beep, chime, disarm };

export default class Notifications extends React.Component {
  constructor() {
    super();
    this.state = this._preloadState();
  }

  _preloadState() {
    return Object.keys(soundsDefinition).reduce((sounds, soundId) => {
      sounds[soundId] = {
        status: 'STOPPED',
        loop: false
      };
      return sounds;
    }, {});
  }

  _preloadDOM() {
    return Object.keys(soundsDefinition).map(soundId => {
      return (
        <Sound
          key={soundId}
          url={soundsDefinition[soundId]}
          playStatus={this.state[soundId].status}
          onFinishedPlaying={() => this._stopSound(soundId)}
          loop={this.state[soundId].loop}
          autoLoad
        />
      );
    });
  }

  _playSound(soundId, loop = false) {
    this.setState({
      [soundId]: {
        status: 'PLAYING',
        loop
      }
    });
  }

  _stopSound(soundId) {
    this.setState({
      [soundId]: {
        status: 'STOPPED',
        loop: false
      }
    });
  }

  _showPanel(panelId) {
    const { changePage } = this.props;
    changePage(null, { name: panelId });
  }

  componentWillReceiveProps(newProps) {
    const entities = newProps.hass.entities;

    // Alarm chime status is toggled
    const oldChimeState = idx(this.props.hass.entities, _ => _.alarm_control_panel.alarm_panel.attributes.chime);
    const newChimeState = idx(newProps.hass.entities, _ => _.alarm_control_panel.alarm_panel.attributes.chime);
    if (typeof oldChimeState !== 'undefined' && oldChimeState !== newChimeState) {
      this._playSound('beep');
    }

    // Alarm state changes
    const oldAlarmState = idx(this.props.hass.entities, _ => _.alarm_control_panel.alarm_panel.state);
    const newAlarmState = idx(newProps.hass.entities, _ => _.alarm_control_panel.alarm_panel.state);
    if (typeof oldAlarmState !== 'undefined' && oldAlarmState !== newAlarmState) {
      if (oldAlarmState === 'disarmed') {
        this._playSound('chime');
      } else {
        this._playSound('beep');
      }
    }

    // Alarm doors or windows are faulted while alarm is off and chime is on
    if (newAlarmState === 'disarmed' && newChimeState) {
      const binarySensors = idx(newProps.hass.entities, _ => _.binary_sensor);
      const monitoredBinarySensors = Object.keys(binarySensors).filter(sensor => binarySensors[sensor].attributes.device_class === 'opening');

      const ringChime = monitoredBinarySensors.reduce((ringChime, sensor) => {
        const oldBinarySensor = idx(this.props.hass.entities, _ => _.binary_sensor[sensor].state);
        const newBinarySensor = idx(newProps.hass.entities, _ => _.binary_sensor[sensor].state);
        return typeof oldBinarySensor !== 'undefined' && oldBinarySensor === 'off' && newBinarySensor === 'on';
      }, false);

      if (ringChime) {
        this._playSound('chime');
      }
    }

    // Alarm needs to be disarmed
    if (newAlarmState !== 'disarmed') {
      const panelState = idx(newProps.hass.entities, _ => _.sensor.alarm_panel_display.state) || '';
      if (panelState.includes('DISARM SYSTEM')) {
        this._playSound('disarm', true);
        this._showPanel('alarm');
      }
    } else {
      this._stopSound('disarm');
    }
  }

  render() {
    return (
      <div className='sound-container'>{this._preloadDOM()}</div>
    );
  }
}
