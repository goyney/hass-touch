import React from 'react';
import idx from 'idx';
import moment from 'moment-business-days';
import config from '../config.json';

import './Presence.scss';

export default class Presence extends React.Component {
  _curatePresence() {
    const { devices = {}, binarySensors = {}, sensors = {} } = this.props;

    if (config.presence) {
      return Object.keys(devices).reduce((monitoredDevices, deviceId) => {
        if (config.presence.devices && deviceId.startsWith(config.presence.devices.prefix)) {
          const deviceName = deviceId.split(config.presence.devices.prefix)[1];
          const monitoredEntities = {};
          ['binarySensors', 'sensors'].forEach((entity) => {
            monitoredEntities[entity] = {};
            if (config.presence[entity] && Object.keys(config.presence[entity]).length > 0) {
              monitoredEntities[entity] = Object.keys(config.presence[entity]).reduce((entities, entityId) => {
                const entityName = `${config.presence[entity][entityId].prefix || ''}${deviceName}${config.presence[entity][entityId].suffix || ''}`;
                if (entityName in this.props[entity]) {
                  entities[entityId] = this.props[entity][entityName];
                }
                return entities;
              }, {});
            }
          });
          monitoredDevices[deviceName] = Object.assign({ device: devices[deviceId] }, monitoredEntities);
        }
        return monitoredDevices;
      }, {});
    }
    return {};
  }

  _determineElapsedTime(sensor) {
    const lastChanged = moment(sensor.last_changed).format('YYYY-MM-DD HH:mm:ss.SSSSSSZ');
    const howLongMins = moment().diff(lastChanged, 'minutes');
    if (howLongMins === 0) {
      return 'Moments ago';
    } else if (howLongMins < 60) {
      return `For ${howLongMins} minute${howLongMins > 1 ? 's' : ''}`;
    } else if (howLongMins < 1440) {
      const howLongHours = Math.floor(howLongMins / 60);
      return `For ${howLongHours} hour${howLongHours > 1 ? 's' : ''}`;
    } else if (howLongMins > 1441) {
      const howLongDays = Math.floor((howLongMins / 60) / 24);
      return `For ${howLongDays} day${howLongDays > 1 ? 's' : ''}`;
    }
  }

  _determineWorkTravelTime(sensor) {
    const isBusinessDay = moment().isBusinessDay();
    const isDisplayHours = moment().isBetween(moment('02:00:00', 'hh:mm:ss'), moment('11:00:00', 'hh:mm:ss'));
    if (sensor && isBusinessDay && isDisplayHours) {
      return `${sensor.state} mins to work`;
    }
    return;
  }

  _determineMemberStatus(member) {
    if (member.device.state !== 'home') {
      return {
        state: 'out',
        info: this._determineElapsedTime(member.device)
      };
    } else if (idx(member.binarySensors, _ => _.sleep) && member.binarySensors.sleep.state !== 'off') {
      return {
        state: 'sleeping',
        info: this._determineElapsedTime(member.binarySensors.sleep)
      };
    } else {
      return {
        state: 'in',
        info: this._determineWorkTravelTime(member.sensors.travelWork)
      }
    }
  }

  _displayFamilyPresence() {
    const family = this._curatePresence();
    return Object.keys(family).map(member => {
      const name = family[member].device.attributes.friendly_name;
      const icon = `http${config.hass.ssl ? 's' : ''}://${config.hass.basePath}${family[member].device.attributes.icon}`;
      const status = this._determineMemberStatus(family[member]);

      return (
        <div key={member}>
          <div className="presence-icon">
            <img src={icon} alt={name} />
          </div>
          <div className="presence-info">
            <p className='presence-name'>{name}</p>
            <p className='presence-state'>{status.state}</p>
            <p className='presence-status'>{status.info}</p>
          </div>
        </div>
      );
    });
  }

  render() {
    const { className } = this.props;

    return <div className={className}>{this._displayFamilyPresence()}</div>;
  }
}
