const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const RollTable = require('../utils/RollTable');
const ReactionMenu = require('../utils/ReactionMenu');
const { YZEmbed, YZMonsterEmbed } = require('../utils/embeds');
const { SUPPORTED_GAMES } = require('../utils/constants');
const YZMonster = require('../yearzero/YZMonster');
const YZRoll = require('../yearzero/YZRoll');

module.exports = {
	name: 'attack',
	group: 'Core',
	description: 'Rolls a random attack from a monster',
	aliases: ['atk', 'atq'],
	guildOnly: false,
	args: true,
	usage: '[game] <monster name> [number] [-private|-p]',
	async execute(args, ctx) {
		const { monster, argv } = await ctx.bot.commands.get('monster').parse(args, ctx);
		const ref = argv.attack;
		const successIcon = ctx.bot.config.commands.roll.options[monster.game].successIcon || 'success';
		const attack = monster.attack(ref);
		const effect = attack.effect
			.replace(/{prefix}/gi, ctx.prefix)
			.replace(/{success}/gi, successIcon)
			.replace(/\\n/g, '\n');

		// Creates the Embed.
		const embed = new YZEmbed(
			`:crossed_swords: **${monster.name}**'s Attack`,
			`${attack.name ? `**${attack.name}:** ` : ''} ${effect}`,
		);
		// Sets the footer of the embed (roll reference).
		let footer;
		if (monster.attacks instanceof RollTable) {
			footer = `(${ref ? ref : attack.ref}) → ${monster.attacks.name.split('.')[0]}`;
		}
		else if (ref) {
			footer = `(${ref})`;
		}
		if (footer) embed.setFooter(footer);

		// Sends the message.
		let message;
		if (argv.private) message = await ctx.author.send(embed);
		else message = await ctx.channel.send(embed);

		// Adds a Reaction Menu to roll the dice of the attack.
		if (attack.base || attack.damage || attack.crit) {
			const reactions = [];
			if (attack.base || attack.damage) {
				reactions.push({
					icon: '⚔️',
					owner: ctx.author.id,
					fn: () => rollAttack(attack, monster.game, message, ctx.bot),
				});
			}
			if (attack.crit) {
				const [num, table] = attack.crit.split(' ');
				reactions.push({
					icon: '☠️',
					owner: ctx.author.id,
					fn: () => rollCrit(monster.game, table, num, ctx),
				});
			}
			reactions.push({
				icon: '❌',
				owner: ctx.author.id,
				fn: collector => collector.stop(),
			});
			const cooldown = ctx.bot.config.commands.roll.pushCooldown;
			const rm = new ReactionMenu(message, ctx.bot, cooldown, reactions);
		}
	},
};

/**
 * Rolls the dice of an attack.
 * @param {YZAttack} attack A Year Zero attack
 * @param {string} game The code of the game used
 * @param {Discord.Message} message Discord message
 * @param {Discord.Client} bot The bot's client
 * @async
 */
async function rollAttack(attack, game, message, bot) {
	// Rolls the attack.
	const atkRoll = new YZRoll(
		message.author,
		{ base: attack.base },
	);
	atkRoll.setGame(game);

	// Calculates damages.
	const hit = atkRoll.sixes;
	let damage;
	// No damage if undefined
	if (attack.damage == undefined || attack.damage == null) {
		damage = 0;
	}
	// Fixed damage
	else if (/{\d*}/.test(attack.damage)) {
		damage = +attack.damage.replace(/{(\d*)}/, (match, p1) => p1);
	}
	// Regular damage
	else {
		damage = +attack.damage + hit - 1;
	}

	// Sends the message.
	await message.channel.send(
		Sebedius.emojifyRoll(atkRoll, bot.config.commands.roll.options[game], true),
		damage
			? new YZEmbed(`Damage × ${damage}`, ':boom:'.repeat(damage))
			: new YZEmbed(`Success${hit > 1 ? 'es' : ''}`, `**${hit}**`),
	);
}

/**
 * Rolls a crit of an attack.
 * @param {string} game The code of the game used
 * @param {?string} table Crit damage type
 * @param {?number} num The reference of the crit, if any
 * @param {Discord.Message} ctx Discord message with context
 * @async
 */
async function rollCrit(game, table, num, ctx) {
	return await ctx.bot.commands.get('crit').execute([game, table, num], ctx);
}