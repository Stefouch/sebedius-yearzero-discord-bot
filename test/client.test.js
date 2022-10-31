const { describe, it } = require('mocha');
const expect = require('chai').expect;
const sinon = require('sinon');
const Discord = require('discord.js');
const Sebedius = require('../src/structures/sebedius-client');
const loadLocales = require('../src/locales/i18n');
const handleCommands = require('../src/structures/handlers/command-handler');
const { YearZeroGames, YearZeroGameNames } = require('../src/constants');

const commandPattern = './src/commands/**/*.js';
const size = require('glob').sync(commandPattern).length;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

describe('DISCORD BOT CLIENT "SEBEDIUS"', function () {
  // this.slow(500);
  this.timeout(5000);
  // this.retries(3);

  const bot = new Sebedius({ intents: require('../src/structures/sebedius-intents') });
  bot.database = {};
  bot.database.isReady = () => false;
  bot.database.getInitiative = async () => null;
  bot.user = new Discord.User(bot, {
    username: 'Sebedius',
    discriminator: '1234',
    id: process.env.BETA_BOT_ID,
  }),
  bot.muted = true;
  const owner = new Discord.User(bot, {
    username: 'BotOwner',
    discriminator: '1234',
    id: process.env.OWNER_ID,
  });
  bot.users.cache.set(owner.id, owner);

  this.beforeAll(function () {
    return new Promise(resolve => {
      loadLocales(bot)
        .then(() => handleCommands(bot, commandPattern)
          .then(() => resolve()));
    });
  });

  describe('❯ Check all games are correctly configured', function () {
    for (const game of Object.values(YearZeroGames)) {
      describe(`${game}: ${YearZeroGameNames[game]}`, function () {
        it('Should have a name', function () {
          expect(YearZeroGameNames[game]).to.exist;
        });
        it('Should have roll options', function () {
          expect(bot.config.Commands.roll.options[game], `bot.config.Commands.roll.options.${game}`).to.not.be.empty;
        });
        it('Should have emoji dice icons', function () {
          expect(bot.config.DiceIcons[game], `bot.config.DiceIcons.${game}`).to.not.be.empty;
        });
      });
    }
  });

  it(`Sebedius is successfully created with ${size} commands`, function () {
    expect(bot, 'client').to.be.instanceOf(Sebedius);
    expect(bot.id, 'clientId').to.equal(process.env.BETA_BOT_ID);
    expect(owner, 'owner').to.be.instanceOf(Discord.User);
    expect(bot.ownerId, 'ownerId').to.equal(owner.id);
    expect(bot.commands.size, 'commands.size').to.be.equal(size);
  });

  it('All commands should have correct properties', function () {
    for (const [cmdName, cmd] of bot.commands) {
      expect(cmd.name, 'Command name').to.equal(cmdName);
      expect(cmd.category, 'Command category').to.be.a('number').greaterThan(0);
      expect(cmd.description, 'Command description').to.be.a('string').with.length.greaterThan(0);
    }
  });

  it('Check all command files', function () {
    describe('❯ Check each command with custom interaction', function () {
      const sandbox = sinon.createSandbox();
      const guildOptions = { game: 'myz', locale: bot.config.defaultLocale };

      this.beforeEach(function () {
        fakeDiscord(bot);
      });

      this.afterEach(function () {
        sandbox.restore();
      });

      for (const [cmdName, cmd] of bot.commands) {

        it(`Command: ${cmdName}`, async function () {
          if (cmd.ownerOnly) this.skip();
          const t = bot.i18n.getFixedT(bot.config.defaultLocale);

          let option = {};
          if (cmdName === 'conf') {
            this.skip();
          }
          else if (cmdName === 'crit') {
            option = {
              name: 'fbl',
              type: Discord.ApplicationCommandOptionType.Subcommand,
              options: [{
                name: 'lucky',
                value: 2,
                type: Discord.ApplicationCommandOptionType.Integer,
              }],
            };
          }
          else if (cmdName === 'help') {
            option = { name: 'command', value: 'help', type: Discord.ApplicationCommandOptionType.String };
          }
          else if (cmdName === 'initiative') {
            option = {
              name: 'draw',
              type: Discord.ApplicationCommandOptionType.Subcommand,
              options: [{
                name: 'speed',
                value: 4,
                type: Discord.ApplicationCommandOptionType.Integer,
              }, {
                name: 'keep',
                value: 2,
                type: Discord.ApplicationCommandOptionType.Integer,
              }],
            };
          }
          else if (cmdName === 'panic') {
            option = { name: 'stress', value: 10, type: Discord.ApplicationCommandOptionType.Integer };
          }
          else if (cmdName === 'rolla') {
            this.skip();
          }
          else if (cmdName === 'roll') {
            option = {
              name: 'myz',
              type: Discord.ApplicationCommandOptionType.Subcommand,
              options: [{
                name: 'base',
                value: 4,
                type: Discord.ApplicationCommandOptionType.Integer,
              }, {
                name: 'maxpush',
                value: 0,
                type: Discord.ApplicationCommandOptionType.Integer,
              }],
            };
          }
          else if (cmdName === 'rolld66') {
            option = { name: 'die', value: 'D666', type: Discord.ApplicationCommandOptionType.String };
          }
          else if (cmdName === 'thread') {
            this.skip();
          }
          console.log('      ┌Options:', JSON.stringify(option));

          const interaction = createFakeInteraction(bot, cmdName, [option]);

          const matahari = sandbox.spy(interaction, 'reply');
          await cmd.run(interaction, t, guildOptions);

          expect(matahari.calledOnce).to.be.true;
        });
      }
    });
  });
});

/**
 * Creates a fake Discord message with full needed data.
 * Includes (all cached):
 * * 1x Guild
 * * 1x Role (@everyone)
 * * 1x TextChannel
 * * 1x User
 * * 2x GuildMembers
 * * 1x Message (returned) with overriden methods: `send`, `reply`, `delete` and `react`.
 * @param {Discord.Client} client The bot
 * @returns {Discord.ChatInputCommandInteraction}
 */
function fakeDiscord(client) {
  // Creates a fake Discord Guild/Server.
  const guild = new Discord.Guild(
    client,
    {
      name: 'Fake Guild',
      id: Discord.SnowflakeUtil.generate(),
      type: 0,
      owner_id: client.user.id,
    },
  );
  guild.roles.cache.set(guild.id, new Discord.Role(
    client,
    {
      name: 'at-everyone',
      id: guild.id,
      color: 11493413,
      permissions: Discord.PermissionFlagsBits.Administrator,
    },
    guild,
  ));
  client.guilds.cache.set(guild.id, guild);

  // Creates a fake Discord TextChannel.
  const channel = Object.assign(
    new Discord.TextChannel(
      guild,
      {
        name: 'Fake Channel',
        id: Discord.SnowflakeUtil.generate(),
        type: 0,
      },
    ),
    {
      send: async msg => fakeSimpleMessage(client, channel, msg),
    },
  );
  guild.channels.cache.set(channel.id, channel);
  client.channels.cache.set(channel.id, channel);

  // Creates a fake Discord User.
  const user = new Discord.User(
    client,
    {
      username: 'Stefouch',
      discriminator: '0000',
      id: Discord.SnowflakeUtil.generate(),
    },
  );
  client.users.cache.set(user.id, user);

  // Creates a fake Discord GuildMember.
  const member = Object.assign(
    {
      displayColor: 11493413,
      // TODO: permissions: new Discord.Permissions(Discord.Permissions.ALL),
    },
    new Discord.GuildMember(
      client,
      {
        nick: 'Stef',
        user: user,
        roles: [guild.roles.cache.first().id],
      },
      guild,
    ),
  );
  guild.members.cache.set(member.id, member);
  guild.members.cache.set(client.user.id, new Discord.GuildMember(
    client,
    {
      nick: 'Seb',
      user: client.user,
      roles: [guild.roles.cache.first().id],
    },
    guild,
  ));

  // Fixes methods.
  client.generateInvite = () => '<invite>';

  // Creates a fake Discord Message.
  // const message = fakeSimpleMessage(client, channel, 'Fake Message');
  // channel.messages.cache.set(message.id, message);
  // return message;
  // Creates a fake Discord CommandInteraction.
  // const interaction = createFakeInteraction(client);
  // return interaction;
}

/**
 * Creates a simple fake Discord Message.
 * @param {Discord.Client} client
 * @param {Discord.TextChannel} channel
 * @param {string} [msg]
 * @returns {Discord.Message|Object}
 */
function fakeSimpleMessage(client, channel, msg = 'Hello') {
  return {
    client,
    id: Discord.SnowflakeUtil.generate(),
    author: client.user,
    content: msg,
    channel: channel,
    member: {
      displayColor: 0,
    },
    send: async () => true,
    edit: async () => true,
    reply: async () => true,
    react: async () => true,
    delete: async () => true,
    // createReactionCollector: () => {
    //   return { on: () => true };
    // },
  };
}

/** @param {Discord.Client} client */
function createFakeInteraction(client, commandName, options) {
  const i = new Discord.ChatInputCommandInteraction(client, {
    type: 2,
    id: Discord.SnowflakeUtil.generate(),
    token: null,
    application_id: Discord.SnowflakeUtil.generate(),
    channel_id: client.channels.cache.at(0).id,
    guild_id: client.guilds.cache.at(0).id,
    member: client.guilds.cache.at(0).members.cache.at(0),
    version: 10,
    app_permissions: Discord.PermissionFlagsBits.Administrator,
    locale: 'en-US',
    guild_locale: 'en_US',
    data: {
      id: Discord.SnowflakeUtil.generate(),
      name: commandName,
      type: Discord.ApplicationCommandType.ChatInput,
      guild_id: client.guilds.cache.at(0).id,
      options,
      resolved: null,
    },
  });
  i.reply = async () => true;
  i.editReply = async () => true;
  i.deferReply = async () => true;
  i.fetchReply = async () => true;
  i.deleteReply = async () => true;
  i.followUp = async () => true;
  return i;
}
