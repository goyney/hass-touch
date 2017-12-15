import React from 'react';
import { createConnection, subscribeEntities } from 'home-assistant-js-websocket';
import { Container, Sidebar } from 'semantic-ui-react';

import config from './config.json';

import ControlPanel from './ControlPanel/ControlPanel';
import Home from './Home/Home';
import Alarm from './Alarm/Alarm';
import Climate from './Climate/Climate';
import Garage from './Garage/Garage';
import Irrigation from './Irrigation/Irrigation';
import Lights from './Lights/Lights';

import 'mdi/css/materialdesignicons.min.css';
import 'semantic-ui-css/semantic.min.css';
import 'style/main.scss';

const pages = {
  home: Home,
  alarm: Alarm,
  climate: Climate,
  lights: Lights,
  garage: Garage,
  irrigation: Irrigation
};

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      hass: {
        connection: false,
        error: false,
        lastUpdate: false,
        entities: {}
      },
      activePage: 'home'
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

  _changePage = (e, { name }) => {
    this.setState({ activePage: name });
  };

  componentDidMount() {
    this._connectToHass();
  }

  render() {
    const PageComponent = pages[this.state.activePage];

    return (
      <Sidebar.Pushable>
        <ControlPanel
          activePage={this.state.activePage}
          changePage={this._changePage}
        />
        <Sidebar.Pusher as={Container.fluid} className='information-panel'>
          <PageComponent entities={this.state.hass.entities} />
          {/* <header>
            <h1>Home Assistant</h1>
            <p>Connection to Home Assistant: {this.state.hass.connection ? 'Connected' : 'Disconnected'}</p>
            <p>There are {Object.keys(this.state.hass.entities).length} subscribed event groups.</p>
          </header>
          <Lights
            connection={this.state.hass.connection}
            groups={this.state.hass.entities.group}
            lights={this.state.hass.entities.light}
            fans={this.state.hass.entities.fan}
            switches={this.state.hass.entities.switch}
          /> */}
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  }
}
