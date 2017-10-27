const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const logger = require('winster').instance();
const _ = require('lodash');

const defaultConfig = {
  topology_file: path.join(__dirname, './../../config/msg-topology.yml')
};

class MsgTopology {

  /**
   *
   * @param config
   * @param {String} config.topology_file
   */
  constructor(config) {
    this.config = _.extend(defaultConfig, config);
    this.topology = null;
    this._init();
  }

  _init() {
    try {
      this.topology = yaml.safeLoad(fs.readFileSync(this.config.topology_file, 'utf8'));
    } catch (err) {
      logger.error('Error loading msg-topology.yml', err);
    }
  }

  getExchange(id) {
    return _.find(this.topology.exchanges, {id});
  }
  getExchangeBy(query) {
    return _.filter(this.topology.exchanges, query);
  }

  getQueue(id) {
    return _.find(this.topology.queues, {id});
  }
  getQueueBy(query) {
    return _.filter(this.topology.queues, query);
  }

}

module.exports = MsgTopology;
