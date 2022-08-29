const SebediusEvent = require('../../structures/event');

module.exports = new SebediusEvent({
  name: 'ready',
  once: true,
  async execute(client) {
    console.log('✔ Sebedius is ready!');
    console.log(`  ├ Logged in as: ${client.user.tag} (${client.user.id})`);
    console.log(`  └ # Guilds: ${client.guilds.cache.size}`);

    // TODO Register global commands
    const devGuild = await client.guilds.cache.get('585361465641271296');
    devGuild.commands.set(client.commands.map(cmd => cmd.data));
  },
});
