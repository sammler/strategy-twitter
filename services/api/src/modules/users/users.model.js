const mongoose = require('mongoose');
const timeStamps = require('mongoose-timestamp');

const MongooseConfig = require('./../../config/mongoose-config');
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
  }
}, {
  collection: MongooseConfig.COLLECTION_PREFIX + MongooseConfig.COLLECTION_USERS,
  strict: true
});

schema.index({twitter_id: 1});
schema.plugin(timeStamps, {createdAt: MongooseConfig.FIELD_CREATED, updatedAt: MongooseConfig.FIELD_UPDATED});

const model = mongoose.model(MongooseConfig.COLLECTION_USERS, schema);

module.exports = {
  Schema: schema,
  Model: model
};
