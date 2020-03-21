import React, { Component } from 'react';
import { connect } from 'react-redux';

// eslint-disable-next-line react/prefer-stateless-function
export class VideoPage extends Component {
  render() {
    console.log(this.props);
    return (
      <div>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          autoPlay
          controls
          src={`/get_file/__dir__${this.props.video.fileName}/prog_index.m3u8`}
          height="540"
          width="960"
        />
      </div>
    );
  }
}

VideoPage.defaultProps = {
  video: 'edge_of_tomorrow_2014.mp4',
};

const mapStateToProps = state => {
  console.log(state);
  return {
    video: state.global.video,
  };
};

export default connect(mapStateToProps)(VideoPage);
