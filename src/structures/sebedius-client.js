const { Client, Collection, OAuth2Scopes, PermissionsBitField } = require('discord.js');
const SebediusPermissions = require('./sebedius-permissions');
const Database = require('../database/database');
const { YearZeroGames } = require('../constants');

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

    this.database = new Database(this, process.env.DATABASE_URI);
  }

  /* ------------------------------------------ */
  /*  Properties                                */
  /* ------------------------------------------ */

  get id() {
    return this.user.id;
  }

  get ownerId() {
    const id = process.env.OWNER;
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
  /*  Discord Methods                           */
  /* ------------------------------------------ */

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

  /* ------------------------------------------ */
  /*  Database Methods                          */
  /* ------------------------------------------ */

  async getGame(guildId) {
    const guild = await this.database.getGuild(guildId);
    if (!guild?.game) return YearZeroGames.MUTANT_YEAR_ZERO;
    return guild.game;
  }

  // TODO remove - useless
  async getGameAndLocale(guildId) {
    const out = {
      game: YearZeroGames.MUTANT_YEAR_ZERO,
      locale: this.config.defaultLocale,
    };
    const guild = await this.database.getGuild(guildId);
    if (guild) {
      if (guild.game) out.game = guild.game;
      if (guild.locale) out.locale = guild.locale;
    }
    return out;
  }
}

module.exports = Sebedius;
