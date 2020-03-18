import React from 'react';
import VideoWindowContents from 'components/VideoWindowContents';
import VideosWindowContents from 'components/VideosWindowContents';

const styles = {
  baseStyle: {
    display: 'inline-block',
    background: 'white',
    minHeight: '100px',
    minWidth: '200px',
    border: '1px solid rgb(192, 192, 192)',
  },
  bodyStyle: {
    height: 'calc(100% - 30px)',
    width: '100%',
    overflow: 'auto',
  },
  resizeHolder: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    cursor: 'pointer',
    background: 'rgb(192, 192, 192)',
    curosor: 'pointer',
    height: '15px',
    width: '15px',
  },
  titlePart: {
    background: 'navy',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    height: '30px',
    padding: '2px',
    position: 'relative',
  },
  titleText: {
    padding: '8px',
    position: 'relative',
    top: '4px',
  },
  widowControls: {
    cursor: 'pointer',
    display: 'inline-block',
    position: 'absolute',
    right: 2,
    top: 2,
  },
};

function getBodyComponent({ title }) {
  if (title.startsWith('video ')) {
    return VideoWindowContents;
  }
  switch (title) {
    case 'videos':
      return VideosWindowContents;
    default:
      return () => null;
  }
}

export default function Window(props) {
  const BodyComponent = getBodyComponent(props)
  return (
    <div
      style={{
        ...styles.baseStyle,
        ...props.style,
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        style={styles.titlePart}
        onMouseDown={() => props.setWindowSelected(props.title)}
        onMouseUp={() => props.setWindowSelected(null)}
      >
        <span style={styles.titleText}>{props.title}</span>
        <div style={styles.widowControls}>
          {/* eslint-disable-next-line react/button-has-type */}
          <button onClick={() => props.minimize(props.windows)}>-</button>
          {/* eslint-disable-next-line react/button-has-type */}
          <button onClick={() => props.maximize(props.windows)}>□</button>
          {/* eslint-disable-next-line react/button-has-type */}
          <button onClick={() => props.close(props.windows)}>x</button>
        </div>
      </div>
      <div style={styles.bodyStyle}>
        <BodyComponent {...props} />
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        style={styles.resizeHolder}
        onMouseDown={() => props.setResizingSelected(props.title)}
        onMouseUp={() => props.setResizingSelected(null)}
      />
    </div>
  );
}
