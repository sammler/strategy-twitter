const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const logger = require('winster').instance();

let doc = null;

try {
  doc = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './msg-topology.yml'), 'utf8'));
} catch (e) {
  logger.error('Error loading msg-topology.yml', e);
}

module.exports = doc;
