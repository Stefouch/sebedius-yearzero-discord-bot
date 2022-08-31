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

  /**
   * Sets the informations for a guild.
   * @param {import('discord.js').Guild} guild
   * @param {Object} [options]
   */
  async setGuild(guild, options = {}) {
    let guildDocument = await this.getGuild(guild.id);
    if (!guildDocument) {
      guildDocument = new this.guilds({
        ...options,
        id: guild.id,
      });
      return guildDocument.save();
    }
    for (const key in options) {
      if (guildDocument[key] !== options[key]) guildDocument[key] = options[key];
    }
    return guildDocument.updateOne(options);
  }
}

module.exports = Database;
