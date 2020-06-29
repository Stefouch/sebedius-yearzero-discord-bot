const Sebedius = require('../Sebedius');
const { MessageEmbed } = require('discord.js');
const Util = require('../utils/Util');
const { YZCombat, YZCombatant, YZCombatantGroup } = require('../yearzero/YZCombat');

const YargsParser = require('yargs-parser');
const YARGS_PARSE_OPTIONS = {
	alias: {
		ar: ['armor'],
		h: ['hidden', 'hide', 'private'],
		p: ['place', 'init', 'i'],
		group: ['g'],
		speed: ['s'],
	},
	array: ['p', 'phrase'],
	boolean: ['h'],
	number: ['ar', 'hp', 'p', 'speed'],
	string: ['group', 'thumb'],
	configuration: {
		'short-option-groups': false,
		'duplicate-arguments-array': false,
		'flatten-duplicate-arrays': true,
	},
};

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
			\`-name <name>\` – Sets a name for the combat instance.
			\`-turnnotif\` – Notifies the controller of the next combatant in initiative.`,
		],
		[
			'ADD',
			`Adds a generic combatant to the initiative order.
			Generic combatants have 3 life, no armor, and speed 1.
			If you are adding monsters to combat, you can use \`!init madd\` instead.

			__Arguments__
			\`-p <value1 value2 ...>\` – Places combatant at the given initiative, instead of drawing.
			\`-controller <mention>\` – Pings a different person on turn.
			\`-group <name>\` – Adds the combatant to a group.
			\`-hp <value>\` – Sets starting HP. Default: 3.
			\`-ar <value>\` – Sets the combatant's armor. Default: 0.
			\`-speed <value>\` – Sets the combatant's speed (number of initiative cards drawn). Default: 1.
			\`-h\` – Hides life, AR and anything else.`,
		],
		[
			'JOIN',
			`Adds the current active character to combat.
			
			__Arguments__
			\`-p <value1 value2 ...>\` – Places combatant at the given initiative, instead of drawing.
			\`-group <name>\` – Adds the combatant to a group.
			\`-phrase <phrase>\` - Adds flavor text.
			\`-thumb <emoji>\` - Adds flavor emoji.
			\`-hp <value>\` – Sets starting HP. Default: 3.
			\`-ar <value>\` – Sets the combatant's armor. Default: 0.
			\`-speed\` – Sets the character's speed (number of initiative cards drawn). Default: 1.
			\`-h\` – Hides life, AR and anything else.
			`,
		],
		[
			'NEXT',
			`Moves to the next turn in initiative order.
			It must be your turn or you must be the DM (the person who started combat) to use this command.`,
		],
		[
			'PREV',
			'Moves to the previous turn in initiative order.',
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
		case 'join': join(args, message, client); break;
		case 'next': next(args, message, client); break;
		case 'prev': prev(args, message, client); break;
		}
	},
};

/**
 * HELP.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
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

/**
 * BEGIN.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function begin(args, message, client) {
	//await YZCombat.ensureUniqueChan(message);
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
	await combat.final(client);

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

/**
 * ADD.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function add(args, message, client) {
	const argv = YargsParser(args, YARGS_PARSE_OPTIONS);
	/* const argv = require('yargs-parser')(args, {
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
	});//*/
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
	const combat = await YZCombat.fromId(message.channel.id, message, client);

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
		else grp = new YZCombatantGroup(group, null, me.controller, me.inits, [me]);
		combat.addCombatant(grp);

		await message.channel.send(
			`${name} was added to combat with initiative ${me.inits} as part of group ${grp.name}.`,
		);
	}
	await combat.final(client);
}

/**
 * JOIN.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function join(args, message, client) {
	const argv = YargsParser(args, YARGS_PARSE_OPTIONS);
	const name = message.member.displayName;
	const hidden = argv.h || false;
	const places = argv.p;
	const group = argv.group;
	const hp = argv.hp || 3;
	const armor = argv.ar || 0;
	const speed = argv.speed || 1;
	const controller = message.author.id;
	const emoji = argv.thumb;
	const phrase = argv.phrase;

	const embed = new MessageEmbed()
		.setTitle(`${emoji ? `${emoji} ` : ''}${name}`)
		.setDescription(`Health: **${hp}**\nArmor: **${armor}**\nSpeed: ${speed}`)
		.setAuthor(name)
		.setColor(message.member.displayColor);

	if (phrase) {
		embed.addField('Notes', phrase);
	}
	if (hp < 1) {
		return message.reply(':warning: You must pass in a positive nonzero HP with the `-hp` tag.');
	}
	if (armor < 0) {
		return message.reply(':warning: You must pass in a positive AR with the `-ar` tag.');
	}

	// Gets the Combat instance for this channel.
	const combat = await YZCombat.fromId(message.channel.id, message, client);

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
		embed.setFooter('Added to combat!');
	}
	else {
		let grp = combat.getGroup(group);
		if (grp) grp.addCombatant(me);
		else grp = new YZCombatantGroup(group, null, me.controller, me.inits, [me]);
		combat.addCombatant(grp);
		embed.setFooter(`Joind group ${grp.name}`);

		await message.channel.send(
			`${name} was added to combat with initiative ${me.inits} as part of group ${grp.name}.`,
		);
	}
	await combat.final(client);
	await message.channel.send(embed);
}

/**
 * NEXT.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function next(args, message, client) {
	const combat = YZCombat.fromId(message.channel.id, message, client);

	if (combat.getCombatants().length === 0) {
		return message.reply(':x: There are no combatants.');
	}

	const isAllowedToPass =
		!combat.index ||
		combat.currentCombatant.controller === message.author.id ||
		combat.dm === message.author.id;

	if (!isAllowedToPass) {
		return message.reply(':information_source: It is not your turn.');
	}

	let thisTurn;
	const toRemove = [];
	if (combat.currentCombatant) {
		if (combat.currentCombatant instanceof YZCombatantGroup) {
			thisTurn = combat.currentCombatant.getCombatants();
		}
		else {
			thisTurn = [combat.currentCombatant];
		}
		for (const c of thisTurn) {
			if (c.hp <= 0) {
				toRemove.push(c);
			}
		}
	}
	const [advancedRound, out] = [...combat.advancedTurn()];
	out.push(combat.getTurnString());

	for (const c of toRemove) {
		combat.removeCombatant(c);
		out.push(`${c.name} automatically removed from combat.\n`);
	}

	await message.channel.send(out.join('\n'));
	await combat.final(client);
}

/**
 * PREV.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function prev(args, message, client) {
	const combat = YZCombat.fromId(message.channel.id, message, client);

	if (combat.getCombatants().length === 0) {
		return message.reply(':x: There are no combatants.');
	}
	combat.rewindTurn();
	await message.channel.send(combat.getTurnString());
	await combat.final(client);
}