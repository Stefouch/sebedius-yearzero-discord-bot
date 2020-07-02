const Sebedius = require('../Sebedius');
const { MessageEmbed } = require('discord.js');
const Util = require('../utils/Util');
const { YZCombat, YZCombatant, YZCombatantGroup } = require('../yearzero/YZCombat');
const { ChannelInCombat, CombatNotFound } = require('../yearzero/YZCombat');

const YargsParser = require('yargs-parser');
const YARGS_PARSE_COMBATANT = {
	alias: {
		ar: ['armor'],
		h: ['hidden', 'hide', 'private'],
		p: ['place', 'init', 'i'],
		note: ['notes'],
	},
	array: ['p', 'note', 'name', 'group', 'controller'],
	boolean: ['h'],
	string: ['p', 'hp', 'max', 'ar', 'speed', 'haste'],
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
			\`-haste <value>\` – How many cards to draw for 1 to keep.
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
			\`-haste <value>\` – How many cards to draw for 1 to keep.
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
			'EDIT',
			`Edits the options of a combatant.
			__Arguments__
			\`-p <value1 value2 ...>\` – Places combatant at the given initiative, instead of drawing.
			\`-controller <mention>\` – Pings a different person on turn.
			\`-name <name>\` – Changes the combatants' name.
			\`-group <name>\` – Adds the combatant to a group.
			\`-hp <value>\` – Sets starting HP. Default: 3.
			\`-max <value>\` – Modifies the combatants' Max HP. Adds if starts with +/- or sets otherwise.
			\`-ar <value>\` – Sets the combatant's armor. Default: 0.
			\`-speed <value>\` – Sets the combatant's speed (number of initiative cards drawn). Default: 1.
			\`-haste <value>\` – How many cards to draw for 1 to keep.
			\`-h\` – Hides life, AR and anything else.`,
		],
		[
			'STATUS',
			`Gets the status of a combatant or group.
			__Valid Arguments__
			\`-private\` – PMs the controller of the combatant a more detailed status.`,
		],
		[
			'ATTACK',
			`Inflicts damage to another combatant.
			__Options__
			\`-ap [value]\` – Armor piercing. Default is halved, rounded up.
			\`-ad\` – Armor doubled.
			\`-ab <value>\` – Armor bonus (applied after other modifications).
			`,
		],
		[
			'REMOVE',
			'Removes a combatant or group from the combat.',
		],
		[
			'END',
			`Ends combat in the channel.
			__Valid Arguments__
			\`-force\` – Forces an init to end, in case it's erroring.`,
		],
	],
	aliases: ['i', 'initiative'],
	guildOnly: true,
	args: true,
	usage: '<subcommand>',
	async execute(args, ctx) {
		// Gets the subcommand.
		const subcmd = args.shift().toLowerCase();
		try {
			// Chooses the function for the subcommand.
			switch (subcmd) {
			case 'help': case 'h': await help(args, ctx); break;
			case 'begin': await begin(args, ctx); break;
			case 'add': await add(args, ctx); break;
			case 'join': await join(args, ctx); break;
			case 'next': case 'n': await next(args, ctx); break;
			case 'prev': case 'p': case 'previous': await prev(args, ctx); break;
			case 'move': case 'goto': await move(args, ctx); break;
			case 'skipround': await skipround(args, ctx); break;
			case 'meta': await meta(args, ctx); break;
			case 'list': case 'summary': await list(args, ctx); break;
			case 'note': await note(args, ctx); break;
			case 'edit': await edit(args, ctx); break;
			case 'status': await status(args, ctx); break;
			case 'attack': case 'atk': case 'atq': await attack(args, ctx); break;
			case 'remove': await remove(args, ctx); break;
			case 'end': await end(args, ctx); break;
			default:
				return ctx.reply(`:information_source: Incorrect usage. Use \`${ctx.prefix}help init\` for help.`);
			}
		}
		catch (error) {
			console.error(error);
			if (error instanceof ChannelInCombat) {
				return ctx.reply(':warning: Cannot start a new combat instance because there is already one in progress.');
			}
			else if (error instanceof CombatNotFound) {
				return ctx.reply(`:information_source: No combat instance. Type \`${ctx.prefix}init begin\`.`);
			}
			else {
				return ctx.reply(`:x: *${error.name}: ${error.message}*.`);
			}
		}
		try {
			await ctx.delete();
		}
		catch (err) { console.error(err); }
	},
};

/**
 * HELP.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function help(args, ctx) {
	let subcmd;
	if (args.length) subcmd = args.shift().toLowerCase();
	if (!subcmd) {
		return ctx.bot.commands.get('help').execute(['init'], ctx);
	}
	const subcmdDesc = module.exports.moreDescriptions.find(d => d[0].toLowerCase().includes(subcmd));
	if (!subcmdDesc) {
		return ctx.bot.commands.get('help').execute(['init'], ctx);
	}
	const title = subcmdDesc[0].toLowerCase();
	const description = subcmdDesc[1];
	const embed = new MessageEmbed({
		title: `${ctx.prefix}init ${title}`,
		description,
	});
	ctx.channel.send(embed);
}

/**
 * BEGIN.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function begin(args, ctx) {
	await YZCombat.ensureUniqueChan(ctx);
	const argv = YargsParser(args, {
		array: ['name'],
		boolean: ['turnnotif'],
		string: ['game'],
		default: {
			turnnotif: false,
		},
		configuration: ctx.bot.config.yargs,
	});
	const options = {};
	if (argv.name) options.name = argv.name.join(' ');
	if (argv.turnnotif) options.turnnotif = argv.turnnotif;

	// Builds the summary message and the combat instance.
	const tempSummaryMsg = await ctx.channel.send('```Awaiting combatants...```');
	const combat = new YZCombat(
		ctx.channel.id,
		tempSummaryMsg.id,
		ctx.author.id,
		options,
		ctx,
	);
	if (argv.game) combat.game = argv.game;
	await combat.final();

	// Pins the summary message.
	try {
		await ctx.delete();
		await tempSummaryMsg.pin();
	}
	catch (err) { console.error(err); }

	// Sends starting message.
	// const desc = `\`\`\`\n${prefix}init add <name> [options]\n${prefix}init join [options]\n\`\`\``;
	/* const embed = new MessageEmbed()
		.setTitle('Everyone Draw For Initiative:')
		.setDescription(desc);//*/
	const desc = ':doughnut: **Combat Scene Started:** Everyone draw the initiative!'
		+ `\`\`\`${ctx.prefix}init add <name> [options]\n${ctx.prefix}init join [options]\n\`\`\``;
	// ctx.channel.send(embed);
	ctx.channel.send(desc);
}

/**
 * ADD.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function add(args, ctx) {
	const argv = YargsParser(args, YARGS_PARSE_COMBATANT);
	const name = argv._.join(' ');
	const hidden = argv.h || false;
	const places = argv.p;
	const group = argv.group ? argv.group.join(' ') : null;
	const hp = +argv.hp || 3;
	const armor = +argv.ar || 0;
	const speed = +argv.speed || 1;
	const haste = +argv.loot || null;
	const notes = argv.notes ? argv.notes.join(' ') : null;
	let controller = ctx.author.id;

	if (!name) return ctx.reply(':warning: This combatant needs a name.');

	if (argv.controller) {
		const member = await Sebedius.fetchMember(argv.controller.join(' '), ctx);
		if (member) controller = member.id;
	}
	if (hp < 1) {
		return ctx.reply(':warning: You must pass in a positive nonzero HP with the `-hp` tag.');
	}
	if (armor < 0) {
		return ctx.reply(':warning: You must pass in a positive AR with the `-ar` tag.');
	}

	// Gets the Combat instance for this channel.
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	// Exits if the combatant already exists.
	if (combat.getCombatant(name)) {
		return ctx.reply(':warning: Combatant already exists.');
	}

	// Creates the combatant.
	const me = new YZCombatant({ name, controller, hidden, hp, armor, speed, haste, notes });

	if (places) {
		places.forEach(p => {
			if (!Util.isNumber(p)) return ctx.reply(':warning: You must pass in numbers with the `-p` tag.');
			else if (p < 1) return ctx.reply(':warning: You must pass in a positive nonzero initiative value with the `-p` tag.');
		});
		me.inits = places.map(init => +init);
	}

	if (!group) {
		combat.addCombatant(me);
		await ctx.channel.send(`:white_check_mark: **${name}** was added to combat with initiative \`${me.inits.join('`, `')}\`.`);
	}
	else {
		const grp = combat.getGroup(group, true, me.inits, me.speed, me.haste);
		grp.addCombatant(me);
		await ctx.channel.send(
			`:white_check_mark: **${name}** was added to combat with initiative \`${me.inits.join('`, `')}\` as part of group __${grp.name}__.`,
		);
	}
	await combat.final();
}

/**
 * JOIN.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function join(args, ctx) {
	const argv = YargsParser(args, YARGS_PARSE_COMBATANT);
	const name = ctx.member.displayName;
	const hidden = argv.h || false;
	const places = argv.p;
	const group = argv.group ? argv.group.join(' ') : null;
	const hp = +argv.hp || 3;
	const armor = +argv.ar || 0;
	const speed = +argv.speed || 1;
	const haste = +argv.haste || null;
	const notes = argv.notes ? argv.notes.join(' ') : null;
	const controller = ctx.author.id;

	/* const embed = new MessageEmbed()
		.setTitle(`${emoji ? `${emoji} ` : ''}${name}`)
		.setDescription(`Health: **${hp}**\nArmor: **${armor}**\nSpeed: **${speed}**`)
		.setAuthor(name)
		.setColor(ctx.member.displayColor);//*/

	if (hp < 1) {
		return ctx.reply(':warning: You must pass in a positive nonzero HP with the `-hp` tag.');
	}
	if (armor < 0) {
		return ctx.reply(':warning: You must pass in a positive AR with the `-ar` tag.');
	}

	// Gets the Combat instance for this channel.
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	// Exits if the combatant already exists.
	if (combat.getCombatant(name)) {
		return ctx.reply(':warning: Combatant already exists.');
	}

	// Creates the combatant.
	const me = new YZCombatant({ name, controller, hidden, hp, armor, speed, haste, notes });

	if (places) {
		places.forEach(p => {
			if (!Util.isNumber(p)) return ctx.reply(':warning: You must pass in numbers with the `-p` tag.');
			else if (p < 1) return ctx.reply(':warning: You must pass in a positive nonzero initiative value with the `-p` tag.');
		});
		me.inits = places.map(init => +init);
	}

	if (!group) {
		combat.addCombatant(me);
		await ctx.channel.send(`:white_check_mark: **${name}** was added to combat with initiative \`${me.inits.join('`, `')}\`.`);
		// embed.setFooter('Added to combat!');
	}
	else {
		const grp = combat.getGroup(group, true, me.inits, me.speed, me.haste);
		grp.addCombatant(me);
		await ctx.channel.send(
			`:white_check_mark: **${name}** was added to combat with initiative \`${me.inits.join('`, `')}\` as part of group __${grp.name}__.`,
		);
	}
	await combat.final();
	// await ctx.channel.send(embed);
}

/**
 * NEXT.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function next(args, ctx) {
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	if (combat.getCombatants().length === 0) {
		return ctx.reply(':x: There are no combatants.');
	}

	const isAllowedToPass =
		!combat.index ||
		combat.currentCombatant.controller === ctx.author.id ||
		combat.dm === ctx.author.id;

	if (!isAllowedToPass) {
		return ctx.reply(':information_source: It is not your turn.');
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
		out.push(`:soap: **${co.name}** automatically removed from combat.\n`);
	}

	await ctx.channel.send(out.join('\n'));
	await combat.final();
}

/**
 * PREV.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function prev(args, ctx) {
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	if (combat.getCombatants().length === 0) {
		return ctx.reply(':x: There are no combatants.');
	}
	if (!combat.index) {
		return ctx.reply(`:warning: Please start combat with \`${ctx.prefix}init next\` first.`);
	}
	combat.rewindTurn();
	await ctx.channel.send(combat.getTurnString());
	await combat.final();
}

/**
 * MOVE.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function move(args, ctx) {
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	if (combat.getCombatants().length === 0) {
		return ctx.reply(':x: There are no combatants.');
	}

	let combatant;
	let target = args.shift();
	if (!target) {
		combatant = combat.getCombatants().find(c => c.controller === ctx.author.id);
		if (!combatant) {
			return ctx.reply(':information_source: You don\'t control any combatants.');
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
	await ctx.channel.send(combat.getTurnString());
	await combat.final();
}

/**
 * SKIPROUND.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function skipround(args, ctx) {
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	if (combat.getCombatants().length === 0) {
		return ctx.reply(':x: There are no combatants.');
	}
	if (!combat.index) {
		return ctx.reply(`:warning: Please start combat with \`${ctx.prefix}init next\` first.`);
	}

	const numRounds = +args.shift();

	const toRemove = [];
	const out = combat.skipRounds(numRounds);

	out.push(combat.getTurnString());

	for (const co of toRemove) {
		combat.removeCombatant(co);
		out.push(`:soap: **${co.name}** automatically removed from combat.\n`);
	}

	await ctx.channel.send(out.join('\n'));
	await combat.final();
}

/**
 * META.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function meta(args, ctx) {
	const argv = YargsParser(args, {
		boolean: ['turnnotif'],
		array: ['name'],
		default: {
			turnnotif: null,
		},
		configuration: ctx.bot.config.yargs,
	});
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);
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
	await combat.final();
	await ctx.channel.send(outStr);
}

/**
 * LIST.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function list(args, ctx) {
	const argv = YargsParser(args, {
		boolean: ['private'],
		default: {
			private: false,
		},
		configuration: ctx.bot.config.yargs,
	});
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);
	const destination = argv.private ? ctx.channel : ctx.author;
	let outStr;

	if (argv.private && ctx.author.id === combat.dm) {
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
 * @param {Discord.Message} ctx
 * @async
 */
async function note(args, ctx) {
	const name = args.shift();
	const notes = args.join(' ');
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	const combatant = await combat.selectCombatant(name);
	if (!combatant) {
		return ctx.reply(':x: Combatant not found.');
	}
	combatant.notes = notes;
	if (!notes) await ctx.channel.send(`:notepad_spiral: Removed note for **${combatant.name}**.`);
	else await ctx.channel.send(`:notepad_spiral: Added note for **${combatant.name}**.`);

	await combat.final();
}

/**
 * EDIT.
 * @param {string[]} args
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 * @async
 */
async function edit(args, ctx) {
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	if (combat.getCombatants().length === 0) {
		return ctx.reply(':x: There are no combatants.');
	}

	const argv = YargsParser(args, YARGS_PARSE_COMBATANT);
	const name = argv._.join(' ');
	let modifCount = 0;

	const combatant = await combat.selectCombatant(name, null, true);
	if (!combatant) {
		return ctx.reply(':x: Combatant not found.');
	}

	//const options = {};
	// const isGroup = combatant instanceof YZCombatantGroup;
	//const runOnce = new Set();

	let out = [];

	if (argv.h != null && argv.h != undefined) {
		combatant.hidden = !combatant.hidden;
		out.push(`:spy: ${combatant.name} is **${combatant.isPrivate() ? 'hidden' : 'unhidden'}**.`);
		modifCount++;
	}
	if (argv.controller) {
		const member = await Sebedius.fetchMember(argv.controller.join(' '), ctx);
		if (!member) {
			out.push(':x: New controller not found.');
		}
		else {
			combatant.controller = member.id;
			out.push(`:bust_in_silhouette: ${combatant.name}'s controller set to ${combatant.controllerMention()}.`);
		}
		modifCount++;
	}
	if (argv.ar) {
		const oldArmor = combatant.armor;
		const newArmor = Util.modifOrSet(argv.ar, oldArmor);
		combatant.armor = newArmor;
		out.push(`:shield: ${combatant.name}'s armor set to **${combatant.armor}** (was ${oldArmor}).`);
		modifCount++;
	}
	if (argv.speed) {
		const oldSpeed = combatant.speed;
		const newSpeed = Util.modifOrSet(argv.speed, oldSpeed);
		combatant.speed = newSpeed;
		out.push(`:snail: ${combatant.name}'s speed set to **${combatant.speed}** (was ${oldSpeed}).`);
		modifCount++;
	}
	if (argv.haste) {
		const oldHaste = combatant.haste;
		const newHaste = Util.modifOrSet(argv.haste, oldHaste);
		combatant.haste = newHaste;
		out.push(`:athletic_shoe: ${combatant.name}'s haste set to **${combatant.haste}** (was ${oldHaste}).`);
		modifCount++;
	}
	if (argv.p) {
		if (combatant === combat.currentCombatant) {
			out.push(':x: You cannot change a combatant\'s initiative on their own turn.');
		}
		else if (argv.p.length) {
			const oldInits = combatant.inits;
			const newInits = [];
			argv.p.forEach((init, i) => {
				if (i < oldInits.length) {
					newInits.push(Util.modifOrSet(init, oldInits[i]));
				}
				else {
					newInits.push(init);
				}
			});
			combatant.inits = newInits;
			combat.sortCombatants();
			out.push(`:zap: ${combatant.name}'s initiative set to \`${combatant.inits.join('`, `')}\` (was ${oldInits}).`);
		}
		else {
			out.push(`:warning: Invalid argument: ${argv.p}.`);
		}
		modifCount++;
	}
	if (argv.name) {
		const oldName = combatant.name;
		const newName = argv.name.join(' ');
		if (combat.getCombatant(newName, true)) {
			out.push(`:x: There is already another combatant with the name ${newName}`);
		}
		else if (newName) {
			combatant.name = newName;
			out.push(`:ticket: ${oldName}'s name set to **${newName}**.`);
		}
		else {
			out.push(':warning: You must pass in a name with the `-name` tag.');
		}
		modifCount++;
	}
	if (argv.max) {
		const oldMax = combatant.maxhp;
		const newMax = Util.modifOrSet(argv.max, oldMax);
		if (newMax < 1) {
			out.push(':warning: Max HP must at least be 1.');
		}
		else {
			combatant.maxhp = newMax;
			out.push(`:drop_of_blood: ${combatant.name}'s Max HP set to **${combatant.maxhp}** (was ${oldMax}).`);
		}
		modifCount++;
	}
	if (argv.hp) {
		const oldLife = combatant.hp;
		const newLife = Util.modifOrSet(argv.hp, oldLife);
		combatant.hp = newLife;
		out.push(`:drop_of_blood: ${combatant.name}'s HP set to **${combatant.hp}** (was ${oldLife}).`);
		modifCount++;
	}
	if (argv.group) {
		const groupName = argv.group.join(' ');
		const current = combat.currentCombatant;
		const wasCurrent =
			current === combatant ||
			(
				current instanceof YZCombatantGroup &&
				current.getCombatants().includes(combatant) &&
				current.getCombatants.length === 1
			);

		combat.removeCombatant(combatant, true);
		if (!groupName || groupName.toLowerCase() === 'none') {
			combatant.group = null;
			combat.addCombatant(combatant);
			if (wasCurrent) {
				combat.gotoTurn(combatant, true);
			}
			out.push(`:outbox_tray: ${combatant.name} removed from all groups.`);
		}
		else {
			const grp = combat.getGroup(groupName, true,
				combatant.inits,
				combatant.speed,
				combatant.haste,
			);
			grp.addCombatant(combatant);
			if (wasCurrent) {
				combat.gotoTurn(combatant, true);
			}
			out.push(`:inbox_tray: ${combatant.name} added to group __${grp.name}__.`);
		}
		modifCount++;
	}
	if (modifCount > 0) {
		//combat.removeCombatant(combatant, true);
		//combat.addCombatant(combatant);
		await combat.final();
		await ctx.channel.send(out.join('\n'));
	}
	else {
		await ctx.reply(':information_source: Nothing was modified.');
	}
}

/**
 * STATUS.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function status(args, ctx) {
	const argv = YargsParser(args, {
		boolean: ['private'],
		default: {
			private: false,
		},
		configuration: ctx.bot.config.yargs,
	});
	const name = argv._.join(' ');

	const combat = await YZCombat.fromId(ctx.channel.id, ctx);
	const combatant = await combat.selectCombatant(name, null, true);
	if (!combatant) {
		return ctx.reply(':x: Combatant or group not found.');
	}

	let privacy = argv.private;
	let statusStr;
	if (!(combatant instanceof YZCombatantGroup)) {
		privacy = privacy && ctx.author.id === combatant.controller;
		statusStr = combatant.getStatus(privacy);
	}
	else {
		statusStr = combatant.getCombatants()
			.filter(c => c.controller === ctx.author.id)
			.map(c => c.getStatus(privacy))
			.join('\n');
	}
	if (privacy) {
		const controller = await Sebedius.fetchMember(combatant.controller, ctx);
		if (controller) {
			controller.send(`\`\`\`markdown\n${statusStr}\`\`\``);
		}
	}
	else {
		await ctx.channel.send(`\`\`\`markdown\n${statusStr}\`\`\``);
	}
}

async function _sendHpResult(ctx, combatant, delta = null) {
	const deltaend = delta ? ` (${delta})` : '';

	if (combatant.isPrivate()) {
		await ctx.channel.send(`${combatant.name}: ${combatant.hpString()}`);

		const controller = await Sebedius.fetchMember(combatant.controller, ctx);
		if (controller) {
			await controller.send(`${combatant.name}'s HP: ${combatant.hpString(true)}${deltaend}`);
		}
	}
	else {
		await ctx.channel.send(`${combatant.name}: ${combatant.hpString(true)}${deltaend}`);
	}
}

`Inflicts damage to another combatant.
			__Options__
			\`-ap [value]\` – Armor piercing. Default is halved, rounded up.
			\`-ad\` – Armor doubled.
			\`-ab <value>\` – Armor bonus (applied after other modifications).`;

/**
 * ATTACK.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function attack(args, ctx) {
	const argv = YargsParser(args, {
		alias: {
			t: ['target'],
		},
		array: ['t'],
		boolean: ['ad', 'h', 'x'],
		number: ['ab'],
		configuration: ctx.bot.config.yargs,
	});
	const damage = +argv._[0] || 0;
	const combatantName = argv.t ? argv.t.join(' ') : null;
	const degradeArmor = argv.x ? true : false;
	const isArmorPierced = argv.ap === true ? true : false;
	const isArmorDoubled = argv.ad ? true : false;
	const armorFactor = (isArmorDoubled ? 2 : 1) * (isArmorPierced ? 0.5 : 1);
	const armorMod = (argv.ab ? +argv.ab : 0) + (Util.isNumber(argv.ap) ? +argv.ap : 0);
	const hidden = argv.h ? true : false;

	const combat = await YZCombat.fromId(ctx.channel.id, ctx);
	let combatant;

	if (!combatantName) {
		combatant = combat.currentCombatant;
		if (!combatant) {
			return ctx.channel.send(`:warning: You must start combat with \`${ctx.prefix}init next\` first.`);
		}
	}
	else {
		try {
			combatant = await combat.selectCombatant(combatantName, ':speech_balloon: Select the target.');
		}
		catch (error) {
			console.error(error);
			return ctx.channel.send(':x: Target not found.');
		}
	}
	// Warns.
	await ctx.channel.send(`:crossed_swords: Attacking **${combatant.name}** with **${damage}** damage.`);

	// Rolls the armor.
	const armorRoll = combat.damageCombatant(combatant, damage, false, armorMod, armorFactor);
	armorRoll.setGame(await ctx.bot.getGame(ctx));

	const finalDamage = Math.max(damage - armorRoll.sixes, 0);
	const armorDamage = (degradeArmor && finalDamage > 0) ? armorRoll.banes : 0;

	// Sends the report
	const out = [];
	if (hidden || combatant.isPrivate()) {
		if (finalDamage > 0) {
			out.push(`:boom: **${combatant.name}** was hit.`);
		}
		else {
			out.push(`:mechanical_arm: No damage were inflicted. **${combatant.name}**'s armor absorbed the totality.`);
		}
	}
	else {
		const dice = Sebedius.emojifyRoll(armorRoll, ctx.bot.config.commands.roll.options['myz']);
		const embed = new MessageEmbed()
			.setTitle('Attack')
			.setDescription(
				`Damage inflicted: **${finalDamage}**
				Damage absorbed: **${damage - finalDamage}**
				${armorDamage > 0 ? `Armor damaged: **${armorDamage}**` : ''}`,
			);
		await ctx.channel.send(dice, embed);
	}

	if (combatant.hp <= 0) {
		out.push(`:skull: **${combatant.name}** is \`BROKEN\` by damage.`);
		// await ctx.bot.commands.get('crit').execute([], ctx);
	}

	await combat.final();
	if (out.length) await ctx.channel.send(out.join('\n'));
}

/**
 * REMOVE.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function remove(args, ctx) {
	const name = args.join(' ');
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);
	const combatant = await combat.selectCombatant(name, null, true);
	if (!combatant) {
		return await ctx.reply(':x: Combatant not found.');
	}
	if (combatant === combat.currentCombatant) {
		return await ctx.reply(':information_source: You cannot remove a combatant on their own turn.');
	}
	if (combatant.group) {
		const group = combat.getGroup(combatant.group);
		if (group.getCombatants().length <= 1 && group === combat.currentCombatant) {
			return await ctx.reply(
				':information_source: You cannot remove a combatant if they are the only remaining combatant in this turn.',
			);
		}
	}
	combat.removeCombatant(combatant);
	await ctx.channel.send(`:soap: **${combatant.name}** removed from combat.`);
	await combat.final();
}

/**
 * END.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @async
 */
async function end(args, ctx) {
	const toEnd = await Sebedius.confirm(
		ctx,
		':speech_balloon: **Are you sure you want to end combat?** *(reply with yes/no)*',
		true,
	);
	if (toEnd == null || toEnd == undefined) {
		return ctx.channel.send(':x: Timed out waiting for a response or invalid response.')
			.then(m => m.delete(10000))
			.catch(console.error);
	}
	else if (!toEnd) {
		return ctx.channel.send(':x: OK, cancelling.')
			.then(m => m.delete(10000))
			.catch(console.error);
	}

	const msg = await ctx.channel.send(':stop_button: OK, ending...');
	if (!args.includes('-force')) {
		const combat = await YZCombat.fromId(ctx.channel.id, ctx);
		try {
			await ctx.author.send(
				`End of combat report: ${combat.round} rounds`
				+ `${combat.getSummary(true)}`);

			const summary = await combat.getSummaryMsg();
			await summary.edit(combat.getSummary() + ' ```-----COMBAT ENDED-----```');
			await summary.unpin();
		}
		catch (err) { console.error(err); }

		await combat.end();
	}
	else {
		await ctx.bot.kdb.combats.delete(ctx.channel.id);
	}
	await msg.edit(':ballot_box_with_check: Combat ended.');
}