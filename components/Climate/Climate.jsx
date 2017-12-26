import React from 'react';
import idx from 'idx';
import cx from 'classnames';
import { Container, Dropdown } from 'semantic-ui-react';
import Thermostat from 'Thermostat/Thermostat';

import './Climate.scss';

const air = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 511.6"><g><path className="top" d="M517.8,383.8c-39.2,29.5-76.6,45.9-117.5,45.9c-51.2,0-99.7-23-153.5-74.1c-61.4-58.8-127.9-109.9-194.4-109.9c-12.8,0-25.6,2.6-38.4,5.1c-2.4,0.5-6.1,0.6-7.6-2.6c-1.6-3.3-0.2-5.4,2.6-7.6c38.3-30.7,76.7-46,117.6-46c51.2,0,99.7,23,153.5,74.1c61.4,58.8,127.9,109.9,194.4,109.9c12.8,0,25.6-2.6,38.3-5.1c2.7-0.5,5.8-1,7.6,2.6C522.4,379.3,520,382.2,517.8,383.8z M88.4,335.1c38.3,0,76.7,18,115.1,56.3c46,43.5,97.2,84.3,145.8,84.3c10.2,0,20.5-2.6,28.2-5.1c2.5-0.8,4.9-0.2,6.1,2.1c1.3,2.4,0,4.8-1.1,5.7c-28.2,22.9-58.8,33.2-86.9,33.2c-38.3,0-76.7-18-115.1-56.3c-46-43.5-97.2-84.3-145.8-84.3c-10.2,0-20.5,2.6-28.2,5.1c-1.6,0.6-4.4,0.7-5.8-2.1c-1.4-2.7-0.3-4.9,0.8-5.6C29.9,348.4,57.7,335.1,88.4,335.1L88.4,335.1z" /><path className="bottom" d="M610.1,143.3c-28.2,23-58.8,33.2-87,33.2c-38.3,0-76.7-18-115.1-56.3c-46-43.5-97.2-84.3-145.8-84.3c-10.2,0-20.5,2.6-28.2,5.1c-2.2,0.7-4.5,0.1-5.7-2.2c-1.2-2.1-0.4-4.6,0.7-5.5c28.3-22.9,58.9-33.2,87-33.2c38.3,0,76.7,18,115.1,56.3c46,43.5,97.2,84.3,145.8,84.3c10.2,0,20.5-2.6,28.2-5.1c2.2-0.7,4.1-0.6,5.8,1.1C612.5,138.6,612.5,141.4,610.1,143.3L610.1,143.3z M364.6,156.1C426,214.9,492.5,266,559,266c12.8,0,25.6-2.6,38.3-5.1c2.8-0.5,5.8-0.6,7.6,2.6c1.9,3.2-0.6,6.2-2.6,7.6c-38.3,30.7-76.7,46-117.6,46c-51.2,0-99.7-23-153.5-74.1c-61.4-58.8-127.9-109.9-194.4-109.9c-12.8,0-25.6,2.6-38.3,5.1c-2.6,0.4-6.3,0.3-7.6-2.6c-1.4-2.9,0-5.1,2.6-7.6c38.3-30.7,76.7-46,117.6-46C262.3,81.9,310.8,105,364.6,156.1L364.6,156.1z" /></g></svg>
);

export default class Climate extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  _initializeClimatePanel(props) {
    const { entities } = props;
    const lastUpdated = idx(entities, _ => _.climate.entryway.last_updated);

    const {
      away_mode,
      current_temperature,
      target_temp_high,
      target_temp_low,
      temperature
    } = idx(entities, _ => _.climate.entryway.attributes) || {};

    this.setState({
      lastUpdated,
      away: away_mode === 'on',
      leaf: idx(entities, _ => _.binary_sensor.entryway_thermostat_has_leaf.state) === 'on' || false,
      fan: idx(entities, _ => _.binary_sensor.entryway_thermostat_fan.state) === 'on' || false,
      hvacState: idx(entities, _ => _.sensor.entryway_thermostat_hvac_state.state),
      operationMode: idx(entities, _ => _.sensor.entryway_thermostat_operation_mode.state),
      currentTemperature: current_temperature,
      targetTemperature: !temperature ? [ target_temp_low, target_temp_high ] : [ temperature ],
      outsideTemperature: Math.round(idx(entities, _ => _.sensor.dark_sky_temperature.state)),
      insideHumidity: idx(entities, _ => _.sensor.entryway_thermostat_humidity.state)
    });
  }

  _generateModeMenu() {
    const modes = [ 'heat', 'cool', 'heat-cool', 'off' ];
    const options = modes.reduce((options, mode) => {
      options.push({
        key: mode,
        value: mode,
        text: <div key={mode} className={`mode-option ${mode}`}>{air}<p>{mode.replace('heat-cool', 'Cool • Heat')}</p></div>
      });
      return options;
    }, []);

    if (this.state.operationMode) {
      return <Dropdown
        className='set-hvac-state'
        header='Set thermostat to:'
        defaultValue={this.state.operationMode}
        options={options}
        upward
        onChange={(e, value) => {
          console.log('VALUE', value.value);
        }}
      />;
    }
  }

  _generateTemperatureButtonGroup(mode, hideHeading = false) {
    return (
      <div key={`${mode}-controls`} className='control-buttons'>
        {!hideHeading && <h3>{mode}</h3>}
        <button key={`${mode}-up`}>
          <i className='mdi mdi-arrow-up-bold' />
        </button>
        <button key={`${mode}-down`}>
          <i className='mdi mdi-arrow-down-bold' />
        </button>
      </div>
    );
  }

  _generateTemperatureControlButtons() {
    const buttons = [];
    if (this.state.operationMode === 'heat-cool') {
      buttons.push(this._generateTemperatureButtonGroup('cool'));
      buttons.push(this._generateTemperatureButtonGroup('heat'));
    } else if (this.state.operationMode !== 'off') {
      buttons.push(this._generateTemperatureButtonGroup(this.state.operationMode, true));
    }
    return <div className='temperature-controls'>{buttons}</div>;
  }

  _toggleFan = () => {
    const { connection } = this.props;
    connection.callService('climate', 'set_fan_mode', { fan_mode: this.state.fan === 'on' ? false : true })
      .then(() => this.setState({ fan: !this.state.fan }));
  }

  componentWillReceiveProps(newProps) {
    this._initializeClimatePanel(newProps);
  }

  componentDidMount() {
    this._initializeClimatePanel(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.lastUpdated !== nextState.lastUpdated;
  }

  render() {
    return (
      <Container id='climate-panel'>
        <div className='thermostat-face'>
          <Thermostat
            away={this.state.away}
            ambientTemperature={this.state.currentTemperature}
            targetTemperature={this.state.targetTemperature}
            mode={this.state.operationMode}
            state={this.state.hvacState}
            fan={this.state.fan}
            leaf={this.state.leaf}
          />
          <div className='thermostat-stats'>
            <div>
              <p>{this.state.insideHumidity}%</p>
              <label>Inside Humidity</label>
            </div>
            <div>
              <p>{this.state.outsideTemperature}&deg;</p>
              <label>Outside Temp.</label>
            </div>
          </div>
        </div>
        <div className='thermostat-controls'>
          {this._generateTemperatureControlButtons()}
          <div className='mode-fan'>
            {this._generateModeMenu()}
            <button
              className='set-fan-mode'
              onClick={this._toggleFan}
            >
              <i className={cx({
                mdi: true,
                'mdi-fan': !this.state.fan,
                'mdi-fan-off': this.state.fan
              })} />
            </button>
          </div>
        </div>
      </Container>
    );
  }
}
