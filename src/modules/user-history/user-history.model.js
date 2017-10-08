const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamp');

const MongooseConfig = require('./../../config/mongoose-config');
const Lib = require('./../../lib');
const Schema = mongoose.Schema;

const schema = new Schema({
  twitter_id: {
    type: Schema.Types.Number,
    required: true
  },
  // Todo: Should be renamed to date_utc
  date_utc: {
    type: Schema.Types.Date,
    required: true
  },
  friends_count: {
    type: Schema.Types.Number,
    required: true
  },
  statuses_count: {
    type: Schema.Types.Number,
    required: true
  },
  listed_count: {
    type: Schema.Types.Number,
    required: true

  },
  followers_count: {
    type: Schema.Types.Number,
    required: true
  },
  // Todo: We should probably rename this to last_sync_utc_ts to prevent confusion
  last_sync_ts: {
    type: Schema.Types.Date,
    required: true,
    default: Lib.nowUtc()
  }
}, {
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_USER_HISTORY,
  strict: true
});

schema.index({twitter_id: 1, date_utc: 1});

// Todo: seems that by passing a boolean value to the options, we would disable it;
// Todo: If this is not the case, then let's just not use mongoose-timestamp for this model, as it is overkill
schema.plugin(timeStamps, {createdAt: MongooseConfig.FIELD_CREATED, updatedAt: MongooseConfig.FIELD_UPDATED});

const model = mongoose.model(MongooseConfig.COLLECTION_USER_HISTORY, schema);

module.exports = {
  Schema: schema,
  Model: model
};
