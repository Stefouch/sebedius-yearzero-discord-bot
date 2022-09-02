const { Client, Collection, OAuth2Scopes, PermissionsBitField } = require('discord.js');
const SebediusPermissions = require('./sebedius-permissions');
const Database = require('../database/database');
const Logger = require('../utils/logger');
const handleEvents = require('./handlers/event-handler');
const handleCommands = require('./handlers/command-handler');
const loadLocales = require('../locales/i18n');
const { Emojis } = require('../config');

class Sebedius extends Client {
  constructor(options) {
    super(options);

    this.version = require('../../package.json').version;
    this.config = require('../config');

    /**
     * Collection containing all the bot commands.
     * @type {Collection<string, import('./command')>}
     */
    this.commands = new Collection();

    /** @type {import('../database/database')} */
    this.database = null;

    /** @type {NodeJS.Timeout} */
    this.activity = null;
  }

  /* ------------------------------------------ */
  /*  Properties                                */
  /* ------------------------------------------ */

  get id() {
    return this.user.id;
  }

  get ownerId() {
    const id = process.env.OWNER_ID;
    if (!id) throw new Error('❌ Owner ID Not Found in Environment!');
    return id;
  }

  get permissions() {
    return new PermissionsBitField(SebediusPermissions);
  }

  get mention() {
    return this.user.toString();
  }

  get inviteURL() {
    return this.generateInvite({
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      permissions: this.permissions,
    });
  }

  /* ------------------------------------------ */
  /*  Load Sebedius                             */
  /* ------------------------------------------ */

  async startSebedius(options) {
    // Attaches a database.
    this.database = new Database(this, options.dbURI);

    await loadLocales();

    // Grafts our events & commands handlers to the client.
    await handleEvents(this, options.events);
    await handleCommands(this, options.commands);

    // Logs the client to Discord.
    await super.login(options.token);
  }

  /* ------------------------------------------ */
  /*  Discord Methods                           */
  /* ------------------------------------------ */

  async getGuildsCount() {
    return (await this.guilds.fetch()).size;
  }

  async getUsersCount() {
    await this.getGuildsCount();
    return this.guilds.cache.reduce((sum, g) => sum + g.memberCount, 0);
  }

  async getUser(userId) {
    let user = this.users.cache.get(userId);
    if (!user) user = await this.users.fetch(userId);
    return user;
  }

  async getChannel(chanId) {
    let chan = this.channels.cache.get(chanId);
    if (!chan) chan = await this.channels.fetch(chanId);
    return chan;
  }

  async getGuild(guildId) {
    let guild = this.guilds.cache.get(guildId);
    if (!guild) guild = await this.guilds.fetch(guildId);
    if (!guild) {
      const chan = await this.getChannel(guildId);
      // @ts-ignore
      if (chan) guild = chan.guild;
    }
    return guild;
  }

  async leaveBanned(guild) {
    Logger.warn(`${Emojis.ban} Guild is banned! → Leaving...`);
    return guild.leave();
  }

  /* ------------------------------------------ */
  /*  Database Methods                          */
  /* ------------------------------------------ */

  // TODO clean
  // async getGame(guildId) {
  //   const guild = await this.database.grabGuild(guildId);
  //   if (!guild?.game) return YearZeroGames.MUTANT_YEAR_ZERO;
  //   return guild.game;
  // }
}

module.exports = Sebedius;
