const Sebedius = require('../Sebedius');
const { MessageEmbed } = require('discord.js');
const Util = require('../utils/Util');
const { YZCombat, YZCombatant, YZCombatantGroup } = require('../yearzero/YZCombat');
const { CombatNotFound } = require('../yearzero/YZCombat');

const YargsParser = require('yargs-parser');
const YARGS_PARSE_COMBATANT = {
	alias: {
		ar: ['armor'],
		h: ['hidden', 'hide', 'private'],
		p: ['place', 'init', 'i'],
		group: ['g'],
		speed: ['s'],
		lf: ['speedloot', 'loot'],
	},
	array: ['p', 'phrase'],
	boolean: ['h'],
	number: ['ar', 'hp', 'p', 'speed', 'lf'],
	string: ['group', 'thumb'],
	default: {
		h: null,
	},
	configuration: {
		'short-option-groups': false,
		'duplicate-arguments-array': false,
		'flatten-duplicate-arrays': true,
	},
};

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
			\`-lf <value>\` – Lightning fast: How many cards to draw for 1 to keep.
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
			\`-lf <value>\` – Lightning fast: How many cards to draw for 1 to keep.
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
		[
			'MOVE',
			`Moves to a certain initiative.
			\`target\` can be either a number, to go to that initiative, or a name.
			If not supplied, goes to the first combatant that the user controls.`,
		],
		[
			'SKIPROUND',
			'Skips one or more rounds of initiative.',
		],
		[
			'META',
			`Changes the settings of the active combat.
			__Valid Settings__
			\`-name <name>\` – Sets a name for the combat instance.
			\`-turnnotif\` – Notifies the controller of the next combatant in initiative.`,
		],
		[
			'LIST',
			`Lists the combatants.
			__Valid Arguments__
			\`-private\` – Sends the list in a private message.`,
		],
		[
			'NOTE',
			'Attaches a note to a combatant.',
		],
		[
			'OPTS',
			`Edits the options of a combatant.
			__Arguments__
			\`-p <value1 value2 ...>\` – Places combatant at the given initiative, instead of drawing.
			\`-controller <mention>\` – Pings a different person on turn.
			\`-group <name>\` – Adds the combatant to a group.
			\`-hp <value>\` – Sets starting HP. Default: 3.
			\`-ar <value>\` – Sets the combatant's armor. Default: 0.
			\`-speed <value>\` – Sets the combatant's speed (number of initiative cards drawn). Default: 1.
			\`-lf <value>\` – Lightning fast: How many cards to draw for 1 to keep.
			\`-h\` – Hides life, AR and anything else.`,
		],
	],
	aliases: ['i', 'initiative'],
	guildOnly: true,
	args: true,
	usage: '<subcommand>',
	async execute(args, message, client) {
		// Gets the subcommand.
		const subcmd = args.shift().toLowerCase();
		try {
			// Chooses the function for the subcommand.
			switch (subcmd) {
			case 'help': case 'h': await help(args, message, client); break;
			case 'begin': await begin(args, message, client); break;
			case 'add': await add(args, message, client); break;
			case 'join': await join(args, message, client); break;
			case 'next': case 'n': await next(args, message, client); break;
			case 'prev': case 'p': case 'previous': await prev(args, message, client); break;
			case 'move': case 'goto': await move(args, message, client); break;
			case 'skipround': await skipround(args, message, client); break;
			case 'meta': await meta(args, message, client); break;
			case 'list': case 'summary': await list(args, message, client); break;
			case 'note': await note(args, message, client); break;
			case 'opt': case 'opts': case 'option': case 'options': await opt(args, message, client); break;
			default:
				return message.reply(`:information_source: Incorrect usage. Use \`${message.prefix}help init\` for help.`);
			}
		}
		catch (error) {
			console.error(error);
			if (error instanceof CombatNotFound) {
				return message.reply(`:information_source: No combat instance. Type \`${message.prefix}init begin\`.`);
			}
		}
		try {
			await message.delete();
		}
		catch (err) { console.error(err); }
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
	if (!subcmd) {
		return client.commands.get('help').execute(['init'], message, client);
	}
	const subcmdDesc = module.exports.moreDescriptions.find(d => d[0].toLowerCase().includes(subcmd));
	if (!subcmdDesc) {
		return client.commands.get('help').execute(['init'], message, client);
	}
	const title = subcmdDesc[0].toLowerCase();
	const description = subcmdDesc[1];
	const embed = new MessageEmbed({
		title: `${message.prefix}init ${title}`,
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
	const argv = YargsParser(args, {
		boolean: ['turnnotif'],
		array: ['name'],
		default: {
			turnnotif: false,
		},
		configuration: client.config.yargs,
	});
	const options = {};
	if (argv.name) options.name = argv.name.join(' ');
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
	try {
		//await message.delete();
		//await tempSummaryMsg.pin();
	}
	catch (err) { console.error(err); }

	// Sends starting message.
	// const desc = `\`\`\`\n${prefix}init add <name> [options]\n${prefix}init join [options]\n\`\`\``;
	/* const embed = new MessageEmbed()
		.setTitle('Everyone Draw For Initiative:')
		.setDescription(desc);//*/
	const desc = ':doughnut: **Combat Scene Started:** Everyone draw the initiative!'
		+ `\`\`\`${message.prefix}init add <name> [options]\n${message.prefix}init join [options]\n\`\`\``;
	// message.channel.send(embed);
	message.channel.send(desc);
}

/**
 * ADD.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function add(args, message, client) {
	const argv = YargsParser(args, YARGS_PARSE_COMBATANT);
	const name = argv._.join(' ');
	const hidden = argv.h || false;
	const places = argv.p;
	const group = argv.group;
	const hp = argv.hp || 3;
	const armor = argv.ar || 0;
	const speed = argv.speed || 1;
	const speedloot = argv.loot || null;
	let controller = message.author.id;

	if (!name) return message.reply(':warning: This combatant needs a name.');

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
	const me = new YZCombatant({ name, controller, hidden, hp, armor, speed, speedloot });

	if (places) {
		places.forEach(p => {
			if (!Util.isNumber(p)) return message.reply(':warning: You must pass in numbers with the `-p` tag.');
			else if (p < 1) return message.reply(':warning: You must pass in a positive nonzero initiative value with the `-p` tag.');
		});
		me.inits = places;
	}

	if (!group) {
		combat.addCombatant(me);
		await message.channel.send(`:white_check_mark: **${name}** was added to combat with initiative \`${me.inits.join('`, `')}\`.`);
	}
	else {
		let grp = combat.getGroup(group);
		if (grp) grp.addCombatant(me);
		else grp = new YZCombatantGroup(group, null, me.controller, me.inits, [me]);
		combat.addCombatant(grp);

		await message.channel.send(
			`:white_check_mark: **${name}** was added to combat with initiative \`${me.inits.join('`, `')}\` as part of group __${grp.name}__.`,
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
	const argv = YargsParser(args, YARGS_PARSE_COMBATANT);
	const name = message.member.displayName;
	const hidden = argv.h || false;
	const places = argv.p;
	const group = argv.group;
	const hp = argv.hp || 3;
	const armor = argv.ar || 0;
	const speed = argv.speed || 1;
	const speedloot = argv.lf || null;
	const controller = message.author.id;
	//const emoji = argv.thumb;
	const phrase = argv.phrase;

	/* const embed = new MessageEmbed()
		.setTitle(`${emoji ? `${emoji} ` : ''}${name}`)
		.setDescription(`Health: **${hp}**\nArmor: **${armor}**\nSpeed: **${speed}**`)
		.setAuthor(name)
		.setColor(message.member.displayColor);//*/

	if (phrase) {
		// embed.addField('Notes', phrase);
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
	const me = new YZCombatant({ name, controller, hidden, hp, armor, speed, speedloot });

	if (places) {
		places.forEach(p => {
			if (!Util.isNumber(p)) return message.reply(':warning: You must pass in numbers with the `-p` tag.');
			else if (p < 1) return message.reply(':warning: You must pass in a positive nonzero initiative value with the `-p` tag.');
		});
		me.inits = places;
	}

	if (!group) {
		combat.addCombatant(me);
		await message.channel.send(`:white_check_mark: **${name}** was added to combat with initiative \`${me.inits.join('`, `')}\`.`);
		// embed.setFooter('Added to combat!');
	}
	else {
		let grp = combat.getGroup(group);
		if (grp) grp.addCombatant(me);
		else grp = new YZCombatantGroup(group, null, me.controller, me.inits, [me]);
		combat.addCombatant(grp);
		// embed.setFooter(`Joind group ${grp.name}`);

		await message.channel.send(
			`:white_check_mark: **${name}** was added to combat with initiative \`${me.inits.join('`, `')}\` as part of group __${grp.name}__.`,
		);
	}
	await combat.final(client);
	// await message.channel.send(embed);
}

/**
 * NEXT.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function next(args, message, client) {
	const combat = await YZCombat.fromId(message.channel.id, message, client);

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
		for (const co of thisTurn) {
			if (co.hp <= 0) {
				toRemove.push(co);
			}
		}
	}
	const [advancedRound, out] = [...combat.advanceTurn()];
	out.push(combat.getTurnString());

	for (const co of toRemove) {
		combat.removeCombatant(co);
		out.push(`${co.name} automatically removed from combat.\n`);
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
	const combat = await YZCombat.fromId(message.channel.id, message, client);

	if (combat.getCombatants().length === 0) {
		return message.reply(':x: There are no combatants.');
	}
	combat.rewindTurn();
	await message.channel.send(combat.getTurnString());
	await combat.final(client);
}

/**
 * MOVE.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function move(args, message, client) {
	const combat = await YZCombat.fromId(message.channel.id, message, client);

	if (combat.getCombatants().length === 0) {
		return message.reply(':x: There are no combatants.');
	}

	let combatant;
	let target = args.shift();
	if (!target) {
		combatant = combat.getCombatants().find(c => c.controller === message.author.id);
		if (!combatant) {
			return message.reply(':information_source: You don\'t control any combatants.');
		}
		combat.gotoTurn(combatant, true);
	}
	else if (Util.isNumber(target)) {
		try {
			target = Number(target);
			combat.gotoTurn(target);
		}
		catch (error) {
			combatant = await combat.selectCombatant(target);
			combat.gotoTurn(combatant, true);
		}
	}
	else {
		combatant = await combat.selectCombatant(target);
		combat.gotoTurn(combatant, true);
	}
	await message.channel.send(combat.getTurnString());
	await combat.final();
}

/**
 * SKIPROUND.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function skipround(args, message, client) {
	const combat = await YZCombat.fromId(message.channel.id, message, client);

	if (combat.getCombatants().length === 0) {
		return message.reply(':x: There are no combatants.');
	}
	if (!combat.index) {
		return message.reply(`Please start combat with \`${message.prefix}init next\` first.`);
	}

	const numRounds = +args.shift();

	const toRemove = [];
	const out = combat.skipRounds(numRounds);

	out.push(combat.getTurnString());

	for (const co of toRemove) {
		combat.removeCombatant(co);
		out.push(`${co.name} automatically removed from combat.\n`);
	}

	await message.channel.send(out.join('\n'));
	await combat.final();
}

/**
 * META.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function meta(args, message, client) {
	const argv = YargsParser(args, {
		boolean: ['turnnotif'],
		array: ['name'],
		default: {
			turnnotif: null,
		},
		configuration: client.config.yargs,
	});
	const combat = await YZCombat.fromId(message.channel.id, message, client);
	const options = combat.options;
	let outStr = '';

	if (argv.name) {
		options.name = argv.name.join(' ');
		outStr += `:label: Name set to **${options.name}**.\n`;
	}
	if (argv.turnnotif != null) {
		options.turnnotif = !options.turnnotif;
		outStr += `:bulb: Turn notification turned **${options.turnnotif ? 'on' : 'off'}**.\n`;
	}

	combat.options = options;
	await combat.commit();
	await message.channel.send(outStr);
}

/**
 * LIST.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function list(args, message, client) {
	const argv = YargsParser(args, {
		boolean: ['private'],
		default: {
			private: false,
		},
		configuration: client.config.yargs,
	});
	const combat = await YZCombat.fromId(message.channel.id, message, client);
	const destination = argv.private ? message.channel : message.author;
	let outStr;

	if (argv.private && message.author.id === combat.dm) {
		outStr = combat.getSummary(true);
	}
	else {
		outStr = combat.getSummary();
	}
	await destination.send(outStr);
}

/**
 * NOTE.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function note(args, message, client) {
	const name = args.shift();
	const notes = args.join(' ');
	const combat = await YZCombat.fromId(message.channel.id, message, client);

	const combatant = await combat.selectCombatant(name);
	if (!combatant) {
		return message.reply(':x: Combatant not found.');
	}
	combatant.notes = notes;
	if (!notes) await message.channel.send(`:notepad_spiral: Removed note for **${combatant.name}**.`);
	else await message.channel.send(`:notepad_spiral: Added note for **${combatant.name}**.`);

	await combat.final();
}

/**
 * OPT.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function opt(args, message, client) {
	const combat = await YZCombat.fromId(message.channel.id, message, client);

	if (combat.getCombatants().length === 0) {
		return message.reply(':x: There are no combatants.');
	}

	const name = args.shift();
	const argv = YargsParser(args, YARGS_PARSE_COMBATANT);
	const options = {};
	const isGroup = comb instanceof YZCombatantGroup;
	const runOnce = new Set();

	const comb = await combat.selectCombatant(name, null, true);
	if (!comb) {
		return message.reply(':x: Combatant not found.');
	}
}