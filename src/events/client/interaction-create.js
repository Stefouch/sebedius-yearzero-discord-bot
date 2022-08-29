const i18next = require('i18next');
const { codeBlock } = require('discord.js');
const SebediusEvent = require('../../structures/event');

module.exports = new SebediusEvent({
  name: 'interactionCreate',
  async execute(client, interaction) {
    const t = global.t = i18next.getFixedT(interaction.guildLocale);

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return interaction.reply('❌ Command does not exist!');

      try {
        // @ts-ignore
        await command.run(interaction, t);
      }
      catch (err) {
        console.error(err);
        const content = `❌ An error occured with this command${err.code ? `: ${err.code}` : ''}`
          + `\n${codeBlock('js', err.message)}`;

        if (interaction.replied) {
          await interaction.followUp({ content, ephemeral: true })
            .catch(e => logErrorOnError(e, 'following up'));
        }
        else if (interaction.deferred) {
          await interaction.followUp({ content, ephemeral: true })
            .catch(e => logErrorOnError(e, 'following up'));
        }
        else {
          await interaction.reply({ content, ephemeral: true })
            .catch(e => logErrorOnError(e, 'replying'));
        }
      }
    }
  },
});

function logErrorOnError(e, verb) {
  return console.error(`💥 An error occurred ${verb} on an error`, e);
}
