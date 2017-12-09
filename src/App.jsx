import React from 'react';
import Moment from 'react-moment';
import { createConnection, subscribeEntities } from 'home-assistant-js-websocket';
import config from './config.json';

import Presence from './Presence/Presence';
import Lights from './Lights/Lights';

import '../style/main.scss';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      hass: {
        connection: false,
        error: false,
        lastUpdate: false,
        entities: {}
      }
    };
  }

  _cleanEntityKeys(entities) {
    return Object.keys(entities).reduce((processedEntities, entity) => {
      const splitEntity = entity.split('.', 2);
      if (!processedEntities[splitEntity[0]]) {
        processedEntities[splitEntity[0]] = {};
      }
      processedEntities[splitEntity[0]][splitEntity[1]] = entities[entity];
      return processedEntities;
    }, {});
  }

  _connectToHass() {
    createConnection(`ws${config.hass.ssl ? 's' : ''}://${config.hass.basePath}/api/websocket`, { authToken: config.hass.apiKey })
      .then(connection => subscribeEntities(connection, entities => {
        this.setState({
          hass: {
            connection,
            lastUpdate: new Date(),
            entities: this._cleanEntityKeys(entities)
          }
        });
      }))
      .catch(error => {
        this.setState({
          hass: {
            connection: false,
            lastUpdate: new Date(),
            error
          }
        });
      });
  }

  componentWillMount() {
    this._connectToHass();
  }

  render() {
    let lastUpdate;

    if (this.state.hass.lastUpdate) {
      lastUpdate = <p>Last Updated: <Moment date={this.state.hass.lastUpdate} /></p>;
    }

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Home Assistant</h1>
          <p>Connection to Home Assistant: {this.state.hass.connection ? 'Connected' : 'Disconnected'}</p>
          <p>There are {Object.keys(this.state.hass.entities).length} subscribed event groups.</p>
        </header>
        <Presence
          devices={this.state.hass.entities.device_tracker}
          binarySensors={this.state.hass.entities.binary_sensor}
          sensors={this.state.hass.entities.sensor}
        />
        <hr />
        <Lights
          connection={this.state.hass.connection}
          groups={this.state.hass.entities.group}
          lights={this.state.hass.entities.light}
          fans={this.state.hass.entities.fan}
          switches={this.state.hass.entities.switch}
        />
        <hr />
        {lastUpdate}
      </div>
    );
  }
}