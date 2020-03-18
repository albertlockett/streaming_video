/* eslint-disable no-console */
const fs = require('fs');
const request = require('request');
const rp = require('request-promise');
const yargs = require('yargs');

async function doAll(args) {
  // TODO validate args
  await fetchVideo(args);
}

async function fetchVideo(args) {
  const { videoURL, videoCreds, video } = args;
  const fullURL = `${videoURL}/hood/vids/${video}`;

  const outputFileName = `/tmp/${video.replace(/\//g, '_')}`;
  const outputStream = fs.createWriteStream(outputFileName);

  const headers = await rp(fullURL, {
    method: 'HEAD',
    headers: {
      Authorization: `Basic ${videoCreds}`,
    },
  });
  const contentLength = headers['content-length'];

  const fstatInterval = setInterval(() => {
    try {
      const { size } = fs.statSync(outputFileName);
      const pct = ((size / contentLength) * 100).toFixed(2);
      console.log(`downloading ${outputFileName} ${pct}%`);
    } catch (e) {
      console.error(e);
    }
  }, 1000);

  await new Promise((resolve, reject) => {
    request
      .get(fullURL, {
        encoding: null,
        headers: {
          Authorization: `Basic ${videoCreds}`,
        },
      })
      .pipe(outputStream)
      .on('finish', () => {
        console.log(`The file is finished downloading.`);
        resolve();
      })
      .on('error', error => {
        reject(error);
      });
  });

  clearInterval(fstatInterval);
}

async function transformVideo(args) {}

doAll(yargs.parse(process.argv));
