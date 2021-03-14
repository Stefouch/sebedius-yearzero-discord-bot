module.exports = {
	name: 'planet',
	aliases: ['world'],
	category: 'alien',
	description: 'Generates an uncolonized planet for the Alien RPG.',
	guildOnly: false,
	args: false,
	usage: '[-type planet-type] [-lang language_code]',
	async run(args, ctx) {
		// Exits early and executes "!colony -uncolonized".
		args.push('-uncolonized');
		return ctx.bot.commands.get('colony').run(args, ctx);
	},
};