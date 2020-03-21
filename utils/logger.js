const colors = require('colors/safe');
const moment = require('moment');

const hues = [
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'red',
  'gray',
  'grey',
];

let hueIndex = 0;

const now = () => moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);

const makeLogger = name => {
  // round robin hueues
  const hue = hues[hueIndex];
  hueIndex += 1;
  if (hueIndex >= hues.length) {
    hueIndex = 0;
  }

  const colorName = colors[hue](name);
  return {
    log: message => {
      // eslint-disable-next-line no-console
      console.log(`[LOG ][${now()}][${colorName}] ${message}`);
    },
    info: message => {
      // eslint-disable-next-line no-console
      console.log(`[INFO][${now()}][${colorName}] ${message}`);
    },
    error: message => {
      // eslint-disable-next-line no-console
      console.log(`[INFO][${now()}][${colorName}] ${message}`);
    },
  };
};

module.exports.makeLogger = makeLogger;
