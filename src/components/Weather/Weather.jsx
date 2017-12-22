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
  render() {
    const { sensors, className } = this.props;

    const icon = icons[idx(sensors, _ => _.dark_sky_icon.state)];
    const currentTemp = Math.round(idx(sensors, _ => _.dark_sky_temperature.state));
    const highTemp = Math.round(idx(sensors, _ => _.dark_sky_daily_high_temperature.state));
    const lowTemp = Math.round(idx(sensors, _ => _.dark_sky_daily_low_temperature.state));
    const precipChance = idx(sensors, _ => _.dark_sky_precip_probability.state);

    return (
      <div className={className}>
        <div className='current-conditions'>
          <i className={`mdi mdi-weather-${icon}`} /> {currentTemp}&deg;
        </div>
        <div className='todays-forecast'>
          <div className='todays-high'>
            <h3>High</h3>
            <p>{highTemp}&deg;</p>
          </div>
          <div className='todays-low'>
            <h3>Low</h3>
            <p>{lowTemp}&deg;</p>
          </div>
          <div className='todays-percip'>
            <h3>Rain</h3>
            <p>{precipChance}%</p>
          </div>
        </div>
      </div>
    );
  }
}
