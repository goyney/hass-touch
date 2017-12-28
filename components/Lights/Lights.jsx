import React from 'react';
import idx from 'idx';
import { Container, Checkbox } from 'semantic-ui-react';

import { sortBy, sortByAttribute } from 'utils/sortBy';

import './Lights.scss';

const monitoredTypes = [ 'switch', 'light', 'fan' ];

export default class Lights extends React.Component {
  constructor() {
    super();
    this.state = {
      groups: []
    };
  }

  _initializeLightsPanel(props) {
    this._determineAvailableSwitches(props);
  }

  _determineLightGroups(props) {
    const { entities } = props;
    const groups = idx(entities, _ => _.group) || {};
    const lightGroups = Object.keys(groups).reduce((lightGroups, group) => {
      if (groups[group].attributes.ht_lights === true) {
        lightGroups[group] = groups[group];
      }
      return lightGroups;
    }, {});
    return sortByAttribute(lightGroups, 'friendly_name');
  }

  _determineAvailableSwitches(props) {
    const { entities } = props;
    const groups = this._determineLightGroups(props);
    const switches = monitoredTypes.reduce((switches, type) => {
      switches[type] = idx(entities, _ => _[type]) || {};
      return switches;
    }, {});

    const groupsOutput = Object.keys(groups).reduce((groupsOutput, group) => {
      const groupSwitches = groups[group].attributes.entity_id.reduce((output, switcher) => {
        const switchId = switcher.split('.', 2)[1];
        return Object.assign(output, Object.keys(switches).reduce((allSwitches, type) => {
          if (switchId in switches[type]) {
            allSwitches[switches[type][switchId].entity_id] = {
              name: switches[type][switchId].attributes.friendly_name,
              state: switches[type][switchId].state,
              type
            };
          }
          return allSwitches;
        }, {}));
      }, {});

      groupsOutput[groups[group].entity_id] = {
        name: groups[group].attributes.friendly_name,
        state: groups[group].state,
        switches: sortBy(groupSwitches, 'name')
      };
      return groupsOutput;
    }, {});

    this.setState({
      lastUpdated: Date.now(),
      groups: groupsOutput
    });
  }

  _renderGroups() {
    const groups = Object.keys(this.state.groups).map(groupId => {
      const group = this.state.groups[groupId];
      const switches = Object.keys(group.switches).map(switchId => {
        const switcher = group.switches[switchId];
        return (
          <div
            key={switchId}
            className='switch'
          >
            {switcher.name}
            <Checkbox
              toggle
              checked={switcher.state === 'on'}
              onChange={this._toggle(groupId, switchId)}
            />
          </div>
        );
      });

      return (
        <div
          key={groupId}
          className='light-group'
        >
          <h2>
            {group.name}
            <Checkbox
              toggle
              checked={group.state === 'on'}
              onChange={this._toggle(groupId)}
            />
          </h2>
          {switches}
        </div>
      );
    });

    return (
      <div className='group-container'>{groups}</div>
    );
  }

  _toggle = (groupEntityId, switchEntityId) => () => {
    const { connection } = this.props;
    const currentGroups = this.state.groups;

    if (switchEntityId) {
      currentGroups[groupEntityId].switches[switchEntityId].state = currentGroups[groupEntityId].switches[switchEntityId].state === 'on' ? 'off' : 'on';
      if (currentGroups[groupEntityId].switches[switchEntityId].state === 'on') {
        currentGroups[groupEntityId].state = 'on';
      } else {
        const anyOn = Object.keys(currentGroups[groupEntityId].switches).filter(switchId => currentGroups[groupEntityId].switches[switchId].state === 'on');
        if (!anyOn.length) {
          currentGroups[groupEntityId].state = 'off';
        }
      }
      connection.callService('homeassistant', 'toggle', { entity_id: switchEntityId });
    } else {
      currentGroups[groupEntityId].state = currentGroups[groupEntityId].state === 'on' ? 'off' : 'on';
      Object.keys(currentGroups[groupEntityId].switches).forEach(switchId => {
        currentGroups[groupEntityId].switches[switchId].state = currentGroups[groupEntityId].state;
      });
      connection.callService('homeassistant', 'toggle', { entity_id: groupEntityId });
    }

    this.setState({
      groups: currentGroups,
      lastUpdated: Date.now()
    });
  }

  componentWillReceiveProps(newProps) {
    this._initializeLightsPanel(newProps);

    // This will be fun
    // const thisLastUpdated = idx(this.props.entities, _ => _.climate.entryway.last_updated)
    // const nextLastUpdated = idx(newProps.entities, _ => _.climate.entryway.last_updated);
    // if (thisLastUpdated !== nextLastUpdated) {
    //   this._initializeClimatePanel(newProps);
    // }
  }

  componentDidMount() {
    this._initializeLightsPanel(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.lastUpdated !== nextState.lastUpdated;
  }

  render() {
    return <Container id='lights-panel'>{this._renderGroups()}</Container>;
  }
}
