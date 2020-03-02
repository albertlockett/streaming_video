const dotenv = require('dotenv');
const { DOTENVPATH } = process.env;
if (DOTENVPATH) {
  dotenv.config({ path: DOTENVPATH });
} else {
  dotenv.config();
}

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const okta = require('@okta/okta-sdk-nodejs');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  region: 'us-east-1',
});

const s3 = new AWS.S3();
function retrieveFile(path, res) {
  const getParams = {
    Bucket: 'lockettflix.ca',
    Key: path.replace('/get_file/', ''),
  };

  s3.getObject(getParams, (err, data) => {
    if (err) {
      return res.status(400).send({ success: false, err });
    }

    // console.log(data);
    return res.send(data.Body);
  });
}

function retreiveFileList(res) {
  const getParams = {
    Bucket: 'lockettflix.ca',
  };

  s3.listObjects(getParams, (err, data) => {
    if (err) {
      return res.status(400).send({ success: false, err });
    }

    // console.log(data);
    // const body = data.Body;
    // console.log(body);
    // console.log(Object.keys(body))
    const fileList = data.Contents;
    const folders = new Set();
    fileList.forEach(({ Key }) => {
      console.log(Key.split('/'));
      console.log(Key.split('/')[0]);
      folders.add(Key.split('/')[0]);
    });

    console.log(folders);

    const fileList2 = [];
    folders.forEach(x => {
      console.log(x);
      fileList2.push(x);
    });
    console.log(fileList2.join('\n'));
    return res.send(fileList2.join('\n'));
  });
}

function setup(app) {
  app.use(cookieParser());
  app.use(cors());
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(
    expressSession({
      secret: process.env.APP_SECRET,
      resave: true,
      saveUninitialized: false,
    }),
  );

  const oidc = new ExpressOIDC({
    issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
    client_id: process.env.OKTA_CLIENT_ID,
    client_secret: process.env.OKTA_CLIENT_SECRET,
    redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
    scope: 'openid profile',
    appBaseUrl: `${process.env.HOST_URL}`,
    routes: {
      login: {
        path: '/login',
      },
      callback: {
        path: '/authorization-code/callback',
        defaultRedirect: '/logged_in',
      },
    },
  });

  const oktaClient = new okta.Client({
    orgUrl: `${process.env.OKTA_ORG_URL}`,
    token: `${process.OKTA_TOKEN}`,
  });

  app.use(oidc.router);

  app.use((req, res, next) => {
    if (!req.userinfo) {
      return next();
    }

    oktaClient
      .getUser(req.userinfo.sub)
      .then(user => {
        req.user = user;
        res.locals.user = user;
        next();
      })
      .catch(err => {
        next(err);
      });
  });

  app.get('/get_file/**', oidc.ensureAuthenticated(), (req, res) => {
    retrieveFile(req.path, res);
  });

  app.get('/list_videos', oidc.ensureAuthenticated(), (req, res) => {
    retreiveFileList(res);
  });
}

module.exports = setup;
