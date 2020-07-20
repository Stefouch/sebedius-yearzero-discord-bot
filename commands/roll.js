const Sebedius = require('../Sebedius');
const YZRoll = require('../yearzero/YZRoll');
const { YZEmbed } = require('../utils/embeds');
const { RollParser } = require('../utils/RollParser');
const ReactionMenu = require('../utils/ReactionMenu');
const { SUPPORTED_GAMES } = require('../utils/constants');
const Config = require('../config.json');

module.exports = {
	name: 'roll',
	group: 'Core',
	description: 'Rolls dice for any Year Zero roleplaying game.',
	moreDescriptions: [
		[
			'Select [game]',
			'This argument is used to specify the skin of the rolled dice.'
			+ ' Can be omitted if you set it with `!setconf game [default game]` or if you use one of the shortcut commands'
			+ `\n Choices: \`${SUPPORTED_GAMES.join('`, `')}\`.`,
		],
		[
			'Rolling Simple Dice',
			'`roll d6|d66|d666` – Rolls a D6, D66, or D666.'
			+ '\n`roll XdY±Z` – Rolls X dice of range Y, modified by Z.'
			+ '\n`roll init` – Rolls initiative (one D6).',
		],
		[
			'Rolling Year Zero Dice',
			'Use any combinations of these letters with a number:'
			+ '\n• `b` – Base dice (attributes)'
			+ '\n• `s` – Skill dice / Stress dice (for ALIEN)'
			+ '\n• `n` – Negative dice (for MYZ and FBL)'
			+ '\n• `d` – Generic dice'
			+ '\n• `a8` – D8 Artifact dice (from FBL)'
			+ '\n• `a10` – D10 Artifact dice (from FBL)'
			+ '\n• `a12` – D12 Artifact dice (from FBL)'
			+ '\n\n*Example: roll 5b 3s 2g*',
		],
		[
			'Additional Arguments',
			'Additional options for the roll:'
			+ '\n`-n <name>` : Defines a name for the roll.'
			+ '\n`-p <number>` : Changes the maximum number of allowed pushes.'
			+ '\n`-f` : "Full-auto", unlimited number of pushes (max 10).'
			+ '\n`-pride` : Adds a D12 Artifact Die to the roll.',
		],
		[
			'More Info',
			`To push the roll, click the ${Config.commands.roll.pushIcon} reaction icon under the message.`
			+ ' The push option for the dice pool roll is available for 2 minutes. Only the user who initially rolled the dice can push them.'
			+ '\nTo clear the reaction menu, click the ❌ reaction icon.'
			+ '\nCoriolis has more push options: 🙏 (Praying the Icons, +1D) and 🕌 (in a chapel, +2D).'
			+ `\nMax ${Config.commands.roll.max} dice can be rolled at once. If you try to roll more, it won't happen.`,
		],
		[
			'See Also',
			'The following commands are shortcuts if you don\'t want to specify the [game] parameter each time.'
			+ '\n`rm` – Rolls *Mutant: Year Zero* dice.'
			+ '\n`rf` – Rolls *Forbidden Lands* dice.'
			+ '\n`rt` – Rolls *Tales From The Loop* dice.'
			+ '\n`rc` – Rolls *Coriolis* dice.'
			+ '\n`ra` – Rolls *ALIEN* dice.'
			+ '\n`rv` – Rolls *Vaesen* dice.',
		],
	],
	aliases: ['r', 'lance', 'lancer', 'slå', 'sla'],
	guildOnly: false,
	args: true,
	usage: '[game] <dice> [arguments]',
	async execute(args, ctx) {
		// Parsing arguments. See https://www.npmjs.com/package/yargs-parser#api for details.
		const rollargv = require('yargs-parser')(args, {
			boolean: ['fullauto', 'initiative'],
			number: ['push'],
			array: ['name'],
			alias: {
				push: ['p', 'pushes'],
				name: ['n'],
				fullauto: ['f', 'fa', 'full-auto', 'fullAuto'],
			},
			default: {
				fullauto: false,
			},
			configuration: ctx.bot.config.yargs,
		});
		const name = rollargv.name ? rollargv.name.join(' ') : null;

		// Sets the game. Must be done first.
		let game;
		if (SUPPORTED_GAMES.includes(rollargv._[0])) game = rollargv._.shift();
		else game = await ctx.bot.getGame(ctx, 'myz');

		// Year Zero dice quantities for the roll.
		let baseDiceQty = 0, skillDiceQty = 0, gearDiceQty = 0, negDiceQty = 0, stressDiceQty = 0;
		const artifactDice = [];
		let roll;

		// Year Zero Roll Regular Expression.
		const yzRollRegex = /^((\d{1,2}[dbsgna])|([bsgna]\d{1,2}))+$/i;

		// Checks for d6, d66 & d666.
		if (/^d6{1,3}$/i.test(rollargv._[0])) {
			if (ctx.bot.config.commands.roll.options[game].hasBlankDice) {
				game = 'generic';
			}
			const skill = (rollargv._[0].match(/6/g) || []).length;

			roll = new YZRoll(ctx.author, { skill }, rollargv._[0].toUpperCase());
			roll.maxPushes = 0;
			roll.modifier = 0;
		}
		// If not, checks if the first argument is a YZ roll phrase.
		else if (yzRollRegex.test(rollargv._[0])) {
			// If so, we process all uncategorized arguments.
			for (const arg of rollargv._) {
				// Checks if it's a roll phrase.
				if (yzRollRegex.test(arg)) {

					// If true, the roll phrase is then splitted in digit-letter or letter-digit couples.
					const diceCouples = arg.match(/(\d{1,2}[dbsgna])|([bsgna]\d{1,2})/gi);

					if (diceCouples.length) {

						for (const dieCouple of diceCouples) {

							// Then, each couple is splitted in an array with the digit and the letter.
							const couple = dieCouple.match(/\d{1,2}|[dbsgna]/gi);

							// Sorts numbers (dice quantity) in first position.
							couple.sort();

							const diceQty = Number(couple[0]) || 1;
							const dieTypeChar = couple[1].toLowerCase();

							// For the chosen letter, we assign a die type.
							let type;
							switch (dieTypeChar) {
							case 'b': type = 'base'; break;
							case 'd':
								if (game === 'alien') type = 'base';
								else type = 'skill';
								break;
							case 's': type = 'skill'; break;
							case 'g': type = 'gear'; break;
							case 'n': type = 'neg'; break;
							case 'a': artifactDice.push(diceQty); break;
							}

							if (type) {
								// First, checks if there are some type swap (see config roll aliases).
								const diceOptions = ctx.bot.config.commands.roll.options[game].alias;
								if (diceOptions) {
									if (diceOptions.hasOwnProperty(type)) type = diceOptions[type];
								}

								// Then adds the dice.
								switch (type) {
								case 'base': baseDiceQty += diceQty; break;
								case 'skill': skillDiceQty += diceQty; break;
								case 'gear': gearDiceQty += diceQty; break;
								case 'neg': negDiceQty += diceQty; break;
								case 'stress': stressDiceQty += diceQty; break;
								}
							}
						}
					}
				}
			}
			// Adds extra Artifact Dice.
			// 1) Forbidden Lands' Pride.
			if (rollargv.pride || rollargv._.includes('pride')) artifactDice.push(12);

			// Rolls the dice.
			let rollTitle = '';
			if (name) rollTitle = `${name}${rollargv.fullauto ? ' *(Full-Auto)*' : ''}`;

			roll = new YZRoll(
				ctx.author,
				{
					base: baseDiceQty,
					skill: skillDiceQty,
					gear: gearDiceQty,
					neg: negDiceQty,
					stress: stressDiceQty,
					artifactDice,
				},
				rollTitle,
			);
		}
		// Checks for init roll.
		else if (/initiative|init/i.test(rollargv._[0])) {
			if (ctx.bot.config.commands.roll.options[game].hasBlankDice) {
				game = 'generic';
			}
			roll = new YZRoll(ctx.author, { skill: 1 }, 'Initiative');
			roll.maxPushes = 0;
			roll.modifier = 0;
		}
		// Checks for generic rolls.
		else if (RollParser.ROLLREGEX.test(rollargv._[0]) && !/^\d{1,2}d$/i.test(rollargv._[0])) {
			if (ctx.bot.config.commands.roll.options[game].hasBlankDice) {
				game = 'generic';
			}
			const genRoll = RollParser.parse(rollargv._[0]);
			const genRollResults = genRoll.roll(true);
			const rollString = rollargv._[0].toUpperCase();
			const title = name ? `${name} (${rollString})` : rollString;

			roll = new YZRoll(ctx.author, { skill: 0 }, title);
			roll.dice.skill = genRollResults;
			if (genRoll.modifier) roll.modifier = genRoll.modifier;
			roll.maxPushes = 0;
			roll.modifier = 0;
		}
		// Checks if PRIDE roll alone.
		else if (rollargv.pride || rollargv._.includes('pride')) {
			game = 'fbl',
			roll = new YZRoll(ctx.author, { artifactDice: [12] }, 'Pride');
		}
		// Exits if no check.
		else {
			return ctx.reply(`ℹ️ I don't understand this syntax. Type \`${ctx.prefix}help roll\` for details on the proper usage.`);
		}

		// Sets the game.
		roll.setGame(game);

		// Checks for number of pushes or Full-Auto (unlimited pushes).
		if (rollargv.fullauto) {
			roll.setFullAuto(true);
		}
		else if (rollargv.push) {
			roll.maxPushes = Number(rollargv.push) || 1;
		}

		// Log and Roll.
		console.log('[ROLL] - Rolled:', roll.toString());
		await messageRollResult(roll, ctx);
	},
};

/**
 * Sends a message with the roll result.
 * @param {YZRoll} roll The Roll
 * @param {Discord.Message} ctx The Triggering Message with context
 * @param {Discord.Client} client The Client (the bot)
 * @async
 */
async function messageRollResult(roll, ctx) {
	// Aborts if the bot doesn't have the needed permissions.
	if (!Sebedius.checkPermissions(ctx)) return;

	// Aborts if too many dice.
	if (roll.size > ctx.bot.config.commands.roll.max) {
		return ctx.reply('⚠️ Cant\'t roll that, too many dice!');
	}

	// Aborts if no dice.
	if (roll.size < 1) {
		return ctx.reply('❌ Can\'t roll a null number of dice!');
	}

	// OPTIONS
	// Important for all below.
	const userId = ctx.author.id;
	const pushIcon = ctx.bot.config.commands.roll.pushIcon;
	const gameOptions = ctx.bot.config.commands.roll.options[roll.game];

	// Sends the message.
	await ctx.channel.send(
		Sebedius.emojifyRoll(roll, gameOptions),
		getEmbedDiceResults(roll, ctx, gameOptions),
	)
		.then(rollMessage => {
			// Detects PANIC.
			if (gameOptions.panic && roll.panic) {
				return ctx.bot.commands.get('panic').execute([roll.stress], ctx);
			}
			if (roll.pushable) {
				// Creates an array of objects containing the required information
				// for the Reaction Menu.
				const reactions = [
					{
						icon: pushIcon,
						owner: userId,
						fn: collector => messagePushEdit(collector, ctx, rollMessage, roll, gameOptions),
					},
				];
				// Adds extra reactions from the config options.
				if (gameOptions.reactionMenu) {
					for (const reac of gameOptions.reactionMenu) {
						reactions.push({
							icon: reac.icon,
							owner: userId,
							fn: collector => {
								const gopts = Object.assign({}, gameOptions);
								gopts.extraPushDice = reac.extraPushDice;
								messagePushEdit(collector, ctx, rollMessage, roll, gopts);
							},
						});
					}
				}
				// Adds the stop reaction.
				reactions.push({
					icon: '❌',
					owner: userId,
					fn: collector => collector.stop(),
				});
				// Starts the Reaction Menu.
				const cooldown = ctx.bot.config.commands.roll.pushCooldown;
				const rm = new ReactionMenu(rollMessage, cooldown, reactions);
			}
		})
		.catch(console.error);
}

/**
 * Edits the message when the roll is pushed.
 * @param {Discord.ReactionCollector} collector Discord Reaction Collector
 * @param {Discord.Message} ctx The triggering message with context
 * @param {Discord.Message} rollMessage The roll message
 * @param {YZRoll} roll The roll object
 * @param {Object} gameOptions client.config.commands.roll.[game]
 */
function messagePushEdit(collector, ctx, rollMessage, roll, gameOptions) {
	// Pushes the roll.
	const pushedRoll = roll.push();

	// Detects additional dice from pushing.
	if (gameOptions.extraPushDice) {
		for (const extra of gameOptions.extraPushDice) {
			pushedRoll.addDice(1, extra);
		}
	}
	// Logs.
	console.log(`[ROLL] - Roll pushed: ${pushedRoll.toString()}`);

	// Stops the collector if it's the last push.
	if (!roll.pushable) collector.stop();

	// Edits the roll result embed message.
	if (!rollMessage.deleted) {
		rollMessage.edit(
			Sebedius.emojifyRoll(pushedRoll, gameOptions),
			getEmbedDiceResults(pushedRoll, ctx, gameOptions),
		)
			.catch(console.error);
	}
	// Detects PANIC.
	if (gameOptions.panic && pushedRoll.panic) {
		collector.stop();
		return ctx.bot.commands.get('panic').execute([pushedRoll.stress], ctx);
	}
}

/**
 * Gets an Embed with the dice results and the author's name.
 * @param {YZRoll} roll The 'Roll' Object
 * @param {Discord.Message} ctx The triggering message with context
 * @param {Object} opts Options of the roll command
 * @returns {Discord.MessageEmbed} A Discord Embed Object
 */
function getEmbedDiceResults(roll, ctx, opts) {

	const s = roll.sixes;
	let desc = '';

	if (roll.modifier != null) {
		const mod = roll.modifier;
		desc += `Result: **${roll.sum('skill') + mod}**\n(${roll.dice.skill.join(', ')})`;
		if (mod !== 0) desc += ` ${mod > 0 ? '+' : ''}${mod}`;
	}
	else {
		desc = `Success${s > 1 ? 'es' : ''}: **${s}**`;

		if (opts.trauma) {
			const n = roll.attributeTrauma;
			desc += `\nTrauma${n > 1 ? 's' : ''}: **${n}**`;
		}
		if (opts.gearDamage) {
			desc += `\nGear Damage: **${roll.gearDamage}**`;
		}
		if (opts.panic && roll.panic) {
			desc += '\n**PANIC!!!**';
		}
	}

	const embed = new YZEmbed(roll.title, desc, ctx, true);

	if (opts.detailed) {
		let results = '';
		for (const type in roll.dice) {
			if (roll.dice[type].length) {
				results += `${type}: (${roll.dice[type].join(', ')})\n`;
			}
		}
		if (roll.artifactDice.length) {
			results += 'arto: ';
			for (const d of roll.artifactDice) {
				results += d.toString() + ' ';
			}
		}
		embed.addField('Details', results, false);
	}

	if (roll.pushed) embed.setFooter(`${(roll.pushed > 1) ? `${roll.pushed}× ` : ''}Pushed`);

	return embed;
}