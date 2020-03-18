const rp = require('request-promise');
const htmlparser = require('node-html-parser')

let videoURL
let videoCreds

const videoList = {};
function getVideoList() {
  return videoList;
}

function parseMetaURL(body) {
  const metaLine = body.split('\n').find(line => {
    return line.trim().startsWith('<meta')
  });

  if (!metaLine) {
    console.error('cound not find meta line :(');
  }

  const url = metaLine.split('url=')[1].split('"')[0];
  return url;
}

function parseVideoListV2(body) {
  const files = body.querySelectorAll('a');
  const vids = [];
  // eslint-disable-next-line no-restricted-syntax, no-var
  for (const file of files) {
    const fileName = file.text;
    const ext = fileName.split('.')[1];
    if (!ext) {
      // eslint-disable-next-line no-continue
      continue;
    }
    vids.push({
      type: 'file',
      fileName,
      fileType: ext,
    });
  }
  return vids;
}

function parseVideoList(bodyRaw) {
  const body = htmlparser.parse(bodyRaw);
  const vids = [];
  const files = body.querySelectorAll('.file, .dir');
  if (files.length === 0) {
    // :shrug:
    return parseVideoListV2(body);
  }
  // eslint-disable-next-line no-restricted-syntax, no-var
  for (const file of files) {
    const tds = file.querySelectorAll('td');
    const fileD = {
      type: file.getAttribute('class'),
      fileName: tds[0].text,
    };
    if (fileD.type === 'file') {
      fileD.fileType = tds[1].text;
      fileD.size = tds[2].text;
    }
    vids.push(fileD);
  }

  // const dirs = body.querySelectorAll('.file');
  return vids;
}

async function fetchVideosAtPath(path) {
  const videoListRaw = await rp({
    method: 'GET',
    uri: `${videoURL}/hood/vids${path}`,
    headers: {
      Authorization: `Basic ${videoCreds}`,
    },
  });
  // TODO handle not found
  videoList[path] = parseVideoList(videoListRaw);
}

async function init() {
  try {
    const lockettCa = await rp({
      method: 'GET',
      uri: 'http://lockett.ca',
    });

    const homeIP = parseMetaURL(lockettCa);
    const tardis = await rp({
      method: 'GET',
      uri: `${homeIP}/tardis.html`,
    });
    videoURL = parseMetaURL(tardis);

    const { LOCKETT_UNAME: LU, LOCKETT_PW: LP } = process.env;
    videoCreds = Buffer.from(`${LU}:${LP}`).toString('base64');

    const videoListRaw = await rp({
      method: 'GET',
      uri: `${videoURL}/hood/vids/`,
      headers: {
        Authorization: `Basic ${videoCreds}`,
      },
    });
    const rootVids = parseVideoList(videoListRaw);
    videoList['/'] = rootVids;
  } catch (e) {
    console.error(e);
    throw e;
  }

  console.log({ videoCreds, videoURL })
}

module.exports = {
  init,
  getVideoList,
  fetchVideosAtPath,
};
