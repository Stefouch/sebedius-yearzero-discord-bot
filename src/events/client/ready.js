const SebediusEvent = require('../../discord/event');

module.exports = new SebediusEvent({
  name: 'ready',
  once: true,
  async execute(client) {
    console.log('Sebedius is ready!');

    const devGuild = await client.guilds.cache.get('585361465641271296');
    devGuild.commands.set(client.commands.map(cmd => cmd));
  },
});
