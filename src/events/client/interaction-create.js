const SebediusEvent = require('../../discord/event');

module.exports = new SebediusEvent({
  name: 'interactionCreate',
  async execute(client, /** @type {import('discord.js').BaseInteraction} */ interaction) {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return interaction.reply('❌ Command does not exist!');

      try {
        await command.run(interaction);
      }
      catch (err) {
        const msg = `❌ An error occured with this command: [${err.code}] ${err.message}`;
        console.error(msg, err);
        interaction.reply(msg);
      }
    }
  },
});
