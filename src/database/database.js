const mongoose = require('mongoose');
const Schemas = require('./models');
const Logger = require('../utils/logger');
const { isObjectEmpty } = require('../utils/object-utils');

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

  isReady() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * @param {string|import('discord.js').Guild} g
   * @param {UpdateData} [updateData]
   */
  async grabGuild(g, updateData) {
    return this.grab('guilds', g, updateData);
  }

  /**
   * @param {string} collection
   * @param {string|import('discord.js').Guild} item
   * @param {UpdateData} [updateData]
   */
  async grab(collection, item, updateData = {}) {
    /** @type {typeof Schemas.Guild} */
    const model = this[collection];
    const id = typeof item === 'string' ? item : item.id;
    let document = await model.findOne({ id });
    if (!document) {
      document = new model({ ...updateData, id });
      await document.save();
      Logger.client(`✨ Database | create: Guild ${id}`);
      return document;
    }
    if (isObjectEmpty(updateData)) return document;
    const data = {};
    for (const [k, v] of Object.entries(updateData)) {
      if (k !== 'id' && document[k] !== v) data[k] = v;
    }
    if (!isObjectEmpty(data)) {
      await document.updateOne(data);
      Logger.client(`📝 Database | update: Guild ${id} with ${JSON.stringify(data)}`);
    }
    return document;
  }
}

module.exports = Database;

/**
 * @typedef {Object.<string, any>} UpdateData
 */
