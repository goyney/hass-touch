import React from 'react';
import idx from 'idx';
import { Container } from 'semantic-ui-react';
import Thermostat from 'Thermostat/Thermostat';

import './Climate.scss';

export default class Climate extends React.Component {
  render() {
    const { entities } = this.props;
    console.log(idx(entities, _ => _.climate.entryway.attributes));

    // When in cool or heat mode, the set temperature is `temperature`
    // When in heat/cool mode, the set temperatures are `target_temp_high` and `taget_temp_low`

    const { away_mode, current_temperature, target_temp_high, target_temp_low, temperature, operation_mode } = idx(entities, _ => _.climate.entryway.attributes) || {};

    return (
      <Container id='climate-panel'>
        <div className='thermostat-control'>
          <Thermostat
            away={false}
            ambientTemperature={current_temperature}
            targetTemperature={temperature}
            mode={operation_mode}
          />
        </div>
      </Container>
    );
  }
}
