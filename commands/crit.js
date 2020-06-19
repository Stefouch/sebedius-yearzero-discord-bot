const Util = require('../util/Util');
const YZEmbed = require('../util/YZEmbed');
const { getGame, getTable } = require('../util/SebediusTools');

module.exports = {
	name: 'crit',
	description: 'Rolls for a random critical injury. You may specify a table or a numeric value.'
		+ ' The default is the damage from MYZ table. Other available tables are:'
		+ '\n• `nt` or `nontypical` : Critical injury for non-typical damage.'
		+ '\n• `sl` or `slash` : The *Forbidden Lands* Critical injuries due to Slash wounds.'
		+ '\n• `bl` or `blunt` : The *Forbidden Lands* Critical injuries due to Blunt force.'
		+ '\n• `st` or `stab` : The *Forbidden Lands* Critical injuries due to Stab wounds.'
		+ '\n• `h` or `horror` : The *Forbidden Lands* Horror traumas, adapted for MYZ.'
		+ '\n• `a` or `alien` : The *ALIEN* Critical injuries.'
		+ '\n• `s` or `synth` : The *ALIEN* Critical injuries on Synthetics and Androids.'
		+ '\n• `x` or `xeno` : The *ALIEN* Critical injuries on Xenomorphs.'
		+ '\n• `m` or `mental` : The *ALIEN* Permanent Mental traumas.'
		+ '\n• `pushed` : Critical injury for pushed damage (none).',
	aliases: ['ci', 'crits', 'critic', 'critical'],
	guildOnly: false,
	args: false,	usage: '[nt | sl | bl | st | h | a | s | x | m | pushed] [numeric]',
	async execute(args, message, client) {
		const types = {
			nontypical: ['nt'],
			damage: ['dmg'],
			slash: ['sl'],
			blunt: ['bl'],
			stab: ['sb'],
			horror: ['h'],
			synth: ['s'],
			xeno: ['x'],
			mental: ['m'],
		};
		// Parsing arguments.
		// See https://www.npmjs.com/package/yargs-parser#api for details.
		const critargv = require('yargs-parser')(args, {
			alias: { ...types, ...{ result: ['r'] } },
			boolean: ['nontypical'],
			number: ['result'],
			configuration: client.config.yargs,
		});
		console.log(critargv);

		// Sets the game.
		let game;
		if (client.config.supportedGames.includes(critargv._[0])) {
			game = await getGame(critargv._.shift(), message, client);
		}
		else {
			game = client.config.supportedGames[0];
		}

		// Sets the type of criticals.
		let type = 'damage';
		for (const key in critargv) {
			if (types.hasOwnProperty(key)) {
				type = key;
				break;
			}
		}

		// Gets the Critical Injuries table.
		const fileName = `crits-${game}-${type}`;
		const critsTable = await getTable('./data/crits', fileName);
		console.log(critsTable);

		// Aborts if the table couldn't be retrieved.
		if (!critsTable) return message.reply('💀 I\'m sorry, I\'ve been killed by the critical! (An error occured: `nul critsTable`.)');
		if (critsTable.size === 0) return message.reply('💀 I\'m sorry, I\'ve been killed by the critical! (An error occured: `critsTable size 0`.)');

		// Rolls the Critical Injuries table.
		const critRoll = Util.rollD66();
		const crit = critsTable.get(critRoll);
		console.log(crit);

		// Exits early if no critical injury was found.
		if (!crit) return message.reply('❌ The critical injury wasn\'t found.');

		// Builds and sends the message.
		let die1 = 0, die2 = 0;
		if (critRoll) {
			die1 = Math.floor(critRoll / 10);
			die2 = critRoll % 10;
		}
		const icon1 = client.config.icons.alien.skill[die1] || '';
		const icon2 = client.config.icons.alien.skill[die2] || '';

		return message.channel.send(icon1 + icon2, getEmbedCrit(crit, message))
			.then(() => {
				if (crit.fatal) {
					// Sends a coffin emoticon.
					setTimeout(() => {
						message.channel.send('⚰');
					}, Util.rollD66() * 150);
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
 * @param {Discord.Message} message The triggering message
 * @returns {YZEmbed} A rich embed
 */
function getEmbedCrit(crit, message) {
	const embed = new YZEmbed(`**${crit.injury}**`, crit.effect, message, true);

	if (crit.healingTime) {
		let title, text;

		// -1 means permanent effect.
		if (crit.healingTime === -1) {
			title = 'Permanent';
			text = 'These effects are permanent.';
		}
		else {
			title = 'Healing Time';
			text = `${Util.sumD6(crit.healingTime)} days until end of effects.`;
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
				text += ` within the next **${Util.sumD6(crit.timeLimit)} ${crit.timeLimitUnit}**`;
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

	return embed;
}