import React from 'react';
import moment from 'moment-business-days';
import config from '../config.json';

import './Presence.scss';

export default class Presence extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mike: {},
      lauren: {}
    };
  }

  _determineElapsedTime(sensor) {
    let lastChanged = moment(sensor.last_changed).format('YYYY-MM-DD HH:mm:ss.SSSSSSZ');
    let howLongMins = moment().diff(lastChanged, 'minutes');
    if (howLongMins === 0) {
      return 'Moments ago';
    } else if (howLongMins < 60) {
      return `For ${howLongMins} minute${howLongMins > 1 ? 's' : ''}`;
    } else if (howLongMins < 1440) {
      let howLongHours = Math.floor(howLongMins / 60);
      return `For ${howLongHours} hour${howLongHours > 1 ? 's' : ''}`;
    } else if (howLongMins > 1441) {
      let howLongDays = Math.floor((howLongMins / 60) / 24);
      return `For ${howLongDays} day${howLongDays > 1 ? 's' : ''}`;
    }
  }

  _determineBatteryLevel(batteryLevel) {
    const level = Math.floor(batteryLevel / 10) * 10;
    if (level === 100) {
      return;
    } else if (level === 0) {
      return '-outline';
    }
    return `-${level}`;
  }

  _updateFamilyStatus(family = {}) {
    Object.keys(family).forEach(member => {
      let status, state;
      if (family[member].device.state !== 'home') {
        state = 'out';
        status = this._determineElapsedTime(family[member].device);
      } else if (family[member].sleep.state !== 'off') {
        state = 'sleeping';
        status = this._determineElapsedTime(family[member].sleep);
      } else {
        state = 'in';
        if (moment().isBusinessDay() && moment().isBetween(moment('02:00:00', 'hh:mm:ss'), moment('11:00:00', 'hh:mm:ss'))) {
          status = `${family[member].travel.work.state} mins to work`;
        }
      }

      this.setState({
        [member]: {
          name: family[member].device.attributes.friendly_name,
          icon: `http${config.hass.ssl ? 's' : ''}://${config.hass.basePath}${family[member].device.attributes.icon}`,
          battery: this._determineBatteryLevel(family[member].device.attributes.battery),
          state,
          status
        }
      });
    });
  }

  componentWillReceiveProps(newProps) {
    const { devices, binarySensors, sensors } = newProps;

    const family = {
      mike: {
        device: devices.mnl_mike,
        sleep: binarySensors.sleepnumber_lauren_mike_is_in_bed,
        travel: {
          work: sensors.mike_to_work
        }
      },
      lauren: {
        device: devices.mnl_lauren,
        sleep: binarySensors.sleepnumber_lauren_lauren_is_in_bed,
        travel: {
          work: sensors.lauren_to_work
        }
      }
    };

    this._updateFamilyStatus(family);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render() {
    return (
      <div>
        <h3>Family Tracking</h3>
        <p>
          <img src={this.state.mike.icon} alt={this.state.mike.name} style={{ width: '32px', height: '32px'}} />
          {this.state.mike.name}: {this.state.mike.state} {this.state.mike.status}
          <i className={`mdi mdi-battery${this.state.mike.battery}`} />
        </p>
        <p>
          <img src={this.state.lauren.icon} alt={this.state.lauren.name} style={{ width: '32px', height: '32px'}} />
          {this.state.lauren.name}: {this.state.lauren.state} {this.state.lauren.status}
          <i className={`mdi mdi-battery${this.state.lauren.battery}`} />
        </p>
      </div>
    );
  }
}
