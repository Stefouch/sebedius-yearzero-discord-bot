const Discord = require('discord.js');
const Util = require('../utils/Util');
const { YZObject } = require('../yearzero/YZObject');
const YZRoll = require('../yearzero/YZRoll');

module.exports = {
	name: 'eval',
	group: 'Administration',
	description: 'Debug function for the bot owner.',
	adminOnly: true,
	guildOnly: false,
	args: false,
	usage: '<expression>',
	async execute(args, ctx) {
		// Exits early if not the bot's owner.
		if (ctx.author.id !== ctx.bot.config.ownerID) return;

		const code = args.join(' ');
		code.replace(ctx.bot.token, '[TOKEN]');
		try {
			let evaled = eval(code);

			if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

			if (evaled.length >= 1024) {
				const tooLong = new Discord.MessageEmbed()
					.setTitle('Whoops! Too long!')
					.setColor('#36393e')
					.addField(`${evaled.length} characters!`, 'That\'s past the charcacter limit! You can find the output in the console.');
				ctx.channel.send({ embed: tooLong });
				console.log(evaled);
				return;
			}
			const successfulEval = new Discord.MessageEmbed()
				.setTitle('Evaluated successfully')
				.addField('Input:', `\`\`\`JavaScript\n${code}\`\`\``, true)
				.addField('Output:', `\`\`\`JavaScript\n${evaled}\`\`\``, true)
				.setColor(ctx.author.displayColor)
				.setFooter('Sebedius Eval')
				.setTimestamp();

			ctx.channel.send({ embed: successfulEval });
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

			ctx.channel.send({ embed: failedEval });
		}
	},
};