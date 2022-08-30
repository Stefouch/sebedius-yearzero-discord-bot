const mongoose = require('mongoose');
const Schemas = require('./models');
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
    this.guilds = Schemas.Guild;
  }
  /**
   * Gets the stored informations for a guid.
   * @param {string} id
   */
  async getGuild(id) {
    return this.guilds.findOne({ id });
  }
}

module.exports = Database;
