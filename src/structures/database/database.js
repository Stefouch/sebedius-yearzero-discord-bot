const mongoose = require('mongoose');
const Schemas = require('./models');
const Logger = require('../../utils/logger');
// const { isObjectEmpty } = require('../../utils/object-utils'); // TODO clean

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

    if (interaction.options.getSubcommand(false)) {
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
   * See {@link Database.grab}
   * @param {string}      id
   * @param {UpdateData} [updateData]
   */
  async grabGuild(id, updateData) {
    return this.grab('guilds', id, updateData);
  }

  // async getGuild(id) {
  //   const document = await this.guilds.findById(id, null, { upsert: true });
  //   if (document.isNew) Logger.client(`✨ Database | create: Guild ${id}`);
  //   return document;
  // }

  /**
   * Returns a document from a collection, with the following:
   * - Updates the document if update data is provided.
   * - Creates the document (with the update data) if it does not exist.
   * @param {string}      collection
   * @param {string}      id
   * @param {UpdateData} [updateData]
   */
  async grab(collection, id, updateData = {}) {
    /** @type {typeof Schemas.Guild} */
    const model = this[collection];
    if (!model) throw new TypeError(`Collection "${collection} does not exist in database!"`);
    if (!id || typeof id !== 'string') return undefined;

    const document = await model.findByIdAndUpdate(id, updateData, {
      upsert: true,
      new: true,
      // maxTimeMS: 2000,
    });

    if (document.isNew) Logger.client(`✨ Database | create: Guild ${id}`);
    if (document.isModified()) Logger.client(`📝 Database | update: Guild ${id} with ${JSON.stringify(updateData)}`);

    return document;

    // let document = await model.findOne({ _id: id });

    // if (!document) {
    //   document = new model({ ...updateData, _id: id });
    //   await document.save();
    //   Logger.client(`✨ Database | create: Guild ${id}`);
    //   return document;
    // }

    // if (isObjectEmpty(updateData)) return document;

    // const data = {};

    // for (const [k, v] of Object.entries(updateData)) {
    //   if (k !== 'id' && document[k] !== v) data[k] = v;
    // }

    // if (!isObjectEmpty(data)) {
    //   await document.updateOne(data);
    //   Logger.client(`📝 Database | update: Guild ${id} with ${JSON.stringify(data)}`);
    // }

    // return document;
  }
}

module.exports = Database;

/**
 * @typedef {Object.<string, any>} UpdateData
 */
