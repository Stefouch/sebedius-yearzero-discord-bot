module.exports = {
	name: 'planet',
	type: 'ALIEN rpg',
	description: 'Generates an uncolonized planet for the ALIEN rpg.',
	aliases: ['world'],
	guildOnly: false,
	args: false,
	usage: '',
	async execute(args, message, client) {
		// Exits early and executes "!colony empty".
		return client.commands.get('colony').execute(['empty'], message, client);
	},
};