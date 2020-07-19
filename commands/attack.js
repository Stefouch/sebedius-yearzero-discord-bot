const Sebedius = require('../Sebedius');
const RollTable = require('../utils/RollTable');
const ReactionMenu = require('../utils/ReactionMenu');
const { YZEmbed } = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');
const Util = require('../utils/Util');

module.exports = {
	name: 'attack',
	group: 'Core',
	description: 'Rolls a random attack from a monster.',
	moreDescriptions: [
		[
			'Arguments',
			`• \`game\` – Specifies the game you are using. Can be omitted.
			• \`name\` – Specifies the monster you want to fetch.
			• \`number\` – Specifies the desired attack instead of choosing a random one.
			• \`-private|-p\` – Sends the message in a private DM.`,
		],
	],
	aliases: ['atk', 'atq'],
	guildOnly: false,
	args: true,
	usage: '[game] <monster name> [number] [-private|-p]',
	async execute(args, ctx) {
		const { monster, argv } = await ctx.bot.commands.get('monster').parse(args, ctx);
		const ref = Util.isNumber(argv.attack) ? argv.attack : null;
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
			let refStr;
			if (typeof ref === 'string' && (ref.startsWith('+') || ref.startsWith('-'))) {
				refStr = `${attack.ref} (${ref})`;
			}
			else {
				refStr = attack.ref;
			}
			footer = `[${refStr}] → ${monster.attacks.name.split('.')[0]}`;
		}
		else if (ref) {
			footer = `Ref: [${ref}]`;
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
					fn: () => rollCrit(monster.game, table, num, argv.private, ctx),
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
 * @param {?boolean} privacy Whether the message is private
 * @param {Discord.Message} ctx Discord message with context
 * @async
 */
async function rollCrit(game, table, num, privacy, ctx) {
	const args = [game, table, num];
	if (privacy) args.push('-p');
	return await ctx.bot.commands.get('crit').execute(args, ctx);
}