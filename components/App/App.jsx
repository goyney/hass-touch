import React from 'react';
import { createConnection, subscribeEntities } from 'home-assistant-js-websocket';
import { Container, Sidebar } from 'semantic-ui-react';
import Transition from 'react-transition-group/Transition';

import config from 'config.json';

import Loading from 'Loading/Loading';
import ControlPanel from 'ControlPanel/ControlPanel';
import Notifications from 'Notifications/Notifications';
import Home from 'Home/Home';
import Alarm from 'Alarm/Alarm';
import Climate from 'Climate/Climate';
import Garage from 'Garage/Garage';
import Irrigation from 'Irrigation/Irrigation';
import Lights from 'Lights/Lights';

import 'mdi/css/materialdesignicons.min.css';
import 'semantic-ui-css/semantic.min.css';
import 'animate.css/animate.min.css';
import './App.scss';

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
    const queryParams = this._getQueryParams();
    this.state = {
      hass: {
        connection: false,
        error: false,
        lastUpdate: false,
        entities: {}
      },
      activePage: queryParams.page || 'home'
    };
  }

  _getQueryParams() {
    const query = window.location.search;
    return (/^[?#]/.test(query) ? query.slice(1) : query)
      .split('&')
      .reduce((params, param) => {
        let [ key, value ] = param.split('=');
        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
        return params;
      }, { });
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
    if (this.state.activePage !== name) {
      this.setState({ activePage: name });
    }
  };

  componentDidMount() {
    // setTimeout(() => this._connectToHass(), 5500);
    this._connectToHass();
  }

  render() {
    const PageComponent = pages[this.state.activePage];

    return (
      <div className="touch-container">
        <Sidebar.Pushable>
          <Transition in={this.state.hass.lastUpdate === false} timeout={1000} unmountOnExit>
            {(state) => <Loading className={`fade-${state}`} />}
          </Transition>
          <ControlPanel
            activePage={this.state.activePage}
            changePage={this._changePage}
          />
          <Sidebar.Pusher as={Container.fluid} className='information-panel'>
            <PageComponent connection={this.state.hass.connection} entities={this.state.hass.entities} />
          </Sidebar.Pusher>
        </Sidebar.Pushable>
        <Notifications
          hass={this.state.hass}
          changePage={this._changePage}
        />
      </div>
    );
  }
}
