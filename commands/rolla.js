const Config = require('../config.json');
const Util = require('../util/Util');
const YZRoll = require('../util/YZRoll');
const YZEmbed = require('../util/YZEmbed');
const PanicCommand = require('./panic');
const { RollParser } = require('../util/RollParser');

const ARTIFACT_DIE_REGEX = /^d(6|8|10|12)$/i;

module.exports = {
	name: 'rolla',
	description: 'Rolls dice for the *ALIEN* roleplaying game.'
		+ ` Max ${Config.commands.roll.max} dice can be rolled at once. If you try to roll more, it won't happen.`,
	moreDescriptions: [
		[
			'Single Dice',
			'`rolla d6|d66|d666 [name]` – Rolls a D6, D66, or D666.'
			+ '\n`rolla Xd [name]` – Rolls X D6 and sums their results.'
			+ '\n`rolla res|supply <rating> [name]` – Rolls for a supply.'
			+ '\n`rolla init [bonus]` – Rolls initiative with or without a bonus',
		],
		[
			'Pool of Dice',
			'`rolla [Xb][Ys] [Artifact Die] [name] [--fullauto]` – Rolls a pool of dice following the rules of ALIEN-rpg:'
			+ '\n• `X b` – Rolls X base dice (black color).'
			+ '\n• `Y s` – Rolls Y stress dice (yellow color).'
			+ '\n• `Artifact Die` – Rolls an Artifact Die (`d6|d8|d10|d12`), adapted from *Forbidden Lands*.'
			+ '\n• `--fullauto` – Allows unlimited pushes.'
			+ '\n\n*Example:* `rolla 8b3s` *rolls for 8 base and 3 stress dice.*',
		],
		[
			'Pushing',
			`To push the roll, click the ${Config.commands.roll.pushIcon} reaction icon below the message.`
			+ ' Only the user who initially rolled the dice can push them.'
			+ `\nPushing is available for ${Config.commands.roll.pushCooldown / 1000} seconds.`
			+ ' Four spaces separates the keeped dice from the new rolled ones.',
		],
	],
	aliases: ['ra', 'lancea', 'lancera', 'slåa', 'slaa'],
	guildOnly: false,
	args: true,
	usage: '<dice>',
	execute(args, message) {
		const rollArgument = args.shift();

		// Exits early if no argument.
		// Though, this check isn't really necessary as "command.args = true".
		if (!rollArgument.length) return message.reply(`I don't understand the command. Try \`${Config.defaultPrefix}help rolla\`.`);

		if (/^(\d{1,2}[bs]){1,4}$/i.test(rollArgument)) {
			const diceArguments = rollArgument.match(/\d{1,2}[bs]/gi);

			if (diceArguments.length) {
				let baseDiceQty = 0, stressDiceQty = 0;
				let artifactDieSize = 0;

				for (const dieArg of diceArguments) {
					const dieTypeChar = dieArg.slice(-1).toLowerCase();
					const diceQty = Number(dieArg.slice(0, -1)) || 0;
					switch (dieTypeChar) {
					case 'b': baseDiceQty = diceQty; break;
					case 's': stressDiceQty = diceQty; break;
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
						skill: baseDiceQty,
						stress: stressDiceQty,
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
			const initDie = Config.icons.alien.skill[initRoll];

			let desc = `Initiative: ${initDie}`;
			if (initBonus) desc += ` ${(initBonus >= 0) ? '+' : ''}${initBonus} = **${initTotal}**`;
			const embed = new YZEmbed(null, desc, message, true);

			return message.channel.send(embed);
		}
		// Resource Die.
		else if (rollArgument === 'res' || rollArgument === 'supply') {
			const resQty = args.shift();

			if (Util.isNumber(resQty)) {
				const resTitle = args.join(' ');
				const roll = new YZRoll(message.author.id, { stress: resQty }, resTitle);
				sendMessageForResourceRoll(roll, message);
			}
			else {
				message.reply(`This Supply Roll is not possible. Try \`${Config.defaultPrefix}rolla res <rating> [name]\``);
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
			message.reply(`I don't understand the command. Try \`${Config.defaultPrefix}help rolla\`.`);
		}
	},
};

/**
 * Sends a message with the roll results.
 * @param {YZRoll} roll The roll
 * @param {Discord.Message} triggeringMessage The triggering message
 */
function sendMessageForRollResults(roll, triggeringMessage) {
	if (roll.size > Config.commands.roll.max) return triggeringMessage.reply('Can\'t roll that, too many dice!');

	triggeringMessage.channel.send(getDiceEmojis(roll), getEmbedDiceResults(roll, triggeringMessage))
		.then(rollMessage => {
			// Detects PANIC.
			if (roll.panic) {
				return PanicCommand.execute([roll.stress], triggeringMessage);
			}
			else if (!roll.pushed || roll.isFullAuto) {
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
					// Additional stress die from pushing.
					pushedRoll.addStressDice(1);
					console.log('[ROLL] - ', pushedRoll.toString());

					if (!rollMessage.deleted) {
						rollMessage.edit(getDiceEmojis(pushedRoll), { embed: getEmbedDiceResults(pushedRoll, triggeringMessage) });
					}

					// Detects PANIC.
					if (roll.panic) {
						reactionCollector.stop();
						return PanicCommand.execute([pushedRoll.stress], triggeringMessage);
					}
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
}

/**
 * Returns a text with all the dice turned into emojis.
 * @param {YZRoll} roll The roll
 * @returns {string} The manufactured text
 */
function getDiceEmojis(roll) {
	let str = '';

	for (const type in roll.dice) {
		const nbre = roll.dice[type].length;

		if (nbre) {
			str += '\n';

			for (let k = 0; k < nbre; k++) {
				const val = roll.dice[type][k];
				const icon = Config.icons.alien[type][val];
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

	if (roll.artifactDie.size) {
		str += getTextForArtifactDieResult(roll.artifactDie);
	}

	return str;
}

/**
 * Gets an Embed with the dice results and the author's name.
 * @param {YZRoll} roll The 'Roll' Object
 * @param {Discord.Message} message The triggering message
 * @returns {Discord.RichEmbed} A Discord Embed Object
 */
function getEmbedDiceResults(roll, message) {
	const desc = `Successes: **${roll.sixes}**${roll.panic ? '\n**PANIC!!!**' : ''}`;
	const embed = new YZEmbed(roll.title, desc, message, true);
	if (roll.pushed) embed.setFooter(`${(roll.pushed > 1) ? `${roll.pushed}x ` : ''}Pushed`);
	return embed;
}

/**
 * Returns a text for the Artifact Die.
 * @param {YZRoll.ArtifactDie} artifactDie The 'artifactDie' object from a 'Roll' object
 * @returns {string} The manufactured text
 */
function getTextForArtifactDieResult(artifactDie) {
	const val = artifactDie.result;
	const succ = artifactDie.success;
	let str = `\n**\`D${artifactDie.size}\`** Artifact Die = (${val}) = `;

	if (succ) {
		str += `${'💠'.repeat(succ)}`;
	}
	else {
		str += '*no success*';
	}

	return str;
}

/**
 * Sends an embed message with D6s calculation result.
 * @param {YZRoll} roll The roll
 * @param {Discord.Message} message The triggering message
 * @param {string} method "ADD" or "BASESIX"
 */
function sendMessageForD6(roll, message, method) {
	if (roll.size > Config.commands.roll.max) return message.reply('Can\'t roll that, too many dice!');

	const customEmojis = Config.icons.alien.stress;

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

function sendMessageForResourceRoll(roll, message) {
	if (roll.size > Config.commands.roll.max) return message.reply('Can\'t roll that, too many dice!');

	const resRating = roll.stress;
	const newRating = resRating - roll.panic;

	const text = getDiceEmojis(roll);
	const embed = new YZEmbed(`**${roll.title.toUpperCase()}** (${resRating})`, null, message, true);

	if (resRating === newRating) {
		embed.addField(
			'✅ Unchanged',
			`The supply didn't decrease.\nRating: **${newRating}**`
		);
	}
	else if (newRating > 0) {
		embed.addField(
			'⬇ Decreased',
			`The supply is decreased ${roll.panic} step${roll.panic > 1 ? 's' : ''}.\nNew rating: **${newRating}**`
		);
	}
	else {
		embed.addField(
			'🚫 Exhausted',
			'The consumable is fully depleted.\tRating: **0**'
		);
	}

	message.channel.send(text, embed);
}