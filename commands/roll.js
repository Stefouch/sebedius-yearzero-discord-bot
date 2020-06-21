const Config = require('../config.json');
const YZRoll = require('../util/YZRoll');
const YZEmbed = require('../util/YZEmbed');
const { getGame, checkPermissions } = require('../util/SebediusTools');
const { RollParser } = require('../util/RollParser');


module.exports = {
	name: 'roll',
	description: 'Rolls dice for any Year Zero roleplaying game.',
	moreDescriptions: [
		[
			'Select [game]',
			'This argument is used to specify the skin of the rolled dice.'
			+ ' Can be omitted if you set it with `!setconf game [default game]`'
			+ `\n Choices: \`${Config.supportedGames.join('`, `')}\`.`,
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
	async execute(args, message, client) {
		// Parsing arguments. See https://www.npmjs.com/package/yargs-parser#api for details.
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

		// Sets the game. Must be done first.
		let game;
		if (client.config.supportedGames.includes(rollargv._[0])) {
			game = rollargv._.shift();
		}
		else {
			game = await getGame(message, client);
		}

		// Year Zero dice quantities for the roll.
		let baseDiceQty = 0, skillDiceQty = 0, gearDiceQty = 0, negDiceQty = 0, stressDiceQty = 0;
		const artifactDice = [];
		let roll;

		// Year Zero Roll Regular Expression.
		const yzRollRegex = /^((\d{1,2}[dbsgna])|([bsgna]\d{1,2}))+$/i;

		// Checks for d6, d66 & d666.
		if (/^d6{1,3}$/i.test(rollargv._[0])) {
			game = 'generic';
			const skill = (rollargv._[0].match(/6/g) || []).length;

			roll = new YZRoll(message.author, { skill }, rollargv._[0].toUpperCase());
			// roll.maxPushes = 0; // already set later. Use this options if you want to change "game = generic" above.
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

							//console.log(`arg: ${arg}\ndiceCouples: ${diceCouples}\ndieCouple: ${dieCouple}\ncouple: ${couple}`);

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
								const diceOptions = client.config.commands.roll.options[game].alias;
								if (diceOptions) {
									if (diceOptions.hasOwnProperty(type)) type = diceOptions[type];
								}

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
			if (rollargv.name) rollTitle = `${rollargv.name.join(' ')}${rollargv.fullauto ? ' *(Full-Auto)*' : ''}`;

			roll = new YZRoll(
				message.author,
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
			game = 'generic';
			roll = new YZRoll(message.author, { skill: 1 }, 'Initiative');
		}
		// Checks for generic rolls.
		else if (RollParser.ROLLREGEX.test(rollargv._[0]) && !/^\d{1,2}d$/i.test(rollargv._[0])) {
			game = 'generic';
			const genRoll = RollParser.parse(rollargv._[0]);
			const genRollResults = genRoll.roll(true);

			roll = new YZRoll(message.author, { skill: 0 }, rollargv._[0].toUpperCase());
			roll.dice.skill = genRollResults;
			if (genRoll.modifier) roll.dice.neg.push(genRoll.modifier);
		}
		// Exits if no check.
		else {
			return message.reply('ℹ️ I don\'t understand this syntax. Type `help roll` for details on the proper usage.');
		}

		// Sets the game.
		roll.setGame(game);

		// Checks for number of pushes or Full-Auto (unlimited pushes).
		if (rollargv.fullauto) {
			roll.setFullAuto(true);
		}
		else if (rollargv.push > 1) {
			roll.maxPushes = Number(rollargv.push) || 1;
		}
		else if (game === 'generic') {
			roll.maxPushes = 0;
		}

		// Log and Roll.
		console.log('[ROLL] - Rolled:', roll.toString());
		messageRollResult(roll, message, client);
	},
	emojifyRoll(roll, options, icons) {
		return getDiceEmojis(roll, options, icons);
	},
};

/**
 * Sends a message with the roll result.
 * @param {YZRoll} roll The Roll
 * @param {Discord.Message} triggeringMessage The Triggering Message
 * @param {Discord.Client} client The Client (the bot)
 * @async
 */
async function messageRollResult(roll, triggeringMessage, client) {
	// Aborts if the bot doesn't have the needed permissions.
	if (!checkPermissions(triggeringMessage, client)) return;

	// Aborts if too many dice.
	if (roll.size > client.config.commands.roll.max) {
		return triggeringMessage.reply('⚠️ Cant\'t roll that, too many dice!');
	}

	// Aborts if no dice.
	if (roll.size < 1) {
		return triggeringMessage.reply('❌ Can\'t roll a null number of dice!');
	}

	// OPTIONS
	// Important for all below.
	const userId = triggeringMessage.author.id;
	const pushIcon = client.config.commands.roll.pushIcon;
	const gameOptions = client.config.commands.roll.options[roll.game];

	// Sends the message.
	triggeringMessage.channel.send(
		getDiceEmojis(roll, gameOptions, client.config.icons),
		getEmbedDiceResults(roll, triggeringMessage, gameOptions),
	)
		.then(rollMessage => {
			// Detects PANIC.
			if (gameOptions.panic && roll.panic) {
				return client.commands.get('panic').execute([roll.stress], triggeringMessage, client);
			}

			// Adds a push reaction icon.
			// See https://unicode.org/emoji/charts/full-emoji-list.html
			if (roll.pushable) {
				rollMessage.react(pushIcon);

				// Adds a ReactionCollector to the push icon.
				// The filter is for reacting only to the push icon and the user who rolled the dice.
				const filter = (reaction, user) => reaction.emoji.name === pushIcon && user.id === userId;
				const collector = rollMessage.createReactionCollector(filter, { time: client.config.commands.roll.pushCooldown });

				// ========== Listener: On Collect ==========
				collector.on('collect', reac => {
					const pushedRoll = roll.push();

					// Detects additional dice from pushing.
					if (gameOptions.extraPushDice) {
						for (const extra of gameOptions.extraPushDice) {
							pushedRoll.addDice(1, extra);
						}
					}

					console.log(`[ROLL] - Roll pushed: ${pushedRoll.toString()}`);

					// Stops the collector if it's the last push.
					if (!roll.pushable) collector.stop();

					// Edits the roll result embed message.
					if (!rollMessage.deleted) {
						rollMessage.edit(
							getDiceEmojis(pushedRoll, gameOptions, client.config.icons),
							getEmbedDiceResults(pushedRoll, triggeringMessage, gameOptions),
						)
							// Removing the player's reaction.
							// Only for multiple pushes.
							.then(async () => {
								if (pushedRoll.pushable && rollMessage.channel.type !== 'dm') {
									const userReactions = rollMessage.reactions.cache.filter(r => r.users.cache.has(userId));
									try {
										for (const r of userReactions.values()) {
											await r.users.remove(userId);
										}
									}
									catch(error) {
										console.error('Failed to remove reactions.');
									}
								}
							})
							.catch(console.error);
					}

					// Detects PANIC.
					if (gameOptions.panic && pushedRoll.panic) {
						collector.stop();
						return client.commands.get('panic').execute([pushedRoll.stress], triggeringMessage, client);
					}
				});

				// ========== Listener: On End ==========
				collector.on('end', (collected, reason) => {
					const reac = rollMessage.reactions.cache.first();
					if (reac) {
						if (reac.emoji.name === pushIcon && rollMessage.channel.type !== 'dm') {
							reac.remove()
								.catch(console.error);
						}
					}
				});
			}
		})
		.catch(console.error);
}

/**
 * Returns a text with all the dice turned into emojis.
 * @param {YZRoll} roll The roll
 * @param {Object} opts Options of the roll command
 * @param {Object} icons See Config.icons
 * @returns {string} The manufactured text
 */
function getDiceEmojis(roll, opts, icons) {
	const game = opts.iconTemplate || roll.game;
	let str = '';

	for (const type in roll.dice) {
		let iconType = type;
		const nbre = roll.dice[type].length;

		// Skipping types.
		if (opts.alias) {
			if (opts.alias[type] === '--') continue;
		}

		if (nbre) {
			str += '\n';

			for (let k = 0; k < nbre; k++) {
				const val = roll.dice[type][k];
				const icon = icons[game][iconType][val] || ` {**${val}**} `;
				str += icon;

				// This is calculated to make a space between pushed and not pushed rolls.
				if (roll.pushed) {
					const keep = roll.keeped[type];

					if (k === keep - 1) {
						str += '\t';
					}
				}
			}
		}
	}

	if (roll.artifactDice.length) {
		for (const artifactDie of roll.artifactDice) {
			str += Config.icons.fbl.arto[artifactDie.result];
		}
	}

	return str;
}

/**
 * Gets an Embed with the dice results and the author's name.
 * @param {YZRoll} roll The 'Roll' Object
 * @param {Discord.Message} message The triggering message
 * @param {Object} opts Options of the roll command
 * @returns {Discord.MessageEmbed} A Discord Embed Object
 */
function getEmbedDiceResults(roll, message, opts) {

	const s = roll.sixes;

	let desc = '';

	if (roll.game === 'generic') {
		// Any modifier is placed in position [0] of dice.neg[]
		let modifier = 0;
		if (roll.dice.neg.length) modifier = roll.dice.neg[0];

		desc += `Result: **${roll.sum('skill') + modifier}**\n(${roll.dice.skill.join(', ')})`;
		if (modifier !== 0) desc += ` ${modifier > 0 ? '+' : ''}${modifier}`;
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

	const embed = new YZEmbed(roll.title, desc, message, true);

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