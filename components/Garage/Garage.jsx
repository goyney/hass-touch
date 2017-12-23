import React from 'react';
import idx from 'idx';
import cx from 'classnames';
import { Container } from 'semantic-ui-react';

import determineElapsedTime from 'utils/elapsedTime';

import './Garage.scss';

export default class Garage extends React.Component {
  constructor() {
    super();
    this.state = {
      doorState: 'closed',
      lastChanged: false,
      moving: false
    };
  }

  _initializeGaragePanel(props) {
    const { entities } = props;
    this._determineGarageState(entities);
  }

  _determineGarageState(entities) {
    if (entities) {
      let garageState = idx(entities, _ => _.cover.garage_door.state);
      const lastChanged = idx(entities, _ => _.cover.garage_door.last_changed);
      this.setState({
        doorState: garageState || this.state.doorState,
        lastChanged: lastChanged ? determineElapsedTime(lastChanged) : this.state.lastChanged,
        moving: false
      });
    }
  }

  _doorToggle = action => () => {
    const { connection } =  this.props;
    const actionToDirection = {
      open: 'up',
      close: 'down'
    };

    if (action in actionToDirection) {
      connection.callService('cover', `${action}_cover`);
      this.setState({ moving: actionToDirection[action] });
    }
  }

  _prettyStateStatus() {
    if (this.state.doorState) {
      if (this.state.moving) {
        return this.state.moving === 'up' ? 'opening' : 'closing';
      }
      return this.state.doorState;
    }
    return 'unknown';
  }

  componentWillReceiveProps(newProps) {
    this._initializeGaragePanel(newProps);
  }

  componentDidMount() {
    this._initializeGaragePanel(this.props);
  }

  render() {
    return (
      <Container id='garage-panel'>
        <div className={cx({
          'garage-status': true,
          [`door-${this.state.doorState}`]: true,
          'moving-up': this.state.moving === 'up',
          'moving-down': this.state.moving === 'down'
        })}>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
            <polyline points='22.777,23.547 19.698,23.547 19.698,9.691 4.302,9.691 4.302,23.547 1.223,23.547 1.223,6.611 12,0.453 22.777,6.611 22.777,23.547' />
            <g className='door'>
              <rect x='5.842' y='11.188' width='12.317' height='2.464' />
              <rect x='5.842' y='14.473' width='12.317' height='2.464' />
              <rect x='5.842' y='17.758' width='12.317' height='2.464' />
              <rect x='5.842' y='21.043' width='12.317' height='2.464' />
            </g>
          </svg>
          <h3>{this._prettyStateStatus()}</h3>
          <p>{this.state.lastChanged ? this.state.lastChanged : ''}</p>
        </div>
        <div className='garage-control'>
          <button onClick={this._doorToggle('open')} disabled={this.state.doorState === 'open'}>
            <i className='mdi mdi-arrow-up-bold' />
          </button>
          <button onClick={this._doorToggle('close')} disabled={this.state.doorState === 'closed'}>
            <i className='mdi mdi-arrow-down-bold' />
          </button>
        </div>
      </Container>
    );
  }
}
