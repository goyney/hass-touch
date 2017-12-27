import React from 'react';
import idx from 'idx';
import { Container } from 'semantic-ui-react';

import config from 'config.json';

export default class Music extends React.Component {
  render() {

    const music = idx(this.props.entities, _ => _.media_player.spotify) || { attributes: {} };
    console.log(music);

    return (
      <Container>
        <header>
          <h1>Music Interface</h1>
          <p>Status: {music.state}</p>
          <p>Shuffle: {music.attributes.shuffle ? 'true' : 'false'}</p>
          <p><img src={`http${config.hass.ssl ? 's' : ''}://${config.hass.basePath}${music.attributes.entity_picture}`} style={{width: '100px', height: '100px'}} /></p>
          <p>{music.attributes.media_title} by {music.attributes.media_artist} ({music.attributes.media_album_name})</p>
          <p>Volume Level: {music.attributes.volume_level}</p>
          <p>Playing on device: {music.attributes.source}</p>
          <p>Available Playback Devices: {JSON.stringify(music.attributes.source_list)}</p>
        </header>
      </Container>
    );
  }
}
