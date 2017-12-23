import React from 'react';
import idx from 'idx';
import moment from 'moment';

import config from 'config.json';
import determineElapsedTime from 'utils/elapsedTime';

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

  _determineWorkTravelTime(sensor) {
    const isBusinessDay = ![0, 6].includes(moment().format('e'));
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
        info: determineElapsedTime(member.device.last_changed)
      };
    } else if (idx(member.binarySensors, _ => _.sleep) && member.binarySensors.sleep.state !== 'off') {
      return {
        state: 'sleeping',
        info: determineElapsedTime(member.binarySensors.sleep.last_changed)
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
