import React from 'react';
import MSIcon from 'components/MSIcon';
import StartMenu from 'components/StartMenu';
import Window from 'components/Window';

const styles = {
  main: {
    background: 'rgb(70, 123, 124)',
    width: '100vw',
    height: '100vh',
  },
};

function createWindowState(title) {
  return {
    title,
  };
}

export default function HomePageCool(props) {
  const [windows, updateWindows] = React.useState({});
  return (
    <div style={styles.main}>
      <MSIcon
        name="login_green"
        text="login"
        onClick={() => {
          if (!updateWindows.login) {
            updateWindows({ ...windows, login: createWindowState('login') });
          }
        }}
      />
      <br />
      <MSIcon
        name="folder"
        text="videos"
        onClick={() => {
          if (!updateWindows.videos) {
            updateWindows({ ...windows, videos: createWindowState('videos') });
          }
        }}
      />
      {Object.values(windows).map((p, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Window key={i} {...p} />
      ))}
      <StartMenu />
    </div>
  );
}
