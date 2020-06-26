const { YZCombat, YZCombatant, YZCombatantGroup } = require('../yearzero/YZCombat');

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
		const combat = new YZCombat(
			message.channel.id,
			null,
			client.config.botAdminID,
			message,
			null,
		);
		const bob = new YZCombatant(message, {
			name: 'Bob',
			hp: 5,
			armor: 6,
		});
		const al = new YZCombatant(message, {
			name: 'Albert',
			hp: 3,
			armor: 3,
		});
		const dede = new YZCombatant(message, {
			name: 'Didier',
			hp: 2,
			speed: 2,
		});
		combat.addCombatant(bob);
		combat.addCombatant(al);
		combat.addCombatant(dede);
		/*for (let i = 0; i < 3; i++) {
			combat.addCombatant(new YZCombatant(message, { speed: 2 }));
		}//*/
		//message.channel.send(combat.getSummary());
		
		// message.channel.send(combat.getSummary());
		// combat.advanceTurn();
		// combat.advanceTurn();
		// combat.advanceTurn();
		// combat.advanceTurn();
		// combat.advanceTurn();
		message.channel.send(combat.getSummary());
		console.log(combat);
	},
};

function test() {

	const rollargv = require('yargs-parser')(args, {
		alias: {
			push: ['p', 'pushes'],
			name: ['n'],
			fullauto: ['f', 'fa', 'full-auto', 'fullAuto'],
		},
		default: {
			fullauto: false,
		},
		boolean: ['fullauto', 'initiative'],
		number: ['push'],
		array: ['name'],
		configuration: client.config.yargs,
	});
}