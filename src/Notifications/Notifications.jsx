import React from 'react';
import Sound from 'react-sound';
import idx from 'idx';

import config from '../config.json';

import beep from './beep.wav';

// Notifications can exist in a few ways:
// * Sound only (e.g. Alarm Chime when door opens)
// * Sound + Redirection to a specific panel (e.g. Alarm goes into Disarm state)
// * Sound + Pop-up notification (e.g. Garage Door left open for x time)
// * Redirection to specific panel only
// * Pop-up notification only

const soundsDefinition = {
  notification: `/dist/${beep}`
};

export default class Notifications extends React.Component {
  constructor() {
    super();
    this.state = this._preloadState();
  }

  _preloadState() {
    return Object.keys(soundsDefinition).reduce((sounds, soundId) => {
      sounds[soundId] = 'STOPPED';
      return sounds;
    }, {});
  }

  _preloadDOM() {
    return Object.keys(soundsDefinition).map(soundId => {
      return (
        <Sound
          key={soundId}
          url={soundsDefinition[soundId]}
          playStatus={this.state[soundId]}
          onFinishedPlaying={() => this._stopSound(soundId)}
          autoLoad
        />
      );
    });
  }

  _playSound(soundId) {
    this.setState({ [soundId]: 'PLAYING' });
  }

  _stopSound(soundId) {
    this.setState({ [soundId]: 'STOPPED' });
  }

  componentWillReceiveProps(newProps) {
    const rules = config.notifications || [];
    const entities = newProps.hass.entities;

    rules.forEach(rule => {
      const { name = 'Unnamed', trigger, condition, action } = rule;
      if (typeof trigger !== 'undefined' && typeof action !== 'undefined') {
        const triggerEntity = (trigger.entity || '').split('.');

        if (triggerEntity[0] in entities) {
          console.log('Yeah its there');
        }

        if (triggerEntity[1]) {
          if (triggerEntity[1] in entities[triggerEntity[0]]) {
            console.log('Part 2 is there');
          } else if (triggerEntity[1] === '*') {
            console.log('Watch all services in this domain, state only unless there is an attributes value next');
          }
        } else {
          // Watch all service in this domain, state only
        }

        if (triggerEntity[2] === 'attributes') {
          console.log('Looking at attributes');

          if (triggerEntity[3]) {
            console.log('And we have the attribute name', triggerEntity[3]);
          }
        }

        console.log(entities);
        console.log(triggerEntity);

      }
    });

    // const oldChimeState = idx(this.props.hass.entities, _ => _.alarm_control_panel.alarm_panel.attributes.chime);
    // const newChimeState = idx(newProps.hass.entities, _ => _.alarm_control_panel.alarm_panel.attributes.chime);
    // if (typeof oldChimeState !== 'undefined' && oldChimeState !== newChimeState) {
    //   this._playSound('notification');
    // }
  }

  render() {
    return (
      <div className='sound-container'>{this._preloadDOM()}</div>
    );
  }
}
