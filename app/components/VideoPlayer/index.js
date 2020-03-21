import React, { Component } from 'react';
import Hls from 'hls.js';
import styled from 'styled-components';
import {
  IconButton,
  IIconProps,
  IContextualMenuProps,
  Stack,
  Link,
} from 'office-ui-fabric-react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import Slider from 'components/Slider';

const Overlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 150px;
  width: 100%;
  opacity: 0;
  transition: opacity 0.25s;
  &:hover {
    opacity: 1;
  }
`;

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 0;
  color: white;
  z-index: 2;
  right: 25%;
`;

const VideoContainer = styled.div`
  display: table-cell;
  vertical-align: middle;
`;

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.container = React.createRef();
    this.video = React.createRef();

    this.state = {
      isPaused: true,
      isFullScreen: false,
    };
  }

  componentDidMount() {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.on(Hls.Events.ERROR, (e, m) => {
        console.log('error happened');
        console.error(e);
        console.error(m);
      });

      hls.attachMedia(this.video.current);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('video and hls.js are now bound together !');
        hls.loadSource('/get_file/__dir__' + this.props.video + '/prog_index.m3u8');
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log(
            `manifest loaded, found ${data.levels.length} quality level`,
          );
        });
      });
    }
  }

  toggleFullScreen = () => {
    if (this.state.isFullScreen) {
      this.exitFullScreen();
      this.setState({ isFullScreen: false });
    } else {
      this.doFullScreen();
      this.setState({ isFullScreen: true });
    }
  };

  doFullScreen = () => {
    const elem = this.container.current;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  };

  exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE/Edge */
      document.msExitFullscreen();
    }
  };

  doPlay = async () => {
    try {
      console.log('playing video');
      await this.video.current.play();
      this.setState({ isPaused: false })
    } catch (e) {
      console.error('error happen play ', e);
    }
  };

  doPause = async () => {
    console.log('pausing video');
    this.video.current.pause();
    this.setState({ isPaused: true })
  };

  seekVideo = event => {
    const val = event.target.value;
    this.video.current.currentTime = val;
  };

  onFinishDraggingSlider = position => {
    // eslint-disable-next-line prefer-destructuring
    const duration = this.video.current.duration;
    const newPosition = Math.floor(duration * position);
    this.video.current.currentTime = newPosition;
  };

  render() {
    return (
      <div
        style={{
          position: 'relative',
          verticalAlign: 'middle',
        }}
        ref={this.container}
      >
        <VideoContainer>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            // eslint-disable-next-line
            style={ this.state.isFullScreen ? { margin: 'auto', position: 'absolute', top: '50%', bottom: '50%' } : {} }
            ref={this.video}
            width={window.innerWidth}
          />
        </VideoContainer>
        <Overlay style={{ opacity: this.state.isPaused ? 1 : undefined }}>
          <ControlsContainer className="video-controls">
            <IconButton
              onClick={this.doPlay}
              iconProps={{ iconName: 'Play' }}
            />
            <IconButton
              onClick={this.doPause}
              iconProps={{ iconName: 'Pause' }}
            />

            <div style={{ display: 'inline-block', width: '800px' }}>
              <Slider
                onFinishDragging={this.onFinishDraggingSlider}
                position={this.video.currentTime / this.video.duration}
              />
            </div>
            <IconButton
              onClick={this.toggleFullScreen}
              iconProps={{
                iconName: this.state.isFullScreen
                  ? 'BackToWindow'
                  : 'FullScreen',
              }}
            />
          </ControlsContainer>
        </Overlay>
      </div>
    );
  }
}
