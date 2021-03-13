const { MessageEmbed } = require('discord.js');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'embed',
	category: 'pbptool',
	description: 'cembed-description',
	cooldown: 5,
	guildOnly: false,
	args: true,
	usage: '<title> "|" <description>',
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
			},
			default: {
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);

		const arg = argv._.join(' ').split('|');

		// Checks for 2 arguments: title & description.
		if (arg.length < 2) return ctx.reply(`⚠️ ${__('cembed-invalid-arguments', lang)} \`${ctx.prefix}\`help embed`);

		const title = arg.shift().trim();
		const description = arg[0].trim();

		// Checks that title & description are not empty.
		if (!title.length) return ctx.reply(`⚠️ ${__('cembed-empty-title', lang)}.`);
		if (!description.length) return ctx.reply(`⚠️ ${__('cembed-empty-description', lang)}.`);

		const embed = new MessageEmbed({ title, description });

		await ctx.send(embed);
		await ctx.delete().catch(console.error);
	},
};