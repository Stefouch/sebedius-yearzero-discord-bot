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
    this.commands = Schemas.Command;
  }

  isReady() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async incrementCommand(interaction) {
    let commandName = interaction.commandName;

    // @ts-ignore
    if (interaction.options._subcommand) {
      commandName += '_' + interaction.options.getSubcommand();
    }

    return this.commands.findOneAndUpdate({ name: commandName }, {
      $setOnInsert: { name: commandName },
      $inc: { count: 1 },
      $currentDate: { lastUseTimestamp: true },
    }, {
      upsert: true,
      // new: true,
      // returnDocument: 'after',
      lean: true,
    });
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
    let document = await model.findOne({ _id: id });
    if (!document) {
      document = new model({ ...updateData, _id: id });
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
