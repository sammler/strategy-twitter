const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamp');

const MongooseConfig = require('./../../config/mongoose-config');
const Lib = require('./../../lib');
const Schema = mongoose.Schema;

const schema = new Schema({
  twitter_id: {
    type: Number,
    required: true
  },
  screen_name: {
    type: String,
    required: true
  },
  profile: {
    type: Object
  },
  // Todo: We should rename this to last_sync_utc_ts to prevent confusions and errors ...
  last_sync_ts: {
    type: Schema.Types.Date,
    required: true,
    default: Lib.nowUtc()
  }
}, {
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_USERS,
  strict: true
});

schema.index({twitter_id: 1, screen_name: 1});
schema.plugin(timeStamps, {createdAt: MongooseConfig.FIELD_CREATED, updatedAt: MongooseConfig.FIELD_UPDATED});

const model = mongoose.model(MongooseConfig.COLLECTION_USERS, schema);

module.exports = {
  Schema: schema,
  Model: model
};
