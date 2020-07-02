module.exports = {
	name: 'planet',
	group: 'ALIEN rpg',
	description: 'Generates an uncolonized planet for the ALIEN rpg.',
	aliases: ['world'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, ctx) {
		// Exits early and executes "!colony empty".
		return ctx.bot.commands.get('colony').execute(['empty'], ctx);
	},
};