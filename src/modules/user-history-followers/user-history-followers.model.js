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
  follower_id: {
    type: Schema.Types.Number
  },
  // Todo(AAA): Should be renamed to last_check_utc_ts
  last_check: {
    type: Schema.Types.Date,
    required: true
  },
  // Todo(AAA): Should be renamed to start_date_utc
  start_date: {
    type: Schema.Types.Date,
    required: true,
    default: Lib.startOfDayUtc()
  },
  // Todo(AAA): Should be renamed to end_date_utc
  end_date: {
    type: Schema.Types.Date
  }
}, {
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_USER_HISTORY_FOLLOWERS,
  strict: true
});

schema.index({twitter_id: 1, follower_id: 1});
schema.plugin(timeStamps, {createdAt: MongooseConfig.FIELD_CREATED, updatedAt: MongooseConfig.FIELD_UPDATED});

const model = mongoose.model(MongooseConfig.COLLECTION_USER_HISTORY_FOLLOWERS, schema);

module.exports = {
  Schema: schema,
  Model: model
};
