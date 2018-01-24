import React from 'react';
import idx from 'idx';
import cx from 'classnames';
import { Container } from 'semantic-ui-react';
import Spotify from 'spotify-web-api-js';

import config from 'config.json';

import './Music.scss';

export default class Music extends React.Component {
  constructor() {
    super();
    this.spotify = new Spotify();
    this.state = {
      searchTerm: ''
    };
  }

  _initializeMusicPanel() {
    this._setSpotifyAccessToken()
      .then(() => {
        this._getNowPlaying();
        this._getFeaturedPlaylists();
        this._getUserPlaylists();
      });
  }

  _setSpotifyAccessToken() {
    return new Promise((resolve, reject) => {
      const { entities } = this.props;
      const accessToken = idx(this.props.entities, _ => _.media_player.spotify.attributes.app_id);
      if (accessToken) {
        this.setState({ accessToken });
        this.spotify.setAccessToken(accessToken);
        resolve();
      }
    });
  }

  _getNowPlaying() {
    const music = idx(this.props.entities, _ => _.media_player.spotify) || { attributes: {} };
    this.setState({
      mediaTitle: music.attributes.media_title,
      mediaArtist: music.attributes.media_artist,
      mediaArt: `http${config.hass.ssl ? 's' : ''}://${config.hass.basePath}${music.attributes.entity_picture}`,
      state: music.state,
      shuffle: music.attributes.shuffle,
      volumeLevel: music.attributes.volume_level,
      source: music.attributes.source,
      sourcesAvailable: music.attributes.source_list
    });
  }

  _getFeaturedPlaylists() {
    this.spotify.getFeaturedPlaylists({ country: 'US' })
      .then(data => {
        this.setState({
          featuredPlaylists: data
        });
      })
      .catch(error => {
        this.setState({
          featuredPlaylists: new Error(error)
        });
      });
  }

  _getUserPlaylists() {
    this.spotify.getUserPlaylists()
      .then(data => {
        this.setState({
          userPlaylists: data
        });
      })
      .catch(error => {
        this.setState({
          userPlaylists: new Error(error)
        });
      });
  }

  _playPlaylist = playlistUri => {
    this.spotify.play({ context_uri: playlistUri });
  }

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
    // const { connection } = this.props;
    // console.log('shuffle');
    // connection.callService('media_player', 'shuffle_set', { shuffle: !this.props.entities.media_player.spotify.attributes.shuffle});


    // this.spotify.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE', function(err, data) {
    //   if (err) console.error(err);
    //   else console.log('Artist albums', data);
    // });
    console.log(this.state);
  }

  _renderPlaylists(playlists) {
    const pl = playlists.items.reduce((pl, list) => {
      pl.push(
        <div
          className='playlist'
          key={list.id}
          onClick={() => this._playPlaylist(list.uri)}
        >
          <img src={list.images[0].url} alt={list.name} />
          <h4>{list.name}</h4>
        </div>
      );
      return pl;
    }, []);

    return (
      <div>{pl}</div>
    );
  }

  componentWillReceiveProps(newProps) {
    this._initializeMusicPanel(newProps);
  }

  componentDidMount() {
    this._initializeMusicPanel(this.props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(this.state) !== JSON.stringify(nextState);
  }

  render() {
    return (
      <Container id='music-panel'>
        <div className='search-bar'>
          <input
            type='text'
            placeholder='Search'
          />
        </div>
        <div className='featured-playlists'>
          { this.state.featuredPlaylists && typeof this.state.featuredPlaylists !== 'Error' &&
            <div className='spotify-featured'>
              <h3>{this.state.featuredPlaylists.message}</h3>
              {this._renderPlaylists(this.state.featuredPlaylists.playlists)}
            </div>
          }
          { this.state.userPlaylists && typeof this.state.userPlaylists !== 'Error' &&
            <div className='user-playlists'>
              <h3>Your playlists</h3>
              {this._renderPlaylists(this.state.userPlaylists)}
            </div>
          }
        </div>
        <div className='control-bar'>
          <div className='now-playing'>
            <img src={this.state.mediaArt} />
            <div className='song-info'>
              <p className='track-name'>{this.state.mediaTitle}</p>
              <p className='artist-name'>{this.state.mediaArtist}</p>
            </div>
          </div>
          <div className='playback-controls'>
            <button onClick={this._shuffle}>
              <i className={cx({
                mdi: true,
                'mdi-shuffle': this.state.shuffle === true,
                'mdi-shuffle-disabled': this.state.shuffle !== true
              })} />
            </button>
            <button onClick={this._prevTrack}>
              <i className='mdi mdi-skip-previous' />
            </button>
            <button className='play' onClick={this._playPause}>
              <i className={cx({
                mdi: true,
                'mdi-play-circle-outline': this.state.state !== 'playing',
                'mdi-pause-circle-outline': this.state.state === 'playing'
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
                'mdi-volume-high': this.state.volumeLevel > 0.67,
                'mdi-volume-medium': this.state.volumeLevel <= 0.66 && this.state.volumeLevel > 0.34,
                'mdi-volume-low': this.state.volumeLevel <= 0.33 && this.state.volumeLevel > 0,
                'mdi-volume-mute': this.state.volumeLevel === 0
              })} />
            </button>
          </div>
        </div>
      </Container>
    );
  }
}
