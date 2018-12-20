const mongodb = require('mongodb')
const keys = require('../config/keys')
const mongoClient = new mongodb.MongoClient(keys.mongoURI);

var _db

module.exports = {
  connectToDB: (callback) => {
    mongoClient.connect(err => {
      _db = mongoClient.db('flowngin-dev')
      return callback(err)
    })
  },

  getDB: () => {
    return _db;
  }
}