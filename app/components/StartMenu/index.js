import React from 'react';
import StartLogo from 'images/start_logo.png';
const styles = {
  main: {
    position: 'fixed',
    height: '56px',
    bottom: 0,
    width: '100vw',
    background: 'rgb(192, 192, 192)',
    borderTop: '1px solid rgb(244, 244, 244)',
  },
  startButton: {
    cursor: 'pointer',
    height: '52px',
    padding: '12px',
    paddingLeft: '16px',
    fontSize: '18px',
    background: 'rgb(200, 200, 200)',
    border: '1px solid rgb(244, 244, 244)',
  },
  startImage: {
    width: '40px',
    position: 'relative',
    left: '-5px',
  },
  time: {
    height: '52px',
    position: 'absolute',
    right: 2,
    top: 2,
    display: 'inline-block',
    border: '1px solid rgb(124, 124, 124)',
    width: '100px',
    fontSize: '18px',
    padding: '12px',
    paddingLeft: '16px',
  },
};

export default function StartMenu(props) {
  return (
    <div className="start-menu" style={styles.main}>
      {/* eslint-disable-next-line react/button-has-type */}
      <button style={styles.startButton}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img style={styles.startImage} src={StartLogo} />
        Start
      </button>
      <div style={styles.time}>8:59:59</div>
    </div>
  );
}
