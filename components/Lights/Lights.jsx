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
        lightGroups.push(groups[group]);
      }
      return lightGroups;
    }, []);
    return sortByAttribute(lightGroups, 'friendly_name');
  }

  _determineAvailableSwitches(props) {
    const { entities } = props;
    const groups = this._determineLightGroups(props);
    const switches = monitoredTypes.reduce((switches, type) => {
      switches[type] = idx(entities, _ => _[type]) || {};
      return switches;
    }, {});

    const groupsOutput = groups.map(group => {
      const groupSwitches = group.attributes.entity_id.reduce((output, switcher) => {
        const switchId = switcher.split('.', 2)[1];
        return output.concat(Object.keys(switches).reduce((allSwitches, type) => {
          if (switchId in switches[type]) {
            allSwitches.push({
              entity_id: switches[type][switchId].entity_id,
              name: switches[type][switchId].attributes.friendly_name,
              state: switches[type][switchId].state,
              type
            });
          }
          return allSwitches;
        }, []));
      }, []);
      return {
        entity_id: group.entity_id,
        name: group.attributes.friendly_name,
        state: group.state,
        switches: sortBy(groupSwitches, 'name')
      };
    });

    this.setState({
      groups: groupsOutput
    });
  }

  _renderGroups() {
    const groups = this.state.groups.map(group => {
      const switches = group.switches.map(switcher => {
        return (
          <div
            key={switcher.entity_id}
            className='switch'
          >
            {switcher.name}
            <Checkbox
              toggle
              checked={switcher.state === 'on'}
              onChange={this._toggle(switcher.entity_id)}
            />
          </div>
        );
      });

      return (
        <div
          key={group.entity_id}
          className='light-group'
        >
          <h2>
            {group.name}
            <Checkbox
              toggle
              checked={group.state === 'on'}
              onChange={this._toggle(group.entity_id)}
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

  _toggle = entity => () => {
    const { connection } = this.props;
    const entitySplit = entity.split('.', 2);
    const domain = entitySplit[0];
    console.log('Would have switched', entity);
    // connection.callService(domain, 'toggle', { entity_id: entity });
  }

  componentWillReceiveProps(newProps) {
    this._initializeLightsPanel(newProps);
  }

  componentDidMount() {
    this._initializeLightsPanel(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(this.state.groups) !== JSON.stringify(nextState.groups);
  }

  render() {
    return <Container id='lights-panel'>{this._renderGroups()}</Container>;
  }
}
