module.exports = {
	name: 'planet',
	group: 'Alien RPG',
	description: 'Generates an uncolonized planet for the Alien RPG.',
	aliases: ['world'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		// Exits early and executes "!colony empty".
		return ctx.bot.commands.get('colony').execute(['empty'], ctx);
	},
};