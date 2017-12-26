import React from 'react';
import idx from 'idx';

import './Weather.scss';

const icons = {
  'clear-day': 'sunny',
  'clear-night': 'night',
  'partly-cloudy-day': 'partlycloudy',
  'partly-cloudy-night': 'cloudy',
  cloudy: 'cloudy',
  rain: 'pouring',
  sleet: 'snowy-rainy',
  snow: 'snowy',
  wind: 'windy',
  fog: 'fog'
};

export default class Weather extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  _initializeWeather(props) {
    const { entities } = props;
    const icon = icons[idx(entities, _ => _.sensor.dark_sky_icon.state)];
    const currentTemp = Math.round(idx(entities, _ => _.sensor.dark_sky_temperature.state));
    const highTemp = Math.round(idx(entities, _ => _.sensor.dark_sky_daily_high_temperature.state));
    const lowTemp = Math.round(idx(entities, _ => _.sensor.dark_sky_daily_low_temperature.state));
    const precipChance = idx(entities, _ => _.sensor.dark_sky_precip_probability.state);

    const lastUpdated = {
      dark_sky_temperature: idx(entities, _ => _.sensor.dark_sky_temperature.last_updated),
      dark_sky_icon: idx(entities, _ => _.sensor.dark_sky_icon.last_updated),
      dark_sky_daily_high_temperature: idx(entities, _ => _.sensor.dark_sky_daily_high_temperature.last_updated),
      dark_sky_daily_low_temperature: idx(entities, _ => _.sensor.dark_sky_daily_low_temperature.last_updated),
      dark_sky_precip_probability: idx(entities, _ => _.sensor.dark_sky_precip_probability.last_updated)
    };

    this.setState({
      lastUpdated,
      icon,
      currentTemp,
      highTemp,
      lowTemp,
      precipChance
    });
  }

  componentWillReceiveProps(newProps) {
    this._initializeWeather(newProps);
  }

  componentDidMount() {
    this._initializeWeather(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(this.state.lastUpdated) !== JSON.stringify(nextState.lastUpdated);
  }

  render() {
    const { className } = this.props;
    return (
      <div className={className}>
        <div className='current-conditions'>
          <i className={`mdi mdi-weather-${this.state.icon}`} /> {this.state.currentTemp}&deg;
        </div>
        <div className='todays-forecast'>
          <div className='todays-high'>
            <h3>High</h3>
            <p>{this.state.highTemp}&deg;</p>
          </div>
          <div className='todays-low'>
            <h3>Low</h3>
            <p>{this.state.lowTemp}&deg;</p>
          </div>
          <div className='todays-percip'>
            <h3>Rain</h3>
            <p>{this.state.precipChance}%</p>
          </div>
        </div>
      </div>
    );
  }
}
