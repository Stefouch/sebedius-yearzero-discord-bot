const SebediusEvent = require('../../structures/event');

module.exports = class ReadyEvent extends SebediusEvent {
  name = 'ready';
  once = true;
  async execute() {
    console.log('✔ Sebedius is ready!');
    console.log(`  ├ Logged in as: ${this.bot.user.tag} (${this.bot.user.id})`);
    console.log(`  └ # Guilds: ${this.bot.guilds.cache.size}`);

    // TODO Register global commands
    const devGuild = await this.bot.guilds.cache.get('585361465641271296');
    devGuild.commands.set(this.bot.commands.map(cmd => cmd.data));
  }
};
