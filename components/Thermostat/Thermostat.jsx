import React from 'react';
import cx from 'classnames';

import './Thermostat.scss';

export default class Thermostat extends React.Component {
  static defaultProps = {
    mode: 'off',
    state: 'off',
    ambientTemperature: 0,
    targetTemperature: [],
    fan: false,
    leaf: false,
    away: false
  };

  _pointsToPath(points) {
    return [ points.map((point, i) => `${i > 0 ? 'L' : 'M'}${point[0]} ${point[1]}`).join(''), 'Z' ].join('');
  }

  _rotatePoint(point, angle) {
    const radians = angle * Math.PI / 180;
    const x = point[0] - this.radius;
    const y = point[1] - this.radius;
    const x1 = x * Math.cos(radians) - y * Math.sin(radians) + this.radius;
    const y1 = x * Math.sin(radians) + y * Math.cos(radians) + this.radius;
    return [ x1, y1 ];
  }

  _rotatePoints(points, angle) {
    return points.map(point => this._rotatePoint(point, angle));
  }

  _calculateTickSize(widthModifier = 0, lengthModifier = 0) {
    return [
      [ this.radius - (1 + widthModifier), this.ticksOuterRadius ],
      [ this.radius + (1 + widthModifier), this.ticksOuterRadius ],
      [ this.radius + (1 + widthModifier), this.ticksInnerRadius + lengthModifier ],
      [ this.radius - (1 + widthModifier), this.ticksInnerRadius + lengthModifier ]
    ];
  }

  _renderTicks() {
    return new Array(this.tickCount).fill('').map((x, i) => {
      let isActive, isLong, isFat;
      if (this.props.mode === 'off') {
        isActive = i === this.props.ambientTemperature;
        isLong = false;
        isFat = i === this.props.ambientTemperature;
      } else if (this.props.mode === 'heat-cool') {
        isActive = i >= this.props.targetTemperature[0] && i <= this.props.targetTemperature[1];
        isLong = this.props.targetTemperature.includes(i);
        isFat = i === this.props.ambientTemperature;
      } else {
        isActive = i <= this.props.ambientTemperature && i >= this.props.targetTemperature[0];
        isLong = i === this.props.targetTemperature[0];
        isFat = i === this.props.ambientTemperature;
      }

      const modifiers = [];
      modifiers.push(isFat || isLong ? 3.5 : 0);
      modifiers.push(isLong ? 20 : 0);

      return (
        <path
          key={i}
          className={cx({
            active: isActive,
            long: isLong,
            fat: isFat
          })}
          d={this._pointsToPath(this._rotatePoints(this._calculateTickSize(modifiers[0], modifiers[1]), i * this.ticksTheta - this.offsetDegrees))}
        />
      );
    });
  }

  _renderAmbientPosition() {
    const labelPosition = [ this.radius, this.ticksOuterRadius - (this.ticksOuterRadius - this.ticksInnerRadius) / 2 ];
    let angle = this.props.ambientTemperature * this.ticksTheta - this.offsetDegrees;
    if (this.props.ambientTemperature > this.props.targetTemperature[0]) {
      angle += 8;
    } else {
      angle -= 8;
    }
    const position = this._rotatePoint(labelPosition, angle);

    return (
      <g>
        <text className='ambient-temperature-stroke' x={position[0]} y={position[1]}>
          {Math.round(this.props.ambientTemperature)}
        </text>
        <text className='ambient-temperature' x={position[0]} y={position[1]}>
          {Math.round(this.props.ambientTemperature)}
        </text>
      </g>

    );
  }

  _renderCurrentStatus() {
    if (this.props.mode === 'off') {
      return <text className='away-mode' x={this.radius} y={this.radius}>OFF</text>;
    }

    if (this.props.away) {
      return <text className='away-mode' x={this.radius} y={this.radius}>AWAY</text>;
    }

    const status = this.props.mode === 'heat-cool' ? 'COOL • HEAT' : this.props.state !== 'off' ? this.props.state : `${this.props.mode} SET TO`;
    const targetTemperature = this.props.targetTemperature.map(temp => Math.round(temp));
    return (
      <g className={cx({ 'heat-cool': this.props.mode === 'heat-cool' })}>
        <text className='target-mode' x={this.radius} y={this.radius - 70}>{status}</text>
        <text className='target-temperature' x={this.radius} y={this.radius}>{targetTemperature.join(' • ')}</text>
      </g>
    );
  }

  _isFanOn() {
    if (this.props.state === 'off') {
      return this.props.fan;
    }
  }

  componentWillMount() {
    this.diameter = 400;
    this.tickCount = 100;
    this.tickDegrees = 300;
    this.radius = this.diameter / 2;
    this.ticksOuterRadius = this.diameter / 50;
    this.ticksInnerRadius = this.diameter / 7;
    this.ticksTheta = this.tickDegrees / this.tickCount;
    this.offsetDegrees = 180 - (360 - this.tickDegrees) / 2;
  }

  render() {
    return (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className={cx({
          thermostat: true,
          heating: this.props.state === 'heating',
          cooling: this.props.state === 'cooling'
        })}
        viewBox={`0 0 ${this.diameter} ${this.diameter}`}
      >
        <circle cx={this.radius} cy={this.radius} r={this.radius} />
        <g className='ticks'>
          {this._renderTicks()}
        </g>
        {this._renderAmbientPosition()}
        {this._renderCurrentStatus()}
        <path
          className={cx({
            fan: true,
            on: this._isFanOn()
          })}
          d='M199.974,330.941c-0.972,0-1.76,0.788-1.76,1.76s0.788,1.76,1.76,1.76c0.972,0,1.76-0.788,1.76-1.76S200.945,330.941,199.974,330.941 M200.853,315.104c7.918,0,8.112,6.282,3.959,8.358c-1.742,0.862-2.516,2.71-2.851,4.346c0.845,0.352,1.584,0.897,2.147,1.601c6.511-3.519,13.514-2.129,13.514,4.17c0,7.918-6.282,8.094-8.358,3.924c-0.88-1.742-2.745-2.516-4.382-2.851c-0.352,0.845-0.897,1.566-1.601,2.164c3.502,6.493,2.112,13.479-4.188,13.479c-7.918,0-8.077-6.3-3.924-8.376c1.724-0.862,2.499-2.692,2.851-4.311c-0.862-0.352-1.619-0.915-2.182-1.619c-6.493,3.484-13.461,2.112-13.461-4.17c0-7.918,6.264-8.112,8.341-3.942c0.88,1.742,2.727,2.499,4.364,2.833c0.334-0.845,0.897-1.584,1.619-2.147C193.199,322.072,194.589,315.104,200.853,315.104z'
        />
        <path
          className={cx({
            leaf: true,
            on: this.props.leaf && !this._isFanOn()
          })}
          d='M181.2,343.917c9.6,6.8,20.4,7.2,29.2-2.4c9.6-10.4,9.6-22.4,9.6-29.6c-5.2,6-14.8,3.6-28,7.6c-10.4,3.6-12,16-12,21.2c2.4-2.8,7.2-6.8,13.2-9.2c9.6-3.6,13.6-3.6,19.2-8c-3.6,4-8,6.4-17.2,9.6C188.8,335.517,183.2,341.517,181.2,343.917z'
        />
      </svg>
    );
  }
}
