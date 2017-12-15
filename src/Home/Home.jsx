import React from 'react';
import { Container } from 'semantic-ui-react';
import Moment from 'react-moment';

import Weather from './Weather';
import Presence from './Presence';

export default class Home extends React.Component {
  render() {
    const { entities } = this.props;

    return (
      <Container fluid>
        <div className='time-weather'>
          <div className='today-date'>
            <Moment format='dddd, MMMM D' interval={1000} />
            <Moment
              className='ordinal'
              element='span'
              filter={(e) => e.replace(/[^a-z]/g, '')}
              format='Do'
              interval={1000}
            />
          </div>
          <div className='current-time-weather'>
            <Moment format='h:mm' interval={1000} />
            <Weather sensors={entities.sensor} />
          </div>
        </div>
        <Presence
          binarySensors={entities.binary_sensor}
          devices={entities.device_tracker}
          sensors={entities.sensor}
        />
      </Container>
    );
  }
}
