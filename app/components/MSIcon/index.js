import React from 'react';
import LoginGreenBack from 'images/login_logo_greenback.png'
import Folder1 from 'images/folder_1.png';

function getIconFromName({ name }) {
  // eslint-disable-next-line default-case
  switch (name) {
    case 'folder':
      return Folder1;
    case 'login_green':
      return LoginGreenBack;
  }
}

const styles = {
  baseStyle: {
    display: 'inline-block',
    margin: '12px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  imageStyle: {
    width: '64px',
    height: '64px',
  },
  iconText: {
    color: 'white',
  },
};

export default function MSIcon(props) {
  const icon = getIconFromName(props);
  return (
    <div style={styles.baseStyle} onClick={props.onClick}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img style={styles.imageStyle} src={icon} />
      <div style={styles.iconText}>{props.text}</div>
    </div>
  );
}
