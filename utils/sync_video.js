/* eslint-disable no-console */
const dotenv = require('dotenv');
const { DOTENVPATH } = process.env;
if (DOTENVPATH) {
  dotenv.config({ path: DOTENVPATH });
} else {
  dotenv.config();
}

const { spawn } = require('child_process');
const fs = require('fs');
const recursive = require('recursive-readdir');
const request = require('request');
const rp = require('request-promise');
const rimraf = require('rimraf');
const yargs = require('yargs');
const AWS = require('aws-sdk');

const DL_LOCATION = `/tmp/`;

const ffmpegExecutable = `docker run -v /tmp:/tmp jrottenberg/ffmpeg -y `;
const bento4Executable = `docker run -v /tmp:/tmp alfg/bento4 mp4hls`;

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  region: 'us-east-1',
});
const s3 = new AWS.S3();

function withoutExtension(filename) {
  const segments = filename.split('.');
  segments.pop();
  return segments.join('.');
}

const FFMPEG_CMDS = {
  CREATE_MP4: (withExt, filename = withoutExtension(withExt)) =>
    `-i ${withExt} ${filename}_vod_max.mp4`,
  CREATE_720P: (withExt, filename = withoutExtension(withExt)) =>
    `-i ${DL_LOCATION}${filename}_vod_max.mp4 -s hd720 ${DL_LOCATION}${filename}_vod_720.mp4`,
  CREATE_480P: (withExt, filename = withoutExtension(withExt)) =>
    `-i ${DL_LOCATION}${filename}_vod_720.mp4 -s hd480 ${DL_LOCATION}${filename}_vod_480.mp4`,
  CREATE_240P: (withExt, filename = withoutExtension(withExt)) =>
    `-i ${DL_LOCATION}${filename}_vod_480.mp4 -s qvga ${DL_LOCATION}${filename}_vod_240.mp4`,
};

async function doAll(args) {
  // TODO validate args
  // await fetchVideo(args);
  // await transformVideo(args);
  // await makeHLSSegments(args);
  await syncToS3(args);
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

function runChildProcess(command, commandRef = '') {
  const segments = command.split(' ');
  const cmd = segments.shift();
  const child = spawn(cmd, segments.filter(s => s));
  console.log(`executing: ${command}`);

  child.stdout.on('data', data => {
    console.log(`${commandRef} child stdout> ${data}`);
  });

  child.stderr.on('data', data => {
    console.error(`${commandRef} child stderr> ${data}`);
  });

  return new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      console.log(
        `child process exited with code ${code} and signal ${signal}`,
      );
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
}

// eslint-disable-next-line consistent-return
async function deleteOutputFirst(command) {
  const file = command.split(' ').pop();
  const fileExists = await new Promise((resolve, reject) => {
    fs.exists(file, (exists, err) => {
      if (err) {
        reject(err);
      }
      resolve(exists);
    });
  });
  if (fileExists) {
    return new Promise((resolve, reject) => {
      fs.unlink(file, err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}

async function transformVideo(args) {
  const { video } = args;
  const makeVODMax = `${ffmpegExecutable} ${FFMPEG_CMDS.CREATE_MP4(video)}`;
  await runChildProcess(makeVODMax);

  const make720 = `${ffmpegExecutable} ${FFMPEG_CMDS.CREATE_720P(video)}`;
  await deleteOutputFirst(make720);
  await runChildProcess(make720, `make_720 ${video}`);

  const make480 = `${ffmpegExecutable} ${FFMPEG_CMDS.CREATE_480P(video)}`;
  await deleteOutputFirst(make480);
  await runChildProcess(make480, `make_480 ${video}`);

  const make240 = `${ffmpegExecutable} ${FFMPEG_CMDS.CREATE_240P(video)}`;
  await deleteOutputFirst(make240);
  await runChildProcess(make240, `make_240 ${video}`);
}

async function makeHLSSegments(args) {
  const { video } = args;
  const qualities = ['max', 720, 480, 240];
  const fileNames = qualities
    .map(
      quality => `${DL_LOCATION}/${withoutExtension(video)}_vod_${quality}.mp4`,
    )
    .join(' ');

  const outputLocation = `${DL_LOCATION}/${withoutExtension(video)}_hls/`;
  rimraf.sync(outputLocation);
  const makeHLSCommand = `${bento4Executable} -o ${outputLocation} ${fileNames}`;

  await runChildProcess(makeHLSCommand);
}

async function s3ObjectExists(Bucket, Key) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket,
      Key,
    };
    s3.headObject(params, err => {
      if (err) {
        if (err.code === 'NotFound') {
          resolve(false);
        } else {
          console.log({ err });
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  });
}

async function syncToS3(args) {
  const { video } = args;
  const outputLocation = `${DL_LOCATION}${withoutExtension(video)}_hls/`;
  const s3Folder = `__dir__${video}/`;
  const s3Bucket = process.env.AWS_BUCKET;

  const files = await new Promise((resolve, reject) => {
    recursive(outputLocation, async (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });
  console.log(files);

  let fileIndex = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    fileIndex += 1;
    const status = `uload ${fileIndex}/${files.length} > `;
    const s3Key = file.replace(outputLocation, s3Folder);
    // eslint-disable-next-line no-await-in-loop
    const fileExists = await s3ObjectExists(s3Bucket, s3Key);
    if (fileExists) {
      console.log(`${status} ${s3Key} exists (skipping)`);
    } else {
      console.log(`${status} ${s3Key}`);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve, reject) => {
        const params = {
          Bucket: s3Bucket,
          Key: s3Key,
          Body: fs.readFileSync(file),
        };
        // console.log(params);
        s3.upload(params, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    }
  }
}

doAll(yargs.parse(process.argv));
