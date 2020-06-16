const Config = require('../config.json');
const YZRoll = require('../util/YZRoll');
const YZEmbed = require('../util/YZEmbed');
const Util = require('../util/Util');
const { RollParser } = require('../util/RollParser');
const db = require('../database/database');

module.exports = {
	name: 'roll',
	description: 'Rolls dice for the *Mutant: Year Zero* roleplaying game.'
		+ ` Max ${Config.commands.roll.max} dice can be rolled at once. If you try to roll more, it won't happen.`,
	moreDescriptions: [
		[
			'Single Dice',
			'`roll d6|d66|d666 [name]` – Rolls a D6, D66, or D666.'
			+ '\n`roll Xd [name]` – Rolls X D6 and sums their results.'
			+ '\n`roll res d6|d8|d10|d12 [name]` – Rolls a Resource Die.'
			+ '\n`roll init [bonus]` – Rolls initiative with or without a bonus',
		],
		[
			'Pool of Dice',
			'`roll [Xb][Ys][Zg] [Artifact Die] [name] [--fullauto]` – Rolls a pool of dice following the rules of MYZ:'
			+ '\n• `X b` – Rolls X base dice (yellow color).'
			+ '\n• `Y s` – Rolls Y skill dice (green color). Use `n` instead of `s` for negative dice.'
			+ '\n• `Z g` – Rolls Z gear dice (black color).'
			+ '\n• `Artifact Die` – Rolls an Artifact Die (`d6|d8|d10|d12`), adapted from *Forbidden Lands*.'
			+ '\n• `--fullauto` – Allows unlimited pushes.'
			+ '\n\n*Example:* `roll 5b3s2g` *rolls for 5 base, 3 skill and 2 gear dice.*',
		],
		[
			'Pushing',
			`To push the roll, click the ${Config.commands.roll.pushIcon} reaction icon below the message.`
			+ ' Only the user who initially rolled the dice can push them.'
			+ `\nPushing is available for ${Config.commands.roll.pushCooldown / 1000} seconds.`
			+ ' Four spaces separates the keeped dice from the new rolled ones.',
		],
	],
	aliases: ['roll', 'r', 'lance', 'lancer', 'slå', 'sla'],
	guildOnly: false,
	args: true,
	usage: '<dice>',
	async execute(args, message, client) {
		// Parsing arguments. See https://www.npmjs.com/package/yargs-parser#api for details.
		const rollargv = require('yargs-parser')(args, {
			alias: {
				push: ['p', 'pushes'],
				name: ['n'],
				fullauto: ['f', 'fa', 'full-auto', 'fullAuto'],
			},
			default: {
				push: 1,
				fullauto: false,
			},
			boolean: ['fullauto'],
			array: ['name'],
			configuration: {
				'short-option-groups': false,
				'duplicate-arguments-array': false,
				// 'combine-arrays': true,
				'flatten-duplicate-arrays': true,
			},
		});

		console.log(rollargv);
		

		let baseDiceQty = 0, skillDiceQty = 0, gearDiceQty = 0, negDiceQty = 0;
		const artifactDice = [];

		// For each uncategorized argument, we must check what it is.
		for (const arg of rollargv._) {

			// Checks if it's a roll phrase.
			if (/^((\d{1,2}[bsgna])|([bsgna]\d{1,2}))+$/i.test(arg)) {

				// If true, the roll phrase is then splitted in digit-letter or letter-digit couples.
				const diceCouples = arg.match(/(\d{1,2}[bsgna])|([bsgna]\d{1,2})/gi);

				if (diceCouples.length) {

					for (const dieCouple of diceCouples) {

						// Then, each couple is splitted in an array with the digit and the letter.
						const couple = dieCouple.match(/\d{1,2}|[bsgna]/gi);

						// Sorts numbers (dice quantity) in first position.
						couple.sort();

						const diceQty = Number(couple[0]) || 1;
						const dieTypeChar = couple[1].toLowerCase();

						//console.log(`arg: ${arg}\ndiceCouples: ${diceCouples}\ndieCouple: ${dieCouple}\ncouple: ${couple}`);

						switch (dieTypeChar) {
							case 'b': baseDiceQty += diceQty; break;
							case 's': skillDiceQty += diceQty; break;
							case 'g': gearDiceQty += diceQty; break;
							case 'n': negDiceQty += diceQty; break;
							case 'a': artifactDice.push(diceQty); break;
						}
					}
				}
			}
		}
		// Adds extra Artifact Dice.
		// 1) Forbidden Lands' Pride.
		if (rollargv.pride) artifactDice.push(12);

		// Rolls the dice.
		let rollTitle = '';
		if (rollargv.name) rollTitle = `${rollargv.name.join(' ')}${rollargv.fullauto ? ' *(Full-Auto)*' : ''}`;

		const roll = new YZRoll(
			message.author,
			{
				base: baseDiceQty,
				skill: skillDiceQty,
				gear: gearDiceQty,
				neg: negDiceQty,
				artifactDice,
			},
			rollTitle,
		);

		// Sets the game.
		roll.setGame(await getGame(rollargv._[0], message, client));

		// Checks if Full-Auto (unlimited pushes).
		if (rollargv.fullauto) roll.setFullAuto(true);

		// Log and Roll.
		console.log('[ROLL] - Rolled:', roll.toString());
		messageRollResult(roll, message, client);
	},
};
/*	execute2(args, message) {
		const rollArgument = args.shift();

		// Exits early if no argument.
		// Though, this check isn't really necessary as "command.args = true".
		if (!rollArgument.length) return message.reply(`I don't understand the command. Try \`${Config.defaultPrefix}help roll\`.`);

		if (/^(\d{1,2}[bsgn]){1,4}$/i.test(rollArgument)) {
			const diceArguments = rollArgument.match(/\d{1,2}[bsgn]/gi);

			if (diceArguments.length) {
				let baseDiceQty = 0, skillDiceQty = 0, gearDiceQty = 0, negDiceQty = 0;
				let artifactDieSize = 0;

				for (const dieArg of diceArguments) {
					const dieTypeChar = dieArg.slice(-1).toLowerCase();
					const diceQty = Number(dieArg.slice(0, -1)) || 0;
					switch (dieTypeChar) {
					case 'b': baseDiceQty = diceQty; break;
					case 's': skillDiceQty = diceQty; break;
					case 'g': gearDiceQty = diceQty; break;
					case 'n': negDiceQty = diceQty; break;
					}
				}

				if (ARTIFACT_DIE_REGEX.test(args[0])) {
					// Uses shift() to excise this part from the roll's name.
					const artifactDieArgument = args.shift();
					const [, matchedSize] = artifactDieArgument.match(ARTIFACT_DIE_REGEX);
					artifactDieSize = Math.min(matchedSize, 12);
				}

				// Rolls the dice.
				const rollTitle = args.join(' ').replace('--', '–');
				const roll = new YZRoll(
					message.author,
					{
						base: baseDiceQty,
						skill: skillDiceQty,
						gear: gearDiceQty,
						neg: negDiceQty,
						artifactDie: artifactDieSize,
					},
					rollTitle
				);

				if (args.includes('--fullauto')) roll.setFullAuto(true);

				console.log('[ROLL] - Rolled:', roll.toString());

				sendMessageForRollResults(roll, message);
			}
		// checks d666 or d66 or (N)d6.
		}
		else if (/^d666$/i.test(rollArgument)) {
			const rollTitle = args.join(' ');
			const roll = new YZRoll(message.author.id, { base: 3 }, rollTitle);
			sendMessageForD6(roll, message, 'BASESIX');
		}
		else if (/^d66$/i.test(rollArgument)) {
			const rollTitle = args.join(' ');
			const roll = new YZRoll(message.author.id, { base: 2 }, rollTitle);
			sendMessageForD6(roll, message, 'BASESIX');
		}
		else if (/^d6$/i.test(rollArgument)) {
			const rollTitle = args.join(' ');
			const roll = new YZRoll(message.author.id, { base: 1 }, rollTitle);
			sendMessageForD6(roll, message, 'BASESIX');
		}
		else if (/^\d+d6?$/i.test(rollArgument)) {
			const rollTitle = args.join(' ');
			const [, nb] = rollArgument.match(/(^\d+)/);
			const roll = new YZRoll(message.author.id, { base: nb }, rollTitle);
			sendMessageForD6(roll, message, 'ADD');
		}
		// Initiative roll.
		else if (rollArgument.includes('init')) {
			const initBonus = +args[0] || 0;
			const initRoll = Util.rand(1, 6);
			const initTotal = initBonus + initRoll;
			const initDie = Config.icons.myz.base[initRoll];

			let desc = `Initiative: ${initDie}`;
			if (initBonus) desc += ` ${(initBonus >= 0) ? '+' : ''}${initBonus} = **${initTotal}**`;
			const embed = new YZEmbed(null, desc, message, true);

			return message.channel.send(embed);
		}
		// Resource Die.
		else if (rollArgument === 'res') {
			const resourceDieArgument = args.shift();

			if (ARTIFACT_DIE_REGEX.test(resourceDieArgument)) {
				const [, size] = resourceDieArgument.match(ARTIFACT_DIE_REGEX);
				const resTitle = args.join(' ');
				const roll = new YZRoll(message.author.id, { artifactDie: size }, resTitle);
				sendMessageForResourceDie(roll, message);
			}
			else {
				message.reply('This Resource Die is not possible.');
			}
		}
		// Generic Roll.
		else if (RollParser.ROLLREGEX.test(rollArgument)) {
			const roll = RollParser.parse(rollArgument);
			const result = roll.roll();
			let text = `Generic roll: \`${rollArgument}\` = (${roll.lastResults.join('+')})`;

			if (roll.modifier) {
				text += roll.modifier > 0 ? '+' : '';
				text += roll.modifier;
			}

			text += ` = ${result}`;

			return message.reply(text);
		}
		else {
			message.reply(`I don't understand the command. Try \`${Config.defaultPrefix}help roll\`.`);
		}
	},//*/


/**
 * Sends a message with the roll result.
 * @param {YZRoll} roll The Roll
 * @param {Discord.Message} triggeringMessage The Triggering Message
 * @param {Discord.Client} client The Client (the bot)
 */
async function messageRollResult(roll, triggeringMessage, client) {
	// Aborts if too many dice.
	if (roll.size > client.config.commands.roll.max) {
		return triggeringMessage.reply('Cant\'t roll that, too many dice!');
	}

	// Aborts if no dice.
	if (roll.size < 1) {
		return triggeringMessage.reply('Can\'t roll that, no dice!');
	}

	// Options.
	const pushIcon = client.config.commands.roll.pushIcon;
	const gameOptions = client.config.commands.roll.options[roll.game];

	// Sends the message.
	triggeringMessage.channel.send(
		getDiceEmojis(roll, gameOptions),
		getEmbedDiceResults(roll, triggeringMessage, gameOptions),
	)
		.then(rollMessage => {
			// Adds a push reaction icon.
			// See https://unicode.org/emoji/charts/full-emoji-list.html
			if (!roll.pushed || roll.isFullAuto) {
				rollMessage.react(pushIcon);

				// Adds a ReactionCollector to the push icon.
				// The filter is for reacting only to the push icon and the user who rolled the dice.
				const filter = (reaction, user) => reaction.emoji.name === pushIcon && user.id === triggeringMessage.author.id;
				const collector = rollMessage.createReactionCollector(filter, { time: client.config.commands.roll.pushCooldown });

				// Listener: On Collect
				collector.on('collect', reac => {
					if (!roll.isFullAuto) collector.stop();

					const pushedRoll = roll.push();
					console.log(`[ROLL] - Roll pushed: ${pushedRoll.toString()}`);

					if (!rollMessage.deleted) {
						rollMessage.edit(
							getDiceEmojis(pushedRoll, gameOptions),
							{ embed: getEmbedDiceResults(pushedRoll, triggeringMessage, gameOptions) },
						)
							// Removing the player's reaction.
							.then(() => reac.remove());
					}
				});

				// Listener: On End
				collector.on('end', () => {
					try {
						if (!rollMessage.deleted && rollMessage.channel.type === 'text') {
							rollMessage.clearReactions(reac => {
								return reac.emoji.name === pushIcon;
							});
						}
					}
					catch (error) {
						console.error(error);
					}
				});
			}
		})
		.catch(console.error);
}

/**
 * Sends a message with the roll results.
 * @param {YZRoll} roll The roll
 * @param {Discord.Message} triggeringMessage The triggering message
 **
function sendMessageForRollResults(roll, triggeringMessage) {
	if (roll.size > Config.commands.roll.max) return triggeringMessage.reply('Can\'t roll that, too many dice!');

	triggeringMessage.channel.send(getDiceEmojis(roll), getEmbedDiceResults(roll, triggeringMessage))
		.then(rollMessage => {
			if (!roll.pushed || roll.isFullAuto) {
				// See https://unicode.org/emoji/charts/full-emoji-list.html
				// Adds a push reaction icon.
				const pushIcon = Config.commands.roll.pushIcon;
				rollMessage.react(pushIcon);

				// Adds a ReactionCollector to the push icon.
				// The filter is for reacting only to the push icon and the user who rolled the dice.
				const filter = (reaction, user) => {
					return reaction.emoji.name === pushIcon && user.id === triggeringMessage.author.id;
				};
				const collector = rollMessage.createReactionCollector(filter, { time: Config.commands.roll.pushCooldown });

				// LISTENER on COLLECT.
				collector.on('collect', (reaction, reactionCollector) => {
					if (!roll.isFullAuto) reactionCollector.stop();

					const pushedRoll = roll.push();
					console.log('[ROLL] - Roll pushed:', pushedRoll.toString());

					if (!rollMessage.deleted) rollMessage.edit(getDiceEmojis(pushedRoll), { embed: getEmbedDiceResults(pushedRoll, triggeringMessage) });
				});

				// LISTENER on END.
				collector.on('end', () => {
					try {
						if (!rollMessage.deleted && rollMessage.channel.type === 'text') {
							rollMessage.clearReactions(reaction => {
								return reaction.emoji.name === pushIcon;
							});
						}
					}
					catch (error) {
						console.error(error);
					}
				});
			}
		})
		.catch(error => {
			console.error('[ERROR] - Reaction rejected', error);
		});
}//*/

/**
 * Returns a text with all the dice turned into emojis.
 * @param {YZRoll} roll The roll
 * @param {Object} opts Options of the roll command
 * @returns {string} The manufactured text
 */
function getDiceEmojis(roll, opts) {
	const game = roll.game;
	let str = '';

	for (const type in roll.dice) {
		let iconType = type;
		const nbre = roll.dice[type].length;

		if (opts.alias) {
			for (const key in opts.alias) {
				if (opts.alias.hasOwnProperty(key) && iconType === key) {
					iconType = opts.alias[key];
				}
			}
		}

		if (nbre) {
			str += '\n';

			for (let k = 0; k < nbre; k++) {
				const val = roll.dice[type][k];
				const icon = Config.icons[game][iconType][val];
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

	let desc = `Success${s > 1 ? 'es' : ''}: **${s}**`;

	if (opts.condition) {
		const n = roll.pushed;
		desc += `\nCondition${n > 1 ? 's' : ''}: **${n}**`;
	}
	if (opts.trauma) {
		const n = roll.attributeTrauma;
		desc += `\nTrauma${n > 1 ? 's' : ''}: **${n}**`;
	}
	if (opts.gearDamage) {
		desc += `\nGear Damage: **${roll.gearDamage}**`;
	}

	const embed = new YZEmbed(roll.title, desc, message, true);

	if (roll.pushed) embed.setFooter(`${(roll.pushed > 1) ? `${roll.pushed}x ` : ''}Pushed`);

	return embed;
}

/**
 * Returns a text for the Artifact Die.
 * @param {YZRoll.ArtifactDie} artifactDie The 'artifactDie' object from a 'Roll' object
 * @returns {string} The manufactured text
 *
function getTextForArtifactDieResult(artifactDie) {
	const val = artifactDie.result;
	const succ = artifactDie.success;
	let str = `\n**\`D${artifactDie.size}\`** Artifact Die = (${val}) = `;
	// let str = `\n**\`D${artifactDie.size}\`** Artifact Die: ${Config.icons.myz.arto[val]} = `;

	if (succ) {
		str += `${'☢'.repeat(succ)}`;
	}
	else {
		str += '*no success*';
	}

	return str;
}//*/

/**
 * Gets the game played (used for the dice icons set).
 * @param {string} arg The phrase (one word) used to identify the game played
 * @param {Discord.Message} message Discord message
 * @param {Discord.Client} client Discord client (the bot)
 * @returns {string}
 */
async function getGame(arg, message, client) {
	let game;
	if (client.config.supportedGames.includes(arg)) {
		game = arg;
	}
	// If no game was specified in the arguments, gets the default from the database.
	else if (message.channel.type != 'dm') {
		const defaultGame = await db.get(message.guild.id, 'game');
		if (defaultGame) game = defaultGame;
	}
	// Default is MYZ (mutant).
	else {
		game = 'myz';
	}
	return game;
}









/**
 * Sends an embed message with D6s calculation result.
 * @param {YZRoll} roll The roll
 * @param {Discord.Message} message The triggering message
 * @param {string} method "ADD" or "BASESIX"
 */
function sendMessageForD6(roll, message, method) {
	if (roll.size > Config.commands.roll.max) return message.reply('Can\'t roll that, too many dice!');

	const customEmojis = Config.icons.myz.base;

	let diceReply = '';
	for (const value of roll.dice.base) diceReply += customEmojis[value];

	let desc = 'Result: **';
	if (method === 'ADD') desc += roll.sum();
	else if (method === 'BASESIX') desc += roll.baseSix();
	else desc += 0;
	desc += '**';

	const embed = new YZEmbed(roll.title, desc, message, true);

	message.channel.send(diceReply, embed);
}

function sendMessageForResourceDie(roll, message) {
	if (roll.size > Config.commands.roll.max) return message.reply('Can\'t roll that, too many dice!');

	const desc = `**\`D${roll.artifactDie.size}\`** Resource Die = (${roll.artifactDie.result})`;

	const embed = new YZEmbed(roll.title, desc, message, true);

	if (roll.hasLostResourceStep()) {
		const resSizes = [0, 6, 8, 10, 12];
		const newSize = resSizes[resSizes.indexOf(roll.artifactDie.size) - 1];

		if (newSize > 0) {
			embed.addField(
				'⬇ Decreased',
				`One unit is used. The Resource Die is decreased one step to a **\`D${newSize}\`**.`
			);
		}
		else {
			embed.addField(
				'🚫 Exhausted',
				'The consumable is fully depleted.'
			);
		}
	}

	message.channel.send(embed);
}