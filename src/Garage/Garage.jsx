import React from 'react';
import cx from 'classnames';
import { Container } from 'semantic-ui-react';

import './Garage.scss';

const traversalTimeDefault = 12;

export default class Garage extends React.Component {
  constructor() {
    super();
    this.state = {
      doorState: 'closed',
      traversalTime: traversalTimeDefault
    };
  }

  _doorOpen = () => {
    let traversalTimeLeft = this.state.traversalTime;
    if (!['closed', 'opening-stopped'].includes(this.state.doorState)) {
      traversalTimeLeft = traversalTimeDefault - traversalTimeLeft;
    }

    this._startTraversalTimer();
    this.setState({ doorState: 'opening', traversalTime: traversalTimeLeft });
  }

  _doorClose = () => {
    let traversalTimeLeft = this.state.traversalTime;
    if (!['opened', 'closing-stopped'].includes(this.state.doorState)) {
      traversalTimeLeft = traversalTimeDefault - traversalTimeLeft;
    }

    this._startTraversalTimer();
    this.setState({ doorState: 'closing', traversalTime: traversalTimeLeft });
  }

  _doorStop = () => {
    const doorStyle = window.getComputedStyle(this.garageDoor);
    const clipPath = doorStyle['clip-path'];
    const transform = doorStyle.transform;
    this.garageDoor.style['clip-path'] = clipPath;
    this.garageDoor.style['transform'] = transform;
    this._endTraversalTimer();
    this.setState({ doorState: `${this.state.doorState}-stopped`, traversalTime: this.state.traversalTime - this.traversalElapsedTime });
  };

  _startTraversalTimer() {
    if (!this.traversalTimer) {
      this.traversalElapsedTime = 0;
      this.traversalTimer = setInterval(() => {
        this.traversalElapsedTime = this.traversalElapsedTime + .1;
      }, 100);
    }
  }

  _endTraversalTimer() {
    if (this.traversalTimer) {
      clearInterval(this.traversalTimer);
      this.traversalTimer = null;
    }
  }

  componentDidMount() {
    this.garageDoor.addEventListener('transitionend', event => {
      if (event.propertyName === 'transform') {
        this._endTraversalTimer();
        this.setState({ doorState: this.state.doorState.replace('ing', 'ed'), traversalTime: traversalTimeDefault });
      }
    });
  }

  render() {
    return (
      <Container fluid>
        <header>
          <h1>Garage Interface</h1>
        </header>
        <svg
          className={`garage-door door-${this.state.doorState}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <polyline points="22.777,23.547 19.698,23.547 19.698,9.691 4.302,9.691 4.302,23.547 1.223,23.547 1.223,6.611 12,0.453 22.777,6.611 22.777,23.547" />
          <g
            className={`door door-${this.state.doorState}`}
            style={{ transitionDuration: `${this.state.traversalTime}s` }}
            ref={door => this.garageDoor = door}
          >
            <rect x="5.842" y="11.188" width="12.317" height="2.464" />
            <rect x="5.842" y="14.473" width="12.317" height="2.464" />
            <rect x="5.842" y="17.758" width="12.317" height="2.464" />
            <rect x="5.842" y="21.043" width="12.317" height="2.464" />
          </g>
        </svg>
        <button onClick={this._doorOpen} disabled={this.state.doorState === 'opened' || this.traversalTimer}>Open</button>
        <button onClick={this._doorStop} disabled={['opened', 'closed', 'opening-stopped', 'closing-stopped'].includes(this.state.doorState)}>Stop</button>
        <button onClick={this._doorClose} disabled={this.state.doorState === 'closed' || this.traversalTimer}>Close</button>
      </Container>
    );
  }
}
