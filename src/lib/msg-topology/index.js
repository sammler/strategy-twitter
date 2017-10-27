const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const logger = require('winster').instance();
const _ = require('lodash');

const defaultConfig = {
  file: {
    location: path.join(__dirname, './../../config/msg-topology.yml')
  }
};

class MsgTopology {

  constructor(config) {
    this.config = _.extend(defaultConfig, config);
    this.topology = null;
    this._init();
  }

  _init() {
    try {
      this.topology = yaml.safeLoad(fs.readFileSync(this.config.file.location, 'utf8'));
    } catch (err) {
      logger.error('Error loading msg-topology.yml', err);
    }
  }

  getExchange(id) {
    return _.find(this.topology.exchanges, {id});
  }
  getExchangeBy(query) {
    return _.find(this.topology.exchanges, query);
  }

  getQueue(id) {
    return _.find(this.topology.queues, {id});
  }
  getQueueBy(query) {
    return _.find(this.topology.queues, query);
  }

}

module.exports = MsgTopology;
