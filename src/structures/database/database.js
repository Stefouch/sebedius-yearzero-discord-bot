const mongoose = require('mongoose');
const Schemas = require('./models');
const Logger = require('../../utils/logger');
const { isObjectEmpty } = require('../../utils/object-utils');

class Database {
  constructor(client, uri) {
    mongoose.connect(uri, {
      autoIndex: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    }).then(() => Logger.client('🗂️ Sebedius is connected to the database!'))
      .catch(Logger.error);

    this.client = client;
    this.guilds = Schemas.Guild;
    this.commands = Schemas.Command;
    this.initiatives = Schemas.Initiative;

    this.initiatives.schema.index({ updatedAt: 1 }, { expires: this.client.config.Commands.initiative.expires });
  }

  /**
   * Whether the Mongoose connection is ready.
   * @example mongoose.connection.readyState === 1
   * @returns {boolean}
   */
  isReady() {
    return mongoose.connection.readyState === 1;
  }

  /* ------------------------------------------ */

  /**
   * Increments the usage counter of a command.
   * @param {string}  commandName
   * @param {string} [subCommand]
   */
  async incrementCommand(commandName, subCommand) {
    if (subCommand?.length) commandName += '_' + subCommand;

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

  /* ------------------------------------------ */

  /**
   * @param {string} guildId Guild ID
   * @param {mongoose.UpdateQuery<any>} [updateData]
   * @param {mongoose.QueryOptions}     [options]
   * @returns {Promise.<mongoose.HydratedDocument.<typeof Schemas.Guild.schema.obj>>}
   */
  async grabGuild(guildId, updateData, options) {
    return this.grab('Guild', guildId, updateData, options);
  }

  /**
   * @param {string} guildId Guild ID
   * @param {mongoose.UpdateQuery<any>} [updateData]
   * @param {mongoose.QueryOptions}     [options]
   * @returns {Promise.<mongoose.Document & { cards: number[] }>}
   */
  async grabInitiative(guildId, updateData, options) {
    return this.grab('Initiative', guildId, updateData, options);
  }

  /* ------------------------------------------ */

  /**
   * Returns a document from a collection, with the following:
   * - Updates the document if update data is provided.
   * - Creates the document (with the update data) if it does not exist.
   * @param {string} modelName
   * @param {string} id
   * @param {mongoose.UpdateQuery<any>} [updateData]
   * @param {mongoose.QueryOptions}     [options]
   * @returns {Promise.<mongoose.HydratedDocument.<any>>}
   */
  async grab(modelName, id, updateData = {}, options = {}) {
    const modelCollection = modelName.toLowerCase() + 's';

    /** @type {mongoose.Model} */
    const c = this[modelCollection];
    if (!c) throw new mongoose.MongooseError(`Unknown collection: ${modelCollection}`);

    const opts = {
      upsert: true,
      new: true,
      lean: false,
      ...options,
    };

    /** @type {mongoose.Document} */
    let document;

    if (isObjectEmpty(updateData)) {
      document = await c.findById(id, null, opts);
    }
    else {
      document = await c.findByIdAndUpdate(id, updateData, opts);
    }

    if (!document) {
      const msg = `Undefined Document [${modelCollection}:${id}]`
        + ` with updateData ${JSON.stringify(updateData)}`
        + ` and options ${JSON.stringify(opts)}`;
      throw new mongoose.MongooseError(msg);
    }

    if (!opts.lean) {
      if (document.isNew) {
        Logger.client(`✨ Database | create: ${modelName} ${id}`);
      }
      if (document.isModified()) {
        Logger.client(`📝 Database | update: ${modelName} ${id} with ${JSON.stringify(updateData)}`);
      }
    }

    return document;
  }
}

module.exports = Database;
