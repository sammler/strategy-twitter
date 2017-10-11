const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamp');

const MongooseConfig = require('./../../config/mongoose-config');
const Lib = require('./../../lib');
const Schema = mongoose.Schema;

const schema = new Schema({
  ts_utc: {
    type: Schema.Types.Date,
    required: true,
    default: Lib.nowUtc()
  },
  correlation_id: {
    type: Schema.Types.String
  },
  action: {
    type: Schema.Types.String,
  },
  status: {
    type: Schema.Types.String,
  },
  result: {
    type: Schema.Types.Object
  }
}, {
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_EVENT_LOGS,
  strict: true
});

schema.plugin(timeStamps, {createdAt: MongooseConfig.FIELD_CREATED, updatedAt: MongooseConfig.FIELD_UPDATED});

const model = mongoose.model(MongooseConfig.COLLECTION_EVENT_LOGS, schema);

module.exports = {
  Schema: schema,
  Model: model
};
