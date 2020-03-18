import React from 'react';
import VideoPlayer from 'components/VideoPlayer';

const styles = {
  container: {

  }
}

export default function VideoWindowContents(props) {
  return (
    <div style={styles.container}>
      <VideoPlayer video={props.video} />
    </div>
  );
}
