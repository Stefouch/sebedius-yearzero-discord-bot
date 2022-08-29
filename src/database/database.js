const mongoose = require('mongoose');
const Logger = require('../utils/logger');

class Database {
  constructor(client, uri) {
    mongoose.connect(uri, {
      autoIndex: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    }).then(() => Logger.client('✔ Sebedius is connected to the database!'))
      .catch(err => Logger.error(err));

    this.client = client;
  }
}

module.exports = Database;
