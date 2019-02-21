const Config = require('../config.json');
const YZRoll = require('../utils/YZRoll.js');
const { RichEmbed } = require('discord.js');

module.exports = {
	name: 'roll',
	description: getCommandDescription(),
	aliases: ['rolls', 'r', 'lance', 'lancer', 'slå', 'sla'],
	guildOnly: false,
	args: true,
	usage: '<dice> [name]',
	execute(args, message) {
		const rollArgument = args.shift();

		if (rollArgument.length) {

			if (/^(\d{1,2}[bsga]){1,4}$/i.test(rollArgument)) {
				const diceArguments = rollArgument.match(/\d{1,2}[bsga]/gi);

				if (diceArguments.length) {
					let baseDiceQty = 0, skillDiceQty = 0, gearDiceQty = 0, artifactDieSize = 0;

					for (const dieArg of diceArguments) {
						const dieType = dieArg.slice(-1).toLowerCase();
						const diceQty = Math.min(Number(dieArg.slice(0, -1)) || 0, Config.commands.roll.max);
						switch (dieType) {
						case 'b': baseDiceQty = diceQty; break;
						case 's': skillDiceQty = diceQty; break;
						case 'g': gearDiceQty = diceQty; break;
						case 'a': artifactDieSize = Math.min(diceQty, 12); break;
						}
					}

					// Rolls the dice.
					const rollTitle = args.join(' ').replace('--', '–');
					const roll = new YZRoll(message.author.id, baseDiceQty, skillDiceQty, gearDiceQty, artifactDieSize, rollTitle);

					if (args.includes('--fullauto')) roll.setFullAuto(true);

					console.log('[ROLL] - Rolled:', roll);

					sendMessageForRollResults(roll, message);
				}
			// checks d666 or d66 or d6.
			}
			else if (/^d666$/i.test(rollArgument)) {
				const rollTitle = args.join(' ');
				const roll = new YZRoll(message.author.id, 3, 0, 0, 0, rollTitle);
				sendMessageForD6(roll, message, 'BASESIX');
			}
			else if (/^d66$/i.test(rollArgument)) {
				const rollTitle = args.join(' ');
				const roll = new YZRoll(message.author.id, 2, 0, 0, 0, rollTitle);
				sendMessageForD6(roll, message, 'BASESIX');
			}
			else if (/^d6$/i.test(rollArgument)) {
				const rollTitle = args.join(' ');
				const roll = new YZRoll(message.author.id, 1, 0, 0, 0, rollTitle);
				sendMessageForD6(roll, message, 'BASESIX');
			}
			else if (/^\d+d6?$/i.test(rollArgument)) {
				const rollTitle = args.join(' ');
				const nb = Math.min(rollArgument.match(/(^\d+)/).pop(), Config.commands.roll.max);
				const roll = new YZRoll(message.author.id, nb, 0, 0, 0, rollTitle);
				sendMessageForD6(roll, message, 'ADD');
			}
			// Resource Die.
			else if (rollArgument === 'res') {
				const resourceDie = args.shift();

				if (/^d(6|8|10|12)$/i.test(resourceDie)) {
					const size = resourceDie.match(/(6|8|10|12)/).pop();
					const resTitle = args.join(' ');
					const roll = new YZRoll(message.author.id, 0, 0, 0, size, resTitle);
					sendMessageForResourceDie(roll, message);
				}
				else {
					message.reply('This Resource Die is not possible.');
				}
			}
			else {
				message.reply(`I don't understand the command. Try \`${Config.defaultPrefix}help roll\`.`);
			}
		}
		else {
			message.reply(`I don't understand the command. Try \`${Config.defaultPrefix}help roll\`.`);
		}
	},
};

/**
 * Detailed description of the command.
 * @returns {string} The command's detailed description
 */
function getCommandDescription() {
	let desc = 'This command rolls dice for the Mutant: Year Zero roleplaying game. See possible outcome:';
	desc += `\n\`${Config.defaultPrefix}roll d6|d66|d666 [name]\`: Rolls a D6, D66, or D666 for MYZ.`;
	desc += `\n\`${Config.defaultPrefix}roll Xd|Xd6 [name]\`: Rolls X D6 and sums their results.`;
	desc += `\n\`${Config.defaultPrefix}roll res d6|d8|d10|d12 [name]\`: Rolls a Resource Die.`;
	desc += `\n\`${Config.defaultPrefix}roll [Wb][Xs][Yg][Za] [name]\`: Rolls a pool of dice following the rules of MYZ:`;
	desc += '\n• `[Wb]`: Rolls W base dice (yellow color).';
	desc += '\n• `[Xs]`: Rolls X skill dice (green color).';
	desc += '\n• `[Yg]`: Rolls Y gear dice (black color).';
	desc += '\n• `[Za]`: Rolls an Artifact Die with Z faces, adapted from *Forbidden Lands*.';
	desc += `\n   *(e.g.* \`${Config.defaultPrefix}roll 5b3s2g\` *rolls for 5 base, 3 skill and 2 gear dice.)*`;
	desc += `\nTo push the roll, click the ${Config.commands.roll.pushIcon} reaction icon below the message.`;
	desc += ' Only the roller can push their dice.';
	desc += '\nThe option `--fullauto` allows for unlimited pushes.';
	desc += `\nPushing is available for ${Config.commands.roll.pushCooldown / 1000} seconds.`;
	desc += ` Max ${Config.commands.roll.max} dice per type can be rolled at once. If you try to roll more, it won't happen.`;
	desc += ' Four spaces separates the keeped dice from the new rolled ones.';
	return desc;
}

/**
 * Sends a message with the roll results.
 * @param {YZRoll} roll The roll
 * @param {Discord.Message} triggeringMessage The triggering message
 */
function sendMessageForRollResults(roll, triggeringMessage) {
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
					console.log('[ROLL] - [ReactionCollector] - Roll pushed.');

					if (!roll.isFullAuto) reactionCollector.stop();

					const pushedRoll = roll.push();
					console.log('[ROLL] - Roll pushed:', pushedRoll);

					if (!rollMessage.deleted) rollMessage.edit(getDiceEmojis(pushedRoll), { embed: getEmbedDiceResults(pushedRoll, triggeringMessage) });
				});

				// LISTENER on END.
				collector.on('end', () => {
					try {
						if (!rollMessage.deleted) {
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
				const icon = Config.icons.myz[type][val];
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
	const authorColor = (message.channel.type === 'text') ? message.member.colorRole.color : 0x1AA29B;
	const embed = new RichEmbed({
		color: authorColor,
		title: roll.title,
		author: {
			name: message.author.username,
			icon_url: message.author.avatarURL,
		},
		description: `Successes: **${roll.sixes}**\nTraumas: **${roll.attributeTrauma}**\nGear damage: **${roll.gearDamage}**`,
	});
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
		str += `${'☢'.repeat(succ)}`;
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
	const customEmojis = Config.icons.myz.base;

	let diceReply = '';
	for (const value of roll.dice.base) diceReply += customEmojis[value];

	let desc = 'Result: **';
	if (method === 'ADD') desc += roll.sum();
	else if (method === 'BASESIX') desc += roll.baseSix();
	else desc += 0;
	desc += '**';

	const authorColor = (message.channel.type === 'text') ? message.member.colorRole.color : 0x1AA29B;
	const embed = new RichEmbed({
		color: authorColor,
		title: roll.title,
		author: {
			name: message.author.username,
			icon_url: message.author.avatarURL,
		},
		description: desc,
	});

	message.channel.send(diceReply, embed);
}

function sendMessageForResourceDie(roll, message) {
	const desc = `**\`D${roll.artifactDie.size}\`** Resource Die = (${roll.artifactDie.result})`;

	const authorColor = (message.channel.type === 'text') ? message.member.colorRole.color : 0x1AA29B;
	const embed = new RichEmbed({
		color: authorColor,
		title: roll.title,
		author: {
			name: message.author.username,
			icon_url: message.author.avatarURL,
		},
		description: desc,
	});

	if (roll.hasLostResourceStep()) {
		const resSizes = [0, 6, 8, 10, 12];
		const newSize = resSizes[resSizes.indexOf(roll.artifactDie.size) - 1];

		if (newSize > 0) {
			embed.addField(
				'Decreased',
				`One unit is used. The Resource Die is decreased one step to a **\`D${newSize}\`**.`
			);
		}
		else {
			embed.addField(
				'Exhausted',
				'The consumable is fully depleted.'
			);
		}
	}

	message.channel.send(embed);
}