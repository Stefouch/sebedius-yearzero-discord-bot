const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'embed',
	category: 'pbptool',
	description: 'Creates an embed message. Both the title and the description of the embed are mandatory and must be separated by an `|` horizontal bar character.',
	cooldown: 5,
	guildOnly: false,
	args: true,
	usage: '<title> "|" <description>',
	async run(args, ctx) {
		const arg = args.join(' ').split('|');

		// Checks for 2 arguments: title & description.
		if (arg.length < 2) return ctx.reply(`⚠️ Invalid arguments. Try \`${ctx.prefix}help embed\``);

		const title = arg.shift().trim();
		const description = arg[0].trim();

		// Checks that title & description are not empty.
		if (!title.length) return ctx.reply('⚠️ Embed\'s `title` is empty.');
		if (!description.length) return ctx.reply('⚠️ Embed\'s `description` is empty.');

		const embed = new MessageEmbed({ title, description });

		await ctx.channel.send(embed);
		await ctx.delete().catch(console.error);
	},
};