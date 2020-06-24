const yargsParser = require('yargs-parser');

module.exports = {
	name: 'init',
	group: 'Core',
	description: 'Initiative tracker.',
	aliases: ['i', 'initiative'],
	guildOnly: true,
	args: true,
	usage: '<subcommand>',
	execute(args, message, client) {
		const subcommandsList = [
			'add',
			'attack',
			'begin',
			'effect',
			'end',
			'hp',
			'join',
			'list',
			'madd',
			'meta',
			'move',
			'next',
			'note',
			'opt',
			'prev',
			're',
			'remove',
			'reroll',
			'skipround',
			'status',
		];
	},
};