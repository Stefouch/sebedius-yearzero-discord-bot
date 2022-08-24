const SebediusEvent = require('../../discord/event');

module.exports = new SebediusEvent({
  name: 'interactionCreate',
  async execute(client, /** @type {import('discord.js').BaseInteraction} */ interaction) {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return interaction.reply('❌ Command does not exist!');
      command.run(interaction);
    }
  },
});
