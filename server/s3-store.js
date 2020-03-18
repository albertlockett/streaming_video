const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  region: 'us-east-1',
});

const s3 = new AWS.S3();

const allFileObjects = {};

const getAllFileObjects = () => allFileObjects;

const refreshAllFileObjects = async (path = '') => {
  const params = {
    Bucket: 'lockettflix.ca',
    Prefix: '__dir__',
  };
  const objects = await new Promise((resolve, reject) => {
    s3.listObjectsV2(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
  objects.Contents.forEach(obj => {
    const effectiveKey = obj.Key.split('/').map(segment =>
      segment.replace(/^__dir__/, ''),
    );
    allFileObjects[effectiveKey.join('/')] = {};
  });
};

async function init() {
  await refreshAllFileObjects();
}

module.exports = {
  init,
  getAllFileObjects,
  refreshAllFileObjects,
};
