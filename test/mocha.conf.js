const jsYml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// process.env.NODE_ENV = 'test';
// process.env.WINSTER_SUPRESS_LOGGING = '';

// if (process.env.CIRCLECI !== 'true') {
//
// }

// const secrets = jsYml.safeLoad(fs.readFileSync(path.join(__dirname, '../src/secrets/secrets.override.yml'), 'utf8'));
// if (secrets) {
//   for (let [key, value] of Object.entries(secrets)) {
//     process.env[key] = value;
//   }
// }

global.expect = require('chai').expect;

