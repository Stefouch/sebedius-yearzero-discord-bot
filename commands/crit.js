const { getTable } = require('../Sebedius');
const { isNumber, rollD66, sumD6 } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const { SUPPORTED_GAMES, DICE_ICONS, SOURCE_MAP } = require('../utils/constants');

const availableCritTables = {
	myz: { damage: true, horror: 'fbl', pushed: true, nontypical: true },
	fbl: { slash: true, blunt: true, stab: true, horror: true, pushed: 'myz', nontypical: 'myz' },
	alien: { damage: true, mental: true, synthetic: true, xeno: true },
};

const critTypeAliases = {
	nontypical: ['nt'],
	pushed: ['p'],
	damage: ['dmg'],
	slash: ['sl'],
	blunt: ['bl'],
	stab: ['st'],
	horror: ['h'],
	synthetic: ['s', 'synth'],
	xeno: ['x'],
	mental: ['m'],
};

module.exports = {
	name: 'crit',
	category: 'common',
	description: 'Rolls for a random critical injury. Use the `-private` argument to send the result in a DM.',
	moreDescriptions: [
		[
			'Arguments',
			'There are three main arguments you can use with this command in any order:'
			+ '\n• `game` – Specifies the game you are using. Can be omitted if you set it with `!setconf game [default game]`.'
			+ `\n> Choices: \`${SUPPORTED_GAMES.join('`, `')}\`.`
			+ '\n• `table` – Specifies the table you want from this game. See below for possible options *(default is "damage")*.'
			+ '\n• `numeric` – Specifies a fixed reference.',
		],
		[
			'☢️ Mutant: Year Zero',
			'• `dmg` | `damage` : Critical injuries from damage.'
			+ '\n• `h` | `horror` : The *Forbidden Lands* Horror traumas, adapted for MYZ.'
			+ '\n• `nt` | `nontypical` : Critical injury for non-typical damage.'
			+ '\n• `p` | `pushed` : Critical injury for pushed damage (none).',
		],
		[
			'⚔️ Forbidden Lands',
			'• `sl` | `slash` : Critical injuries due to Slash wounds.'
			+ '\n• `bl` | `blunt` : Critical injuries due to Blunt force.'
			+ '\n• `st` | `stab` : Critical injuries due to Stab wounds.'
			+ '\n• `h` | `horror` : Horror traumas.'
			+ '\n• `nt` | `nontypical` : Critical injury for non-typical damage.'
			+ '\n• `p` | `pushed` : Critical injury for pushed damage (none).',
		],
		[
			'👾 ALIEN',
			'• `dmg` | `damage` : Critical injuries from damage.'
			+ '\n• `s`, `synth` | `synthetic` : Critical injuries on Synthetics and Androids.'
			+ '\n• `x` | `xeno` : Critical injuries for Xenomorphs.'
			+ '\n• `m` | `mental` : Permanent mental traumas.',
		],
	],
	aliases: ['crits', 'critic', 'critical'],
	guildOnly: false,
	args: false,
	usage: '[game] [table] [numeric] [-private|-p]',
	async run(args, ctx) {
		// Exits early if too many arguments
		if (args.length > 4) return await ctx.reply('⚠️ You typed too many arguments! See `help crit` for the correct usage.');

		// Parsing arguments.
		let game, type, fixedReference, privacy = false;
		for (const arg of args) {
			// Checks privacy.
			if (!privacy && (arg === '-private' || arg === '-p')) {
				privacy = true;
			}
			// Checks and sets any fixed reference.
			else if (!fixedReference && isNumber(arg)) {
				fixedReference = +arg;
			}
			// Checks and sets the game.
			else if (!game && SUPPORTED_GAMES.includes(arg)) {
				game = arg;
			}
			// If it's neither, it should be the critic's type.
			else if (!type) {
				for (const key in critTypeAliases) {
					if (arg === key) {
						type = arg;
						console.log('   • arg=key', type);
						break;
					}
					else if (critTypeAliases[key].includes(arg)) {
						type = key;
						console.log('   • arg=alias', type);
						break;
					}
				}
			}
			else {
				console.warn(`   • Unknown argument: ${arg}`);
			}
		}
		// Defaults.
		if (!game) game = await ctx.bot.getGame(ctx, 'myz');
		if (!type) type = 'damage';

		// Aborts if the table doesn't exist.
		if (!availableCritTables.hasOwnProperty(game)) {
			return ctx.reply(`ℹ️ There is no critical table for the \`${game}\` roleplaying game in my database.`);
		}
		if (!availableCritTables[game].hasOwnProperty(type)) {
			return ctx.reply(`ℹ️ There is no \`${type}\` critical table for **${SOURCE_MAP[game]}**.`);
		}

		// Table swap.
		if (typeof availableCritTables[game][type] === 'string') {
			game = availableCritTables[game][type];
		}

		// Gets the Critical Injuries table.
		const fileName = `crits-${game}-${type}`;
		const critsTable = getTable('CRIT', './gamedata/crits/', fileName);
		// console.log(critsTable);

		// Aborts if the table couldn't be retrieved.
		if (!critsTable) return ctx.reply('❌ An error occured: `null critsTable`.');
		if (critsTable.size === 0) return ctx.reply('❌ An error occured: `critsTable size 0`.');

		// Rolls the Critical Injuries table.
		const critRoll = fixedReference || rollD66();
		const crit = critsTable.get(critRoll);

		// Exits early if no critical injury was found.
		if (!crit) return ctx.reply(`❌ The critical injury wasn't found. *(Table: ${fileName})*`);

		// Gets the values of each D66's dice.
		let die1 = 0, die2 = 0;
		if (critRoll) {
			die1 = Math.floor(critRoll / 10);
			die2 = critRoll % 10;
		}
		// Gets the emojis references.
		const dieType = ctx.bot.config.commands.roll.options[game].hasBlankDice ? 'alien' : game;
		const icon1 = DICE_ICONS[dieType].skill[die1] || '';
		const icon2 = DICE_ICONS[dieType].skill[die2] || '';

		// Sends the message.
		if (privacy) {
			return await ctx.author.send(icon1 + icon2, getEmbedCrit(crit, fileName, ctx));
		}
		return await ctx.send(icon1 + icon2, getEmbedCrit(crit, fileName, ctx))
			.then(() => {
				if (crit.fatal) {
					// Sends a coffin emoticon.
					setTimeout(() => {
						ctx.send('🪦');
					}, rollD66() * 150);
				}
			})
			.catch(error => {
				console.error('[ERROR] - [CRIT] - Cannot send the coffin emoji', error);
			});
	},
};

/**
 * Gets the details for a critical injury.
 * @param {Object} crit Object containing all infos for the critical injury
 * @param {string} name The name of the critical table
 * @param {Discord.Message} ctx The triggering message with context
 * @returns {YZEmbed} A rich embed
 */
function getEmbedCrit(crit, name, ctx) {
	const embed = new YZEmbed(`**${crit.injury}**`, crit.effect, ctx, true);

	if (crit.healingTime) {
		let title, text;

		// -1 means permanent effect.
		if (crit.healingTime === -1) {
			title = 'Permanent';
			text = 'These effects are permanent.';
		}
		else {
			title = 'Healing Time';
			text = `${sumD6(crit.healingTime)} days until end of effects.`;
		}
		embed.addField(title, text, false);
	}

	if (crit.lethal) {
		let text = '';

		if (crit.timeLimit) {
			text = '⚠ This critical injury is **LETHAL** and must be HEALED';

			if (crit.healMalus) {
				text += ` (modified by **${crit.healMalus}**)`;
			}

			if (/s$/.test(crit.timeLimitUnit)) {
				text += ` within the next **${sumD6(crit.timeLimit)} ${crit.timeLimitUnit}**`;
			}
			else {
				text += ` within **one ${crit.timeLimitUnit}**`;
			}
			text += ' or the character will die.';
		}
		else {
			text += '💀💀💀';
		}
		embed.addField('Lethality', text, false);
	}
	embed.setFooter(`Table: ${name}`);

	return embed;
}