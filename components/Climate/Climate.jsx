import React from 'react';
import idx from 'idx';
import { Container } from 'semantic-ui-react';
import Thermostat from 'Thermostat/Thermostat';

import './Climate.scss';

export default class Climate extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  _initializeClimatePanel(props) {
    const { entities } = props;
    const {
      away_mode,
      current_temperature,
      target_temp_high,
      target_temp_low,
      temperature
    } = idx(entities, _ => _.climate.entryway.attributes) || {};

    this.setState({
      away: away_mode === 'on',
      leaf: idx(entities, _ => _.binary_sensor.entryway_thermostat_has_leaf.state) === 'on' || false,
      fan: idx(entities, _ => _.binary_sensor.entryway_thermostat_fan.state) === 'on' || false,
      hvacState: idx(entities, _ => _.sensor.entryway_thermostat_hvac_state.state),
      operationMode: idx(entities, _ => _.sensor.entryway_thermostat_operation_mode.state),
      currentTemperature: current_temperature,
      targetTemperature: !temperature ? [ target_temp_low, target_temp_high ] : [ temperature ],
      insideHumidity: idx(entities, _ => _.sensor.entryway_thermostat_humidity.state)
    });
  }

  componentWillReceiveProps(newProps) {
    this._initializeClimatePanel(newProps);
  }

  componentDidMount() {
    this._initializeClimatePanel(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(this.state) !== JSON.stringify(nextState);
  }

  render() {
    return (
      <Container id='climate-panel'>
        <div className='thermostat-control'>
          <Thermostat
            away={this.state.away}
            ambientTemperature={this.state.currentTemperature}
            targetTemperature={this.state.targetTemperature}
            mode={this.state.operationMode}
            state={this.state.hvacState}
            fan={this.state.fan}
            leaf={this.state.leaf}
          />
        </div>
      </Container>
    );
  }
}
