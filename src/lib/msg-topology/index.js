
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const logger = require('winster').instance();

let instance = null;

class MsgTopology {

  constructor() {
    this.topology = null;
    this._init();
  }

  static instance(/* config */) {
    if (!instance) {
      instance = new MsgTopology();
    }
    return instance;
  }

  _init() {
    try {
      this.topology = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './../../config/msg-topology.yml'), 'utf8'));
    } catch (e) {
      logger.error('Error loading msg-topology.yml', e);
    }
  }

}

module.exports = MsgTopology;
