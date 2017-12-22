import React from 'react';
import { Container } from 'semantic-ui-react';
import Moment from 'react-moment';

import Weather from 'Weather/Weather';
import Presence from 'Presence/Presence';

import './Home.scss';

export default class Home extends React.Component {
  render() {
    const { entities } = this.props;

    return (
      <Container id='home-panel'>
        <div className='time-weather'>
          <div className='today-date'>
            <Moment format='dddd, MMMM D' interval={1000} />
            <Moment
              element='sup'
              filter={(e) => e.replace(/[^a-z]/g, '')}
              format='Do'
              interval={1000}
            />
          </div>
          <div className='current-time-weather'>
            <Moment className='current-time' format='h:mm' interval={1000} />
            <Weather className='current-weather' sensors={entities.sensor} />
          </div>
        </div>
        <Presence
          className='presence-container'
          binarySensors={entities.binary_sensor}
          devices={entities.device_tracker}
          sensors={entities.sensor}
        />
      </Container>
    );
  }
}
