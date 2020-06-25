const Discord = require('discord.js');
const Combat = require('../yearzero/YZCombat');
const Util = require('../utils/Util');

/* const a = new Combat.YZCombatant(null, { name: 'a', controller: 'Stefouch', armor: 6 });
const b = new Combat.YZCombatant(null, { name: 'b', controller: 'Stefouch', notes: 'Albert le mousquetaire' });
const c = new Combat.YZCombatant(null, { name: 'c', controller: 'Stefouch', armor: 3, notes: 'Plays MTG' });

const g = new Combat.YZCombatantGroup(null, 'Group g', [a, b, c], [4, 7]);
console.log(g); */



module.exports = {
	name: 'eval',
	group: 'Administration',
	description: 'Debug function for the bot owner.',
	adminOnly: true,
	guildOnly: false,
	args: false,
	usage: '<expression>',
	execute(args, message, client) {
		// Exits early if not the bot's owner.
		if (message.author.id !== client.config.botAdminID) return;

		const code = args.join(' ');
		code.replace(client.token, '[TOKEN]');
		try {
			let evaled = eval(code);

			if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

			if (evaled.length >= 1024) {
				const tooLong = new Discord.MessageEmbed()
					.setTitle('Whoops! Too long!')
					.setColor('#36393e')
					.addField(`${evaled.length} characters!`, 'That\'s past the charcacter limit! You can find the output in the console.');
				message.channel.send({ embed: tooLong });
				console.log(evaled);
				return;
			}
			const successfulEval = new Discord.MessageEmbed()
				.setTitle('Evaluated successfully')
				.addField('Input:', `\`\`\`JavaScript\n${code}\`\`\``, true)
				.addField('Output:', `\`\`\`JavaScript\n${evaled}\`\`\``, true)
				.setColor(message.author.displayColor)
				.setFooter('Sebedius Eval')
				.setTimestamp();

			message.channel.send({ embed: successfulEval });
		}
		catch(err) {
			console.error(err);
			const failedEval = new Discord.MessageEmbed()
				.setTitle('Error during eval!')
				.setDescription('An error occured! Please review the code and the error!')
				.addField('Input:', `\`\`\`JavaScript\n${code}\`\`\``)
				.addField('Error:', `\`\`\`JavaScript\n${err}\`\`\``)
				.setColor(0xff0000)
				.setFooter('Evaluation Error')
				.setTimestamp();

			message.channel.send({ embed: failedEval });
		}
	},
};