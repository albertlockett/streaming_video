import React from 'react';

const styles = {
  baseStyle: {
    display: 'inline-block',
    background: 'white',
    minHeight: '100px',
    minWidth: '200px',
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
  widowControls: {
    cursor: 'pointer',
    display: 'inline-block',
    position: 'absolute',
    right: 2,
    top: 2,
  }
};

export default function Window(props) {
  return (
    <div style={styles.baseStyle}>
      <div style={styles.titlePart}>
        <span>{props.title}</span>
        <div style={styles.widowControls}>
          <button>-</button>
          <button>□</button>
          <button>x</button>
        </div>
      </div>
    </div>
  );
}
