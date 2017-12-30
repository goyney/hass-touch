import React from 'react';
import idx from 'idx';
import cx from 'classnames';
import { Container } from 'semantic-ui-react';

import config from 'config.json';

import './Music.scss';

export default class Music extends React.Component {
  _playPause = () => {
    const { connection } = this.props;
    console.log('playpause');
    connection.callService('media_player', 'media_play_pause');
  }

  _nextTrack = () => {
    const { connection } = this.props;
    console.log('next');
    connection.callService('media_player', 'media_next_track');
  }

  _prevTrack = () => {
    const { connection } = this.props;
    console.log('prev');
    connection.callService('media_player', 'media_previous_track');
  }

  _shuffle = () => {
    const { connection } = this.props;
    console.log('shuffle');
    connection.callService('media_player', 'shuffle_set', { shuffle: !this.props.entities.media_player.spotify.attributes.shuffle});
  }

  render() {
    const music = idx(this.props.entities, _ => _.media_player.spotify) || { attributes: {} };
    console.log(music);

    return (
      <Container id='music-panel'>
        <div className='control-bar'>
          <div className='now-playing'>
            <img src={`http${config.hass.ssl ? 's' : ''}://${config.hass.basePath}${music.attributes.entity_picture}`} />
            <div className='song-info'>
              <p className='track-name'>{music.attributes.media_title}</p>
              <p className='artist-name'>{music.attributes.media_artist}</p>
            </div>
          </div>
          <div className='playback-controls'>
            <button onClick={this._shuffle}>
              <i className={cx({
                mdi: true,
                'mdi-shuffle': music.attributes.shuffle === true,
                'mdi-shuffle-disabled': music.attributes.shuffle !== true
              })} />
            </button>
            <button onClick={this._prevTrack}>
              <i className='mdi mdi-skip-previous' />
            </button>
            <button className='play' onClick={this._playPause}>
              <i className={cx({
                mdi: true,
                'mdi-play-circle-outline': music.state !== 'playing',
                'mdi-pause-circle-outline': music.state === 'playing'
              })} />
            </button>
            <button onClick={this._nextTrack}>
              <i className='mdi mdi-skip-next' />
            </button>
            <button>
              <i className='mdi mdi-cast' />
            </button>
            <button>
              <i className={cx({
                mdi: true,
                'mdi-volume-high': music.attributes.volume_level > 0.67,
                'mdi-volume-medium': music.attributes.volume_level <= 0.66 && music.attributes.volume_level > 0.34,
                'mdi-volume-low': music.attributes.volume_level <= 0.33 && music.attributes.volume_level > 0,
                'mdi-volume-mute': music.attributes.volume_level === 0
              })} />
            </button>
          </div>
        </div>
      </Container>
    );
  }
}
