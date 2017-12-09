import React from 'react';

import './Lights.scss';

export default class Lights extends React.Component {
  _curateLightGroups(groups) {
    const lightGroups = Object.keys(groups).reduce((lightGroups, group) => {
      if (groups[group].attributes.ht_lights === true) {
        lightGroups.push(groups[group]);
      }
      return lightGroups;
    }, []);

    lightGroups.sort((a, b) => {
      const aName = a.attributes.friendly_name.toUpperCase();
      const bName = b.attributes.friendly_name.toUpperCase();

      if (aName < bName) {
        return -1;
      }
      if (aName > bName) {
        return 1;
      }
      return 0;
    });

    return lightGroups;
  }

  _generateGroups(groups, switches) {
    const lightGroups = this._curateLightGroups(groups);
    const groupsOutput = lightGroups.map(group => {
      const groupSwitches = group.attributes.entity_id.map(switcher => {
        const switchSplit = switcher.split('.', 2);
        if (switches[switchSplit[1]]) {
          const thisSwitch = switches[switchSplit[1]];
          return <p key={thisSwitch.entity_id}>{thisSwitch.attributes.friendly_name} | {thisSwitch.state} | <a onClick={this._toggle(thisSwitch.entity_id)}>Toggle</a></p>;
        }
        return false;
      });

      // Relationship insurance
      if (group.entity_id !== 'group.master_bedroom') {
        return (
          <div key={group.entity_id}>
            <h4>{group.attributes.friendly_name} | {group.state} | <a onClick={this._toggle(group.entity_id)}>Toggle</a></h4>
            {groupSwitches}
          </div>
        );
      }
    });
    return groupsOutput;
  }

  _toggle = entity => () => {
    const { connection } = this.props;
    const entitySplit = entity.split('.', 2);
    const domain = entitySplit[0];

    connection.callService(domain, 'toggle', { entity_id: entity })
      .then(result => console.log('TOGGLED', domain, 'toggle', entity))
      .catch(err => {
        // Want to pop up a notifcation if errors ever occur
        console.error(err);
      });
  }

  render () {
    const {
      groups = {},
      switches = {},
      lights = {},
      fans = {}
    } = this.props;

    return (
      <div>
        <h3>Lights</h3>
        {this._generateGroups(groups, Object.assign(switches, lights, fans))}
      </div>
    );
  }
}
