const Sebedius = require('../Sebedius');
const { MessageEmbed } = require('discord.js');
const { YZCombat, YZCombatant, YZMonsterCombatant, YZCombatantGroup } = require('../yearzero/YZCombat');
const Util = require('../utils/Util');
const { SOURCE_MAP } = require('../utils/constants');
const { NoSelectionElementsError } = require('../utils/errors');
const { ChannelInCombat, CombatNotFound } = require('../yearzero/YZCombat');
const { __ } = require('../lang/locales');

const YargsParser = require('yargs-parser');
const YARGS_PARSE_COMBATANT = {
	array: ['place', 'note', 'name', 'group', 'controller'],
	boolean: ['private'],
	number: ['monsters'],
	string: ['place', 'hp', 'max', 'armor', 'speed', 'haste'],
	alias: {
		armor: ['ar'],
		private: ['hidden', 'hide', 'h'],
		monsters: ['number', 'n'],
		place: ['p', 'init', 'i'],
		group: ['g'],
		note: ['notes'],
	},
	default: {
		private: null,
	},
	configuration: {
		'short-option-groups': false,
		'duplicate-arguments-array': false,
		'flatten-duplicate-arrays': true,
	},
};

module.exports = {
	name: 'init',
	aliases: ['i', 'initiative'],
	category: 'common',
	description: 'cinit-description',
	moreDescriptions: 'cinit-moredescriptions',
	subDescriptions: 'cinit-subdescriptions',
	guildOnly: true,
	args: true,
	usage: '<subcommand>',
	async run(args, ctx) {
		// Parses arguments for the language.
		const argv = require('yargs-parser')(args, {
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
			},
			default: {
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);

		// Gets the subcommand.
		const subcmd = argv._.shift().toLowerCase();
		try {
			// Chooses the function for the subcommand.
			switch (subcmd) {
				case 'help': case 'h': await help(argv._, ctx, lang); break;
				case 'begin': await begin(argv._, ctx, lang); break;
				case 'add': await add(argv._, ctx, lang); break;
				case 'join': await join(argv._, ctx, lang); break;
				case 'madd': await madd(argv._, ctx, lang); break;
				case 'next': case 'n': await next(argv._, ctx, lang); break;
				case 'prev': case 'p': case 'previous': await prev(argv._, ctx, lang); break;
				case 'move': case 'goto': await move(argv._, ctx, lang); break;
				case 'skipround': case 'skip': await skipround(argv._, ctx, lang); break;
				case 'meta': await meta(argv._, ctx, lang); break;
				case 'list': case 'summary': await list(argv._, ctx, lang); break;
				case 'note': await note(argv._, ctx, lang); break;
				case 'edit': await edit(argv._, ctx, lang); break;
				case 'status': await status(argv._, ctx, lang); break;
				case 'hp': case 'health': case 'life': await setHp(argv._, ctx, lang); break;
				case 'attack': case 'atk': await attack(argv._, ctx, lang); break;
				case 'remove': await remove(argv._, ctx, lang); break;
				case 'end': await end(argv._, ctx, lang); break;
				default:
					return ctx.reply(`:information_source: ${__('cinit-incorrect-usage', lang).replace(/{prefix}/g, ctx.prefix)}`);
			}
		}
		catch (error) {
			if (error instanceof ChannelInCombat) {
				return ctx.reply(`⚠️ ${__('cinit-combat-already-in-progress', lang)}`);
			}
			else if (error instanceof CombatNotFound) {
				return ctx.reply(`:information_source: ${__('cinit-no-combat-instance', lang).replace(/{prefix}/g, ctx.prefix)}`);
			}
			else if (error instanceof NoSelectionElementsError) {
				return ctx.reply(`:information_source: ${__('cinit-no-combatant-with-name', lang)}`);
			}
			else {
				// Otherwise, throws the error at the upper scale.
				throw error;
			}
		}
		try {
			await ctx.delete();
		}
		catch (error) {
			console.warn('Failed to delete !init command invoking message.', error.name, error.code);
		}
	},
};

/**
 * HELP.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function help(args, ctx, lang) {
	let subcmd;
	if (args.length) subcmd = args.shift().toLowerCase();
	if (!subcmd) {
		return ctx.bot.commands.get('help').run(['init', '-lang', lang], ctx);
	}
	const subcmdDesc = __(module.exports.subDescriptions, lang).find(d => d[0].toLowerCase().includes(subcmd));
	if (!subcmdDesc) {
		return ctx.bot.commands.get('help').run(['init', '-lang', lang], ctx);
	}
	const title = subcmdDesc[0].toLowerCase();
	const description = subcmdDesc[1];
	const embed = new MessageEmbed({
		title: `${ctx.prefix}init ${title}`,
		description,
		color: ctx.member.displayColor,
	});
	await ctx.send(embed);
}

/**
 * BEGIN.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function begin(args, ctx, lang) {
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
	options.lang = lang || 'en';

	// Builds the summary message and the combat instance.
	const tempSummaryMsg = await ctx.send(`\`\`\`${__('cinit-awaiting-combatants', lang)}...\`\`\``);
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
		// await ctx.delete(); // Is deleted at another level.
		await tempSummaryMsg.pin();
	}
	catch (err) { console.error(err); }

	const desc = `:doughnut: ${__('cinit-combat-scene-started', lang)}\n`
		+ '```\n'
		+ `${ctx.prefix}init join [options...]\n`
		+ `${ctx.prefix}init add <name> [options...]\n`
		+ `${ctx.prefix}init madd <monster name> [options...]\n`
		+ '```';
	await ctx.send(desc);
}

/**
 * ADD.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function add(args, ctx, lang) {
	const argv = YargsParser(args, YARGS_PARSE_COMBATANT);
	const name = argv._.join(' ');
	const hidden = argv.private || false;
	const places = argv.place;
	const group = argv.group ? argv.group.join(' ') : null;
	const hp = +argv.hp || 3;
	const armor = +argv.armor || 0;
	const speed = +argv.speed || 1;
	const haste = +argv.haste || 1;
	const notes = argv.notes ? argv.notes.join(' ') : null;
	let controller = ctx.author.id;

	if (!name) return ctx.reply(`⚠️ ${__('cinit-combatant-needs-name', lang)}`);

	if (argv.controller) {
		const member = await Sebedius.fetchMember(argv.controller.join(' '), ctx);
		if (member) controller = member.id;
	}
	if (hp < 1) {
		return ctx.reply(`⚠️ ${__('cinit-hp-must-be-positive', lang)}`);
	}
	if (armor < 0) {
		return ctx.reply(`⚠️ ${__('cinit-armor-must-be-positive', lang)}`);
	}

	// Gets the Combat instance for this channel.
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	// Exits if the combatant already exists.
	if (combat.getCombatant(name)) {
		return ctx.reply(`⚠️ ${__('cinit-combatant-already-exists', lang)}`);
	}

	// Creates the combatant.
	const me = new YZCombatant({ name, controller, hidden, hp, armor, speed, haste, notes, lang });

	if (places) {
		places.forEach(p => {
			if (!Util.isNumber(p)) return ctx.reply(`⚠️ ${__('cinit-initiative-must-be-numbers', lang)}`);
			else if (p < 1) return ctx.reply(`⚠️ ${__('cinit-initiative-must-be-positive', lang)}`);
		});
		me.inits = places.map(init => +init);
	}

	if (!group) {
		combat.addCombatant(me);
		await ctx.send(`:white_check_mark: **${name}** ${__('cinit-added-to-initiative', lang)} \`${me.inits.join('`, `')}\`.`);
	}
	else {
		const grp = combat.getGroup(group, true, me.inits, me.speed, me.haste);
		grp.addCombatant(me);
		await ctx.send(
			`:white_check_mark: **${name}** ${__('cinit-added-to-initiative', lang)} \`${me.inits.join('`, `')}\` ${__('cinit-added-as-part-of-group', lang)} __${grp.name}__.`,
		);
	}
	await combat.final();
}

/**
 * JOIN.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function join(args, ctx, lang) {
	const argv = YargsParser(args, YARGS_PARSE_COMBATANT);
	const name = ctx.member.displayName;
	const hidden = argv.private || false;
	const places = argv.place;
	const group = argv.group ? argv.group.join(' ') : null;
	const hp = +argv.hp || 3;
	const armor = +argv.armor || 0;
	const speed = +argv.speed || 1;
	const haste = +argv.haste || 1;
	const notes = argv.notes ? argv.notes.join(' ') : null;
	const controller = ctx.author.id;

	/* const embed = new MessageEmbed()
		.setTitle(`${emoji ? `${emoji} ` : ''}${name}`)
		.setDescription(`Health: **${hp}**\nArmor: **${armor}**\nSpeed: **${speed}**`)
		.setAuthor(name)
		.setColor(ctx.member.displayColor);//*/

	if (hp < 1) {
		return ctx.reply(`⚠️ ${__('cinit-hp-must-be-positive', lang)}`);
	}
	if (armor < 0) {
		return ctx.reply(`⚠️ ${__('cinit-armor-must-be-positive', lang)}`);
	}

	// Gets the Combat instance for this channel.
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	// Exits if the combatant already exists.
	if (combat.getCombatant(name)) {
		return ctx.reply(`⚠️ ${__('cinit-combatant-already-exists', lang)}`);
	}

	// Creates the combatant.
	const me = new YZCombatant({ name, controller, hidden, hp, armor, speed, haste, notes, lang });

	if (places) {
		places.forEach(p => {
			if (!Util.isNumber(p)) return ctx.reply(`⚠️ ${__('cinit-initiative-must-be-numbers', lang)}`);
			else if (p < 1) return ctx.reply(`⚠️ ${__('cinit-initiative-must-be-positive', lang)}`);
		});
		me.inits = places.map(init => +init);
	}

	if (!group) {
		combat.addCombatant(me);
		await ctx.send(`:white_check_mark: **${name}** ${__('cinit-added-to-initiative', lang)} \`${me.inits.join('`, `')}\`.`);
		// embed.setFooter('Added to combat!');
	}
	else {
		const grp = combat.getGroup(group, true, me.inits, me.speed, me.haste);
		grp.addCombatant(me);
		await ctx.send(
			`:white_check_mark: **${name}** ${__('cinit-added-to-initiative', lang)} \`${me.inits.join('`, `')}\` ${__('cinit-added-as-part-of-group', lang)} __${grp.name}__.`,
		);
	}
	await combat.final();
	// await ctx.send(embed);
}

/**
 * MONSTER-ADD.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function madd(args, ctx, lang) {
	const monsterFaces = [':smiling_imp:', ':imp:', ':supervillain:', ':boar:',
		':squid:', ':dragon_face:', ':snake:'];
	const argv = YargsParser(args, YARGS_PARSE_COMBATANT);
	const name_template = argv._.join(' ') + ' $X';
	const hidden = argv.private || false;
	const places = argv.place;
	const group = argv.group ? argv.group.join(' ') : null;
	const hp = +argv.hp || 3;
	const armor = +argv.armor || 0;
	const speed = +argv.speed || 1;
	const haste = +argv.haste || 1;
	const notes = argv.notes ? argv.notes.join(' ') : null;
	const qty = argv.monsters ? Util.clamp(+argv.monsters, 1, 25) : 1;

	if (name_template.length <= 3) {
		return await ctx.send(`⚠️ ${__('cinit-indicate-monster-name', lang)}`);
	}

	let out = '';
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	let nameNum = 1;
	for (let i = 0; i < qty; i++) {
		let name = name_template.replace('$X', nameNum);
		const rawName = name_template;
		let toContinue = false;

		while (combat.getCombatant(name) && nameNum < 100) {
			if (rawName.includes('$X')) {
				nameNum++;
				name = rawName.replace('$X', nameNum);
			}
			else {
				out += `❌ ${__('cinit-combatant-already-exists', lang)}\n`;
				toContinue = true;
				break;
			}
		}
		if (toContinue) {
			continue;
		}
		try {
			const controller = ctx.author.id;
			const me = new YZMonsterCombatant({ name, controller, hidden, hp, armor, speed, haste, notes, lang });

			if (places) {
				places.forEach(p => {
					if (!Util.isNumber(p)) return ctx.reply(`⚠️ ${__('cinit-initiative-must-be-numbers', lang)}`);
					else if (p < 1) return ctx.reply(`⚠️ ${__('cinit-initiative-must-be-positive', lang)}`);
				});
				me.inits = places;
			}
			if (!group) {
				combat.addCombatant(me);
				out += `${Util.random(monsterFaces)} **${me.name}** ${__('cinit-added-to-initiative', lang)} \`${me.inits.join('`, `')}\`.\n`;
			}
			else {
				const grp = combat.getGroup(group, true, me.inits, me.speed, me.haste);
				grp.addCombatant(me);
				out += `${Util.random(monsterFaces)} **${me.name}** ${__('cinit-added-to-initiative', lang)} \`${me.inits.join('`, `')}\` ${__('cinit-added-as-part-of-group', lang)} __${grp.name}__.\n`;
			}
		}
		catch (error) {
			console.warn(error);
			out += `❌ ${__('cinit-error-adding-combatant', lang)}: ${error.name}`;
		}
	}
	await combat.final();
	await ctx.send(out);
}

/**
 * NEXT.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function next(args, ctx, lang) {
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	if (combat.getCombatants().length === 0) {
		return ctx.reply(`❌ ${__('cinit-no-combatants', lang)}`);
	}

	const isAllowedToPass =
		!combat.index ||
		combat.currentCombatant.controller === ctx.author.id ||
		combat.dm === ctx.author.id;

	if (!isAllowedToPass) {
		return ctx.reply(`:information_source: ${__('cinit-not-your-turn', lang)}`);
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
			if (co instanceof YZMonsterCombatant && co.hp <= 0) {
				toRemove.push(co);
			}
		}
	}
	const out = [];
	// Important: Remove before advancing turn (incompatilibilites with multiple inits values).
	for (const co of toRemove) {
		combat.removeCombatant(co);
		out.push(`:soap: **${co.name}** ${__('cinit-automatically-removed', lang)}`);
	}

	combat.advanceTurn();
	out.push(combat.getTurnString());

	await combat.final();
	await ctx.send(out.join('\n'));
}

/**
 * PREV.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function prev(args, ctx, lang) {
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	if (combat.getCombatants().length === 0) {
		return ctx.reply(`❌ ${__('cinit-no-combatants', lang)}`);
	}
	if (!combat.index) {
		return ctx.reply(`⚠️ ${__('cinit-start-combat-first', lang).replace(/{prefix}/g, ctx.prefix)}`);
	}
	if (combat.round <= 1 && combat.index <= combat.initiatives.min) {
		return ctx.reply(`:information_source: ${__('cinit-no-previous-turn', lang)}`);
	}
	combat.rewindTurn();
	await combat.final();
	await ctx.send(combat.getTurnString());
}

/**
 * MOVE.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function move(args, ctx, lang) {
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	if (combat.getCombatants().length === 0) {
		return ctx.reply(`❌ ${__('cinit-no-combatants', lang)}`);
	}

	let combatant;
	let target = args.shift();
	if (!target) {
		combatant = combat.getCombatants().find(c => c.controller === ctx.author.id);
		if (!combatant) {
			return ctx.reply(`:information_source: ${__('cinit-no-combatant-control', lang)}`);
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
	await combat.final();
	await ctx.send(combat.getTurnString());
}

/**
 * SKIPROUND.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function skipround(args, ctx, lang) {
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	if (combat.getCombatants().length === 0) {
		return ctx.reply(`❌ ${__('cinit-no-combatants', lang)}`);
	}
	if (!combat.index) {
		return ctx.reply(`⚠️ ${__('cinit-start-combat-first', lang).replace(/{prefix}/g, ctx.prefix)}`);
	}

	// Number of rounds to skip are provided, otherwise skip 1 round
	const numRounds = +args.shift() || 1;

	const toRemove = [];
	for (const co of combat.getCombatants()) {
		if (co instanceof YZMonsterCombatant && co.hp <= 0 && co !== combat.currentCombatant) {
			toRemove.push(co);
		}
	}
	const out = combat.skipRounds(numRounds);

	out.push(`:fast_forward: ${__(numRounds > 1 ? 'cinit-skipped-rounds' : 'cinit-skipped-round', lang).replace(/{number_of_rounds}/g, numRounds)}.`);

	for (const co of toRemove) {
		combat.removeCombatant(co);
		out.push(`:soap: **${co.name}** ${__('cinit-automatically-removed', lang)}`);
	}

	out.push(combat.getTurnString());

	await combat.final();
	await ctx.send(out.join('\n'));
}

/**
 * META.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function meta(args, ctx, lang) {
	const argv = YargsParser(args, {
		array: ['name'],
		boolean: ['turnnotif'],
		string: ['game'],
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
		outStr += `:label: ${__('cinit-name-set-to', lang).replace(/{name}/g, options.name)}\n`;
	}
	if (argv.turnnotif != null) {
		options.turnnotif = !options.turnnotif;
		outStr += `:bulb: ${__('cinit-turn-notification-changed', lang)} **${__(options.turnnotif ? 'on' : 'off', lang)}**.\n`;
	}
	if (argv.game) {
		combat.game = argv.game;
		outStr += `:game_die: ${__('cinit-game-set-to', lang).replace(/{game}/g, SOURCE_MAP[combat.game])}\n`;
	}

	// If no parameters were given then print out the current values
	if (!outStr) {
		outStr += `:label: ${__('cinit-name-set-to', lang).replace(/{name}/g, options.name)}\n`;
		outStr += `:bulb: ${__('cinit-turn-notification-changed', lang)} **${__(options.turnnotif ? 'on' : 'off', lang)}**.\n`;
		outStr += `:game_die: ${__('cinit-game-set-to', lang).replace(/{game}/g, SOURCE_MAP[combat.game])}\n`;
	}

	combat.options = options;
	await combat.final();
	await ctx.send(outStr);
}

/**
 * LIST.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function list(args, ctx, lang) {
	const argv = YargsParser(args, {
		boolean: ['private'],
		alias: {
			private: ['hidden', 'hide', 'h'],
		},
		default: {
			private: false,
		},
		configuration: ctx.bot.config.yargs,
	});
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);
	const destination = argv.private ? ctx.author : ctx.channel;
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
 * @param {string} lang The language code to be used
 * @async
 */
async function note(args, ctx, lang) {
	const name = args.shift();
	await edit([name, '-note', ...args], ctx, lang);
}

/**
 * EDIT.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function edit(args, ctx, lang) {
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	if (combat.getCombatants().length === 0) {
		return ctx.reply(`❌ ${__('cinit-no-combatants', lang)}`);
	}

	const argv = YargsParser(args, YARGS_PARSE_COMBATANT);
	const name = argv._.join(' ');
	let modifCount = 0;

	const combatant = await combat.selectCombatant(name, null, true);
	if (!combatant) {
		return ctx.reply(`❌ ${__('cinit-no-combatant-with-name', lang)}`);
	}

	// const options = {};
	// const isGroup = combatant instanceof YZCombatantGroup;
	// const runOnce = new Set();

	const out = [];

	if (argv.private != null && argv.private != undefined) {
		combatant.hidden = !combatant.hidden;
		out.push(`:spy: ${combatant.name} ${__(combatant.isPrivate() ? 'cinit-combatant-hidden' : 'cinit-combatant-unhidden', lang)}`);
		modifCount++;
	}
	if (argv.controller) {
		const member = await Sebedius.fetchMember(argv.controller.join(' '), ctx);
		if (!member) {
			out.push(`❌ ${__('cinit-new-controller-not-found', lang)}`);
		}
		else {
			combatant.controller = member.id;
			out.push(`:bust_in_silhouette: ${__('cinit-combatant-controller-changed', lang).replace(/{combatant}/g, combatant.name).replace(/{controller}/g, combatant.controllerMention())}`);
		}
		modifCount++;
	}
	if (argv.armor) {
		const oldArmor = combatant.armor;
		const newArmor = Util.modifOrSet(argv.armor, oldArmor);
		combatant.armor = newArmor;
		out.push(`:shield: ${__('cinit-combatant-armor-changed', lang).replace(/{combatant}/g, combatant.name).replace(/{new_armor}/g, combatant.armor).replace(/{old_armor}/g, oldArmor)}`);
		modifCount++;
	}
	if (argv.speed) {
		const oldSpeed = combatant.speed;
		const newSpeed = Util.modifOrSet(argv.speed, oldSpeed);
		combatant.speed = newSpeed;
		out.push(`:snail: ${__('cinit-combatant-speed-changed', lang).replace(/{combatant}/g, combatant.name).replace(/{new_speed}/g, combatant.speed).replace(/{old_speed}/g, oldSpeed)}`);
		modifCount++;
	}
	if (argv.haste) {
		const oldHaste = combatant.haste;
		const newHaste = Util.modifOrSet(argv.haste, oldHaste);
		combatant.haste = newHaste;
		out.push(`:athletic_shoe: ${__('cinit-combatant-haste-changed', lang).replace(/{combatant}/g, combatant.name).replace(/{new_haste}/g, combatant.haste).replace(/{old_haste}/g, oldHaste)}`);
		modifCount++;
	}
	if (argv.place) {
		if (combatant === combat.currentCombatant) {
			out.push(`❌ ${__('cinit-cant-change-initiative-on-turn', lang)}`);
		}
		else if (argv.place.length) {
			const oldInits = combatant.inits;
			const newInits = [];
			argv.place.forEach((init, i) => {
				if (i < oldInits.length) {
					newInits.push(Util.modifOrSet(init, oldInits[i]));
				}
				else {
					newInits.push(init);
				}
			});
			combatant.inits = newInits;
			combat.sortCombatants();
			out.push(`:zap: ${__('cinit-combatant-initiative-changed', lang).replace(/{combatant}/g, combatant.name).replace(/{new_init}/g, combatant.inits.join('`, `')).replace(/{old_init}/g, oldInits)}`);
		}
		else {
			out.push(`⚠️ Invalid argument: ${argv.place}.`);
		}
		modifCount++;
	}
	if (argv.name) {
		const oldName = combatant.name;
		const newName = argv.name.join(' ');
		if (combat.getCombatant(newName, true)) {
			out.push(`❌ ${__('cinit-duplicate-name', lang)} ${newName}`);
		}
		else if (newName) {
			combatant.name = newName;
			out.push(`:ticket: ${__('cinit-combatant-name-changed', lang).replace(/{old_name}/g, oldName).replace(/{new_name}/g, newName)}`);
		}
		else {
			out.push(`⚠️ ${__('cinit-missing-name', lang)}`);
		}
		modifCount++;
	}
	if (argv.max) {
		const oldMax = combatant.maxhp;
		const newMax = Util.modifOrSet(argv.max, oldMax);
		if (newMax < 1) {
			out.push(`⚠️ ${__('cinit-max-hp-minimum', lang)}`);
		}
		else {
			combatant.maxhp = newMax;
			out.push(`:drop_of_blood: ${__('cinit-combatant-max-hp-changed', lang).replace(/{combatant}/g, combatant.name).replace(/{new_max}/g, combatant.maxhp).replace(/{old_max}/g, oldMax)}`);
		}
		modifCount++;
	}
	if (argv.hp) {
		const oldLife = combatant.hp;
		const newLife = Util.modifOrSet(argv.hp, oldLife);
		combatant.hp = newLife;
		out.push(`:drop_of_blood: ${__('cinit-combatant-hp-changed', lang).replace(/{combatant}/g, combatant.name).replace(/{new_hp}/g, combatant.hp).replace(/{old_hp}/g, oldLife)}`);
		modifCount++;
	}
	if (argv.notes) {
		const notes = argv.notes.join(' ');
		if (notes.length > 0) {
			combatant.notes = notes;
			out.push(`:notepad_spiral: ${__('cinit-combatant-note-added', lang)} **${combatant.name}**.`);
		}
		else {
			combatant.notes = null;
			out.push(`:notepad_spiral: ${__('cinit-combatant-note-removed', lang)} **${combatant.name}**.`);
		}
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
		if (!groupName) {
			combatant.group = null;
			combat.addCombatant(combatant);
			if (wasCurrent) {
				combat.gotoTurn(combatant, true);
			}
			out.push(`:outbox_tray: **${combatant.name}** ${__('cinit-combatant-removed-from-groups', lang)}`);
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
			out.push(`:inbox_tray: ${__('cinit-combatant-added-to-group', lang).replace(/{combatant}/g, combatant.name).replace(/{group}/g, grp.name)}`);
		}
		modifCount++;
	}
	if (modifCount > 0) {
		await combat.final();
		await ctx.send(out.join('\n'));
	}
	else {
		await ctx.reply(`:information_source: ${__('cinit-nothing-modified', lang)}`);
	}
}

/**
 * STATUS.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function status(args, ctx, lang) {
	const argv = YargsParser(args, {
		boolean: ['private'],
		alias: {
			private: ['hidden', 'hide', 'h'],
		},
		default: {
			private: false,
		},
		configuration: ctx.bot.config.yargs,
	});
	const name = argv._.join(' ');

	const combat = await YZCombat.fromId(ctx.channel.id, ctx);
	const combatant = await combat.selectCombatant(name, null, true);
	if (!combatant) {
		return ctx.reply(`❌ ${__('cinit-combatant-or-group-not-found', lang)}`);
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
		await ctx.send(`\`\`\`markdown\n${statusStr}\`\`\``);
	}
}

/* async function _sendHpResult(ctx, combatant, delta = null) {
	const deltaend = delta ? ` (${delta})` : '';

	if (combatant.isPrivate()) {
		await ctx.send(`${combatant.name}: ${combatant.hpString()}`);

		const controller = await Sebedius.fetchMember(combatant.controller, ctx);
		if (controller) {
			await controller.send(`${combatant.name}'s HP: ${combatant.hpString(true)}${deltaend}`);
		}
	}
	else {
		await ctx.send(`${combatant.name}: ${combatant.hpString(true)}${deltaend}`);
	}
}//*/

/**
 * HP.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function setHp(args, ctx, lang) {
	const name = args.shift();
	const hp = args.shift();
	const max = args.includes('-max');

	const combat = await YZCombat.fromId(ctx.channel.id, ctx);
	const combatant = await combat.selectCombatant(name);
	if (!combatant) {
		return ctx.reply(`❌ ${__('cinit-no-combatant-with-name', lang)}`);
	}

	if (!Util.isNumber(hp)) {
		await ctx.send(`\`\`\`\n${combatant.name}: ${combatant.hpString()}\n\`\`\``);
		if (combatant.isPrivate()) {
			const controller = ctx.guild.members.cache.get(combatant.controller);
			if (controller) {
				await controller.send(`\`\`\`\n${combatant.name}'s HP: ${combatant.hpString(true)}\n\`\`\``);
			}
		}
	}
	else if (max) {
		await edit([combatant.name, '-max', hp], ctx, lang);
	}
	else {
		await edit([combatant.name, '-hp', hp], ctx, lang);
	}
}

/**
 * ATTACK.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function attack(args, ctx, lang) {
	const argv = YargsParser(args, {
		array: ['target'],
		boolean: ['armordoubled', 'armorpierced', 'private', 'degrade', 'noarmor'],
		number: ['armorbonus', 'armorpierced'],
		alias: {
			private: ['hidden', 'hide', 'h'],
			target: ['t'],
			armordoubled: ['ad', 'doubled'],
			armorpierced: ['ap', 'pierced'],
			armorbonus: ['bonus', 'ab'],
			degrade: ['x'],
			noarmor: ['noar'],
		},
		configuration: ctx.bot.config.yargs,
	});
	const damage = +argv._.shift() || 0;
	const combatantName = argv.target ? argv.target.join(' ') : argv._.join(' ');

	if (combatantName.includes('|')) {
		const names = combatantName.split('|');
		for (const name of names) {
			if (name.length) {
				await attack([damage, '-t', name], ctx, lang);
			}
		}
		return;
	}

	const noArmor = argv.noarmor ? true : false;
	const isArmorPierced = argv.armorpierced === true ? true : false;
	const isArmorDoubled = argv.armordoubled ? true : false;
	const armorFactor = (isArmorDoubled ? 2 : 1) * (isArmorPierced ? 0.5 : 1) * (noArmor ? 0 : 1);
	const armorMod = (argv.armorbonus ? +argv.armorbonus : 0) + (Util.isNumber(argv.armorpierced) ? -Math.abs(argv.armorpierced) : 0);
	const hidden = argv.private ? true : false;

	const combat = await YZCombat.fromId(ctx.channel.id, ctx);

	const game = combat.game || await ctx.bot.getGame(ctx, 'myz');
	const degradeArmor = argv.degrade ? true : (ctx.bot.config.commands.init.attack.degrade[game] || false);

	let combatant;

	if (!combatantName) {
		combatant = combat.currentCombatant;
		if (!combatant) {
			return ctx.send(`⚠️ ${__('cinit-start-combat-first', lang).replace(/{prefix}/g, ctx.prefix)}`);
		}
	}
	else {
		try {
			combatant = await combat.selectCombatant(combatantName, `:speech_balloon: ${__('cinit-select-target', lang)}`);
		}
		catch (error) {
			console.error(error);
			return ctx.send(`❌ ${__('cinit-target-not-found', lang)}`);
		}
	}
	// Warns.
	await ctx.send(`:crossed_swords: ${__('cinit-attacking', lang).replace(/{combatant}/g, combatant.name).replace(/{damage}/g, damage)}`);

	// Rolls the armor.
	const armorRoll = combat.damageCombatant(combatant, damage, game, degradeArmor, armorMod, armorFactor);
	const finalDamage = Math.max(damage - armorRoll.successCount, 0);
	const armorDamage = (degradeArmor && finalDamage > 0) ? armorRoll.banes : 0;

	// Sends the report
	const out = [];
	if (hidden || combatant.isPrivate()) {
		if (finalDamage > 0) {
			out.push(`:boom: **${combatant.name}** ${__('cinit-combatant-was-hit', lang)}`);
		}
		else {
			out.push(`:mechanical_arm: ${__('cinit-combatant-blocked-all-damage', lang).replace(/{combatant}/g, combatant.name)}`);
		}
	}
	else {
		const dice = Sebedius.emojifyRoll(armorRoll, ctx.bot.config.commands.roll.options[game]);
		const embed = new MessageEmbed()
			.setTitle(__('cinit-damage-armor-roll', lang))
			.setDescription(
				`:boom: ${__('cinit-damage-inflicted', lang)}: **${finalDamage}**
				:shield: ${__('cinit-damage-absorbed', lang)}: **${damage - finalDamage}**
				${armorDamage > 0 ? `:anger: ${__('cinit-armor-degraded', lang)}: **-${armorDamage}**` : ''}`,
			);
		await ctx.send({
			content: dice,
			embeds: [embed],
		});
	}

	if (combatant.hp <= 0) {
		out.push(`:skull: **${combatant.name}** ${__('cinit-combatant-broken', lang)}`);
		// await ctx.bot.commands.get('crit').run([], ctx);
	}

	await combat.final();
	if (out.length) await ctx.send(out.join('\n'));
}

/**
 * REMOVE.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function remove(args, ctx, lang) {
	const name = args.join(' ');
	const combat = await YZCombat.fromId(ctx.channel.id, ctx);
	const combatant = await combat.selectCombatant(name, null, true);
	if (!combatant) {
		return ctx.reply(`❌ ${__('cinit-no-combatant-with-name', lang)}`);
	}
	if (combatant === combat.currentCombatant) {
		return ctx.reply(`:information_source: ${__('cinit-cant-remove-in-own-turn', lang)}`);
	}
	if (combatant.group) {
		const group = combat.getGroup(combatant.group);
		if (group.getCombatants().length <= 1 && group === combat.currentCombatant) {
			return ctx.reply(
				`:information_source: ${__('cinit-cant-remove-last-combatant', lang)}`,
			);
		}
	}
	combat.removeCombatant(combatant);
	await ctx.send(`:soap: **${combatant.name}** ${__('cinit-removed', lang)}`);
	await combat.final();
}

/**
 * END.
 * @param {string[]} args
 * @param {Discord.Message} ctx
 * @param {string} lang The language code to be used
 * @async
 */
async function end(args, ctx, lang) {
	const toEnd = await Sebedius.confirm(
		ctx,
		`:speech_balloon: ${__('cinit-end-confirmation', lang)}`,
		true,
	);
	if (toEnd === null || toEnd === undefined) {
		return ctx.send(`❌ ${__('cinit-timeout', lang)}`)
			.then(m => m.delete(10000))
			.catch(console.error);
	}
	else if (!toEnd) {
		return ctx.send(`❌ ${__('cinit-cancelling', lang)}`)
			.then(m => m.delete(10000))
			.catch(console.error);
	}

	const msg = await ctx.send(`⏹️ ${__('cinit-ending', lang)}`);
	if (!args.includes('-force')) {
		const combat = await YZCombat.fromId(ctx.channel.id, ctx);
		try {
			await ctx.author.send(
				`${__('cinit-summary', lang).replace(/{rounds}/g, combat.round)}`
				+ `${combat.getSummary(true)}`);

			const summary = await combat.getSummaryMsg();
			await summary.edit(combat.getSummary() + ` \`\`\`-----${__('cinit-ended', lang).toUpperCase()}-----\`\`\``);
			await summary.unpin();
		}
		catch (err) { console.error(err); }

		await combat.end();
	}
	else {
		await ctx.bot.kdb.combats.delete(ctx.channel.id);
	}
	await msg.edit(`:ballot_box_with_check: ${__('cinit-ended', lang)}.`);
}
