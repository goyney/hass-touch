import React from 'react';
import cx from 'classnames';
import { Container } from 'semantic-ui-react';

import './Garage.scss';

export default class Garage extends React.Component {
  constructor() {
    super();
    this.state = {
      doorState: 'closed',
      paused: false
    };
  }

  _toggleDoor = () => {
    this.setState({ doorState: this.state.doorState === 'closed' ? 'open' :  'closed' });
  }

  _pause = (e) => {
    if (!this.state.paused) {
      const doorStyle = window.getComputedStyle(this.garageDoor);
      const clipPath = doorStyle['clip-path'];
      const transform = doorStyle.transform;

      console.log(doorStyle['transition-duration']);

      this.garageDoor.addEventListener('transitionend', event => {
        console.log('ELAPSED', event.elapsedTime);
      });

      this.garageDoor.style['clip-path'] = clipPath;
      this.garageDoor.style['transform'] = transform;
      this.garageDoor.classList.remove(`door-${this.state.doorState}`);
      this.setState({ paused: true });
    } else {
      this.garageDoor.classList.add(`door-${this.state.doorState}`);
      this.setState({ paused: false });
    }
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
            ref={door => this.garageDoor = door}
          >
            <rect x="5.842" y="11.188" width="12.317" height="2.464" />
            <rect x="5.842" y="14.473" width="12.317" height="2.464" />
            <rect x="5.842" y="17.758" width="12.317" height="2.464" />
            <rect x="5.842" y="21.043" width="12.317" height="2.464" />
          </g>
        </svg>
        <button onClick={this._toggleDoor}>Toggle Door</button>
        <button onClick={this._pause}>Pause Door</button>
      </Container>
    );
  }
}
