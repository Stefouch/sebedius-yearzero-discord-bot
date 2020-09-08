module.exports = {
	name: 'planet',
	aliases: ['world'],
	category: 'alien',
	description: 'Generates an uncolonized planet for the Alien RPG.',
	guildOnly: false,
	args: false,
	usage: '',
	async run(args, ctx) {
		// Exits early and executes "!colony empty".
		return ctx.bot.commands.get('colony').run(['empty'], ctx);
	},
};