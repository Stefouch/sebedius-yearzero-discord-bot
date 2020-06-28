const Sebedius = require('../Sebedius');
const { MessageEmbed } = require('discord.js');
const Util = require('../utils/Util');
const { YZCombat, YZCombatant, YZCombatantGroup } = require('../yearzero/YZCombat');

const SUBCOMMANDS_LIST = [
	'add', 'attack', 'begin', 'effect', 'end',
	'hp', 'join', 'list', 'madd', 'meta',
	'move', 'next', 'note', 'opt', 'prev',
	're', 'remove', 'reroll', 'skipround', 'status',
	'help',
];

module.exports = {
	name: 'init',
	group: 'Core',
	description: 'Initiative tracker. See the list of available subcommands below:',
	moreDescriptions: [
		[
			'HELP',
			'Gives help for a specified subcommand.',
		],
		[
			'BEGIN',
			`Begins combat in the channel the command is invoked.
			\`\`\`!init begin [-name <name>] [-turnnotif]\`\`\`
			__Arguments__
			\`-turnnotif\` – Notifies the controller of the next combatant in initiative.
			\`-name\` – Sets a name for the combat instance.`,
		],
		[
			'ADD',
			`Adds a generic combatant to the initiative order.
			Generic combatants have 3 life, no armor, and speed 1.
			If you are adding monsters to combat, you can use \`!init madd\` instead.

			__Arguments__
			\`-h\` – Hides life, AR and anything else.
			\`-p\` – Places combatant at the given initiative, instead of drawing.
			\`-controller\` – Pings a different person on turn.
			\`-group\` – Adds the combatant to a group.
			\`-hp\` – Sets starting HP. Default: 3.
			\`-ar\` – Sets the combatant's armor. Default: 0.
			\`-speed\` – Sets the combatant's speed (number of initiative cards drawn). Default: 1`,
		],
	],
	aliases: ['i', 'initiative'],
	guildOnly: true,
	args: true,
	usage: '<subcommand>',
	async execute(args, message, client) {
		// Gets the subcommand.
		const subcmd = args.shift().toLowerCase();
		// Exits early if no subcommand.
		if (!SUBCOMMANDS_LIST.includes(subcmd)) {
			const prefix = await client.getServerPrefix(message);
			return message.reply(`:warning: Incorrect usage. Use \`${prefix}help init\` for help.`);
		}
		// Chooses the function for the subcommand.
		switch (subcmd) {
		case 'help': help(args, message, client); break;
		case 'begin': begin(args, message, client); break;
		case 'add': add(args, message, client); break;
		}
	},
};

async function help(args, message, client) {
	let subcmd;
	if (args.length) subcmd = args.shift().toLowerCase();
	if (!subcmd || !SUBCOMMANDS_LIST.includes(subcmd)) {
		return client.commands.get('help').execute(['init'], message, client);
	}
	const subcmdDesc = module.exports.moreDescriptions.find(d => d[0].toLowerCase().includes(subcmd));
	const title = subcmdDesc[0].toLowerCase();
	const description = subcmdDesc[1];
	const embed = new MessageEmbed({
		title: `${await client.getServerPrefix(message)}init ${title}`,
		description,
	});
	message.channel.send(embed);
}

async function begin(args, message, client) {
	await YZCombat.ensureUniqueChan(message);
	const argv = require('yargs-parser')(args, {
		boolean: ['turnnotif'],
		array: ['name'],
		default: {
			turnnotif: false,
		},
		configuration: client.config.yargs,
	});
	const options = {};
	if (argv.name) options.name = argv.name;
	if (argv.turnnotif) options.turnnotif = argv.turnnotif;

	// Builds the summary message and the combat instance.
	const tempSummaryMsg = await message.channel.send('```Awaiting combatants...```');
	const combat = new YZCombat(
		message.channel.id,
		tempSummaryMsg.id,
		message.author.id,
		options,
		message,
	);
	await combat.final();

	// Pins the summary message.
	try { await tempSummaryMsg.pin(); }
	catch (error) { console.error(error); }

	// Sends starting message.
	const desc = `\`${await client.getServerPrefix(message)}init add <name> [options]\``;
	const embed = new MessageEmbed()
		.setTitle('Everyone draw for initiative')
		.setDescription(desc);
	message.channel.send(embed);
}

async function add(args, message, client) {
	const argv = require('yargs-parser')(args, {
		alias: {
			ar: ['armor'],
			h: ['hidden', 'hide', 'private'],
			p: ['place', 'init', 'i'],
			group: ['g'],
			speed: ['s'],
		},
		array: ['p'],
		boolean: ['h'],
		number: ['ar', 'hp', 'p', 'speed'],
		string: ['group'],
		configuration: client.config.yargs,
	});
	const name = argv._.join(' ');
	const hidden = argv.h || false;
	const places = argv.p;
	const group = argv.group;
	const hp = argv.hp || 3;
	const armor = argv.ar || 0;
	const speed = argv.speed || 1;
	let controller = message.author.id;

	if (argv.controller) {
		const member = Sebedius.fetchMember(argv.controller, message, client);
		if (member) controller = member.id;
	}
	if (hp < 1) {
		return message.reply(':warning: You must pass in a positive nonzero HP with the `-hp` tag.');
	}
	if (armor < 0) {
		return message.reply(':warning: You must pass in a positive AR with the `-ar` tag.');
	}

	// Gets the Combat instance for this channel.
	const combat = client.combats.get(message.channel.id);

	// Exits if the combatant already exists.
	if (combat.getCombatant(name)) {
		return message.reply(':warning: Combatant already exists.');
	}

	// Creates the combatant.
	const me = new YZCombatant({ name, controller, hidden, hp, armor, speed });

	if (places) {
		places.forEach(p => {
			if (!Util.isNumber(p)) return message.reply(':warning: You must pass in numbers with the `-p` tag.');
			else if (p < 1) return message.reply(':warning: You must pass in a positive nonzero initiative value with the `-p` tag.');
		});
		me.inits = places;
	}

	if (!group) {
		combat.addCombatant(me);
		await message.channel.send(`${name} was added to combat with initiative ${me.inits}.`);
	}
	else {
		let grp = combat.getGroup(group);
		if (grp) grp.addCombatant(me);
		else grp = new YZCombatantGroup(group, me.inits, me);
		combat.addCombatant(grp);

		await message.channel.send(
			`${name} was added to combat with initiative ${me.inits} as part of group ${grp.name}.`,
		);
	}
	combat.final();
}





function test(args, message, client) {
	const argv = require('yargs-parser')(args, {
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