import React from 'react';
import cx from 'classnames';

import './Thermostat.scss';

export default class Thermostat extends React.Component {
  static defaultProps = {
    away: false,
    ambientTemperature: 74,
    targetTemperature: 68,
    mode: 'off',
    fan: 'off'
  };

  _pointsToPath(points) {
    return [ points.map((point, iPoint) => [ iPoint > 0 ? 'L' : 'M', point[0], ' ', point[1] ].join('')).join(' '), 'Z' ].join('');
  }

  _rotatePoint(point, angle, origin) {
    const radians = angle * Math.PI / 180;
    const x = point[0] - origin[0];
    const y = point[1] - origin[1];
    const x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0];
    const y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1];
    return [ x1, y1 ];
  }

  _rotatePoints(points, angle, origin) {
    return points.map(point => this._rotatePoint(point, angle, origin));
  }

  _restrictToRange(val, min, max) {
    if (val < min) {
      return min;
    }
    if (val > max) {
      return max;
    }
    return val;
  }

  _determineRange() {
    let actualMinValue, actualMaxValue;
    if (this.props.away) {
      actualMinValue = this.props.ambientTemperature;
      actualMaxValue = actualMinValue;
    } else {
      actualMinValue = Math.min(this.props.ambientTemperature, this.props.targetTemperature);
      actualMaxValue = Math.max(this.props.ambientTemperature, this.props.targetTemperature);
    }

    const min = this._restrictToRange(Math.round((actualMinValue - this.minValue) / this.rangeValue * this.tickCount), 0, this.tickCount - 1);
    const max = this._restrictToRange(Math.round((actualMaxValue - this.minValue) / this.rangeValue * this.tickCount), 0, this.tickCount - 1);
    return { min, max };
  }

  _renderPerimeterTicks() {
    const { min, max } = this._determineRange();
    const tickPoints = [
      [ this.radius - 1, this.ticksOuterRadius ],
      [ this.radius + 1, this.ticksOuterRadius ],
      [ this.radius + 1, this.ticksInnerRadius ],
      [ this.radius - 1, this.ticksInnerRadius ]
    ];
    const tickPointsLarge = [
      [ this.radius - 1.5, this.ticksOuterRadius ],
      [ this.radius + 1.5, this.ticksOuterRadius ],
      [ this.radius + 1.5, this.ticksInnerRadius + 20 ],
      [ this.radius - 1.5, this.ticksInnerRadius + 20 ]
    ];

    return new Array(this.tickCount).fill('').map((x, i) => {
      const isLarge = i === min || i === max;
      const isActive = i >= min && i <= max;
      return (
        <path
          key={i}
          className={cx({
            tick: true,
            active: isActive
          })}
          d={this._pointsToPath(this._rotatePoints(isLarge ? tickPointsLarge : tickPoints, i * this.ticksTheta - this.offsetDegrees, [ this.radius, this.radius ]))}
        />
      );
    });
  }

  _determineAmbientPosition() {
    const labelPosition = [ this.radius, this.ticksOuterRadius - (this.ticksOuterRadius - this.ticksInnerRadius) / 2 ];
    const maxValue = this._restrictToRange(this.props.ambientTemperature, this.minValue, this.maxValue);
    let degrees = this.tickDegrees * (maxValue - this.minValue) / this.rangeValue - this.offsetDegrees;
    if (maxValue > this.props.targetTemperature) {
      degrees += 8;
    } else {
      degrees -= 8;
    }
    const position = this._rotatePoint(labelPosition, degrees, [ this.radius, this.radius ]);

    return (
      <text className='ambient-temperature' x={position[0]} y={position[1]}>
        {Math.round(this.props.ambientTemperature)}
      </text>
    );
  }

  _determineCurrentStatus() {
    if (this.props.away) {
      return <text className='away-mode' x={this.radius} y={this.radius}>AWAY</text>;
    }
    return (
      <text className='target-temperature' x={this.radius} y={this.radius}>
        {Math.round(this.props.targetTemperature)}
      </text>
    );
  }

  _showFan() {
    if (this.props.mode === 'off' && this.props.fan === 'on') {
      return <path className='fan' d='M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12.5,2C17,2 17.11,5.57 14.75,6.75C13.76,7.24 13.32,8.29 13.13,9.22C13.61,9.42 14.03,9.73 14.35,10.13C18.05,8.13 22.03,8.92 22.03,12.5C22.03,17 18.46,17.1 17.28,14.73C16.78,13.74 15.72,13.3 14.79,13.11C14.59,13.59 14.28,14 13.88,14.34C15.87,18.03 15.08,22 11.5,22C7,22 6.91,18.42 9.27,17.24C10.25,16.75 10.69,15.71 10.89,14.79C10.4,14.59 9.97,14.27 9.65,13.87C5.96,15.85 2,15.07 2,11.5C2,7 5.56,6.89 6.74,9.26C7.24,10.25 8.29,10.68 9.22,10.87C9.41,10.39 9.73,9.97 10.14,9.65C8.15,5.96 8.94,2 12.5,2Z' />;
    }
  }

  componentWillMount() {
    this.diameter = 400;
    this.tickCount = 100;
    this.tickDegrees = 300;
    this.minValue = 50;
    this.maxValue = 85;
    this.radius = this.diameter / 2;
    this.ticksOuterRadius = this.diameter / 30;
    this.ticksInnerRadius = this.diameter / 8;
    this.ticksTheta = this.tickDegrees / this.tickCount;
    this.rangeValue = this.maxValue - this.minValue;
    this.offsetDegrees = 180 - (360 - this.tickDegrees) / 2;
  }

  render() {
    return (
      <svg xmlns='http://www.w3.org/2000/svg' className='thermostat' viewBox={`0 0 ${this.diameter} ${this.diameter}`}>
        <circle
          className={cx({
            heating: this.props.mode === 'heating',
            cooling: this.props.mode === 'cooling'
          })}
          cx={this.radius}
          cy={this.radius}
          r={this.radius}
        />
        <g>
          {this._renderPerimeterTicks()}
        </g>
        {this._determineAmbientPosition()}
        {this._determineCurrentStatus()}
        {this._showFan()}
      </svg>
    );
  }
}
