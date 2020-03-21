const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  region: 'us-east-1',
});

const s3 = new AWS.S3();

let allFileObjects = {};

const getAllFileObjects = () => allFileObjects;

const refreshAllFileObjects = async (path = '') => {
  const params = {
    Bucket: 'lockettflix.ca',
    Prefix: '__dir__',
    Delimiter: '/',
  };
  const objects = await new Promise((resolve, reject) => {
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
  const nextfileObjects = {};
  objects.CommonPrefixes.forEach(({ Prefix }) => {
    const effectiveKey = Prefix.split('/').map(segment =>
      segment.replace(/^__dir__/, ''),
    );
    nextfileObjects[effectiveKey.join('/')] = {};
  });

  allFileObjects = nextfileObjects;
};

setInterval(async () => {
  // for (const key of Object.keys(allFileObjects)) {
  console.log('refetching file objects:');
  refreshAllFileObjects();
  // }
}, 5000);

async function init() {
  await refreshAllFileObjects();
}

module.exports = {
  init,
  getAllFileObjects,
  refreshAllFileObjects,
};
