module.exports = {
	name: 'planet',
	aliases: ['world'],
	category: 'alien',
	description: 'cplanet-description',
	moreDescriptions: 'cplanet-moredescriptions',
	guildOnly: false,
	args: false,
	usage: '[name] [-type <planet-type>] [-lang <language_code>]',
	async run(args, ctx) {
		// Exits early and executes "!colony -uncolonized".
		args.push('-uncolonized');
		return ctx.bot.commands.get('colony').run(args, ctx);
	},
};