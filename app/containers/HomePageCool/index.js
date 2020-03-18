import React from 'react';
import _ from 'lodash';
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

function createWindowState({
  title,
  windows,
  createWindow,
  updateWindows,
  setWindowSelected,
  setResizingSelected,
  extraProps,
}) {
  const numberOfWindows = Object.keys(windows).length;
  // eslint-disable-next-line no-shadow
  const close = windows => {
    updateWindows(_.omit(windows, title));
  };
  // eslint-disable-next-line no-shadow
  const maximize = windows => {
    const styleBefore = _.get(windows, [title, 'style']);
    _.set(windows, [title, 'style'], {
      ...styleBefore,
      width: '100vw',
      height: '100vh',
      top: 0,
      left: 0,
    });
    console.log({});
    updateWindows({ ...windows });
  };
  // eslint-disable-next-line no-shadow
  const minimize = windows => {
    _.set(windows, [title, 'style', 'minimized'], true);
    updateWindows({ ...windows });
  };

  return {
    title,
    minimized: false,
    setWindowSelected,
    setResizingSelected,
    // createWindow,
    close,
    maximize,
    minimize,
    style: {
      position: 'absolute',
      top: 24 * numberOfWindows,
      left: 1 * numberOfWindows,
      width: 200,
      height: 100,
    },
    ...extraProps,
  };
}

export default function HomePageCool(props) {
  const [windows, updateWindows] = React.useState({});
  const [windowSelected, setWindowSelected] = React.useState(null);
  const [resizingSelected, setResizingSelected] = React.useState(null);

  const repositionWindow = e => {
    const window = windows[windowSelected];
    const currentstyle = window.style;
    currentstyle.top += e.movementY;
    currentstyle.left += e.movementX;
    updateWindows({ ...windows });
  };

  const resizeElement = e => {
    const window = windows[resizingSelected];
    const currentstyle = window.style;
    currentstyle.height += e.movementY;
    currentstyle.width += e.movementX;
    updateWindows({ ...windows });
  };

  const createWindow = (title, extraProps) => {
    if (!windows[title]) {
      updateWindows({
        ...windows,
        [title]: createWindowState({
          title,
          windows,
          updateWindows,
          setWindowSelected,
          setResizingSelected,
          createWindow,
          extraProps,
        }),
      });
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      style={styles.main}
      onMouseMove={e => {
        if (windowSelected) {
          repositionWindow(e);
        }
        if (resizingSelected) {
          resizeElement(e);
        }
      }}
      onMouseUp={() => {
        setWindowSelected(null);
        setResizingSelected(null);
      }}
    >
      <MSIcon
        name="login_green"
        text="login"
        onClick={() => {
          createWindow('login');
        }}
      />
      <br />
      <MSIcon
        name="folder"
        text="videos"
        onClick={() => {
          createWindow('videos');
        }}
      />
      {Object.values(windows).map((p, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Window key={i} {...{ ...p, windows, createWindow }} />
      ))}
      <StartMenu />
    </div>
  );
}
