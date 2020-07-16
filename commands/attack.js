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
	usage: '[game] <monster> [value] [-private|-p]',
	async execute(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			boolean: ['private'],
			alias: {
				private: ['p', 'hidden', 'h'],
			},
			default: {
				private: false,
			},
			configuration: ctx.bot.config.yargs,
		});
		// Parses any reference.
		let ref;
		if(Util.isNumber(argv._[argv._.length - 1])) {
			ref = +argv._.pop();
		}

		// Parses any game.
		let game;
		if (SUPPORTED_GAMES.includes(argv._[0])) {
			game = argv._.shift();
		}
		else {
			game = await Sebedius.getConf('games', ctx, ctx.bot, 'alien');
		}

		// Parses the monster.
		const monsterName = argv._.join(' ');
		const monster = await YZMonster.fetch(ctx, monsterName, game);
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

		console.log(monster);
		await ctx.channel.send(new YZMonsterEmbed(monster));

		// Sends the message.
		let message;
		if (argv.private) message = await ctx.author.send(embed);
		else message = await ctx.channel.send(embed);

		// Adds a Reaction Menu to roll the dice of the attack.
		if (attack.d || attack.dmg || attack.crit) {
			const reactions = [];
			if (attack.d || attack.dmg) {
				reactions.push({
					icon: '⚔️',
					owner: ctx.author.id,
					fn: collector => rollAttack(attack, game, message, ctx.bot, collector),
				});
			}
			if (attack.crit) {
				const type = '';
				const nb = '';
				reactions.push({
					icon: '☠️',
					owner: ctx.author.id,
					fn: collector => rollCrit(game, type, nb, ctx, collector),
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
 * @param {Discord.Collector} collector The reaction menu's collector
 * @async
 */
async function rollAttack(attack, game, message, bot, collector) {
	//await collector.stop();

	const atkRoll = new YZRoll(
		message.author,
		{ base: attack.d },
	);
	atkRoll.setGame(game);
	const hit = atkRoll.sixes;
	const damage = hit ? +attack.dmg + hit - 1 : 0;

	await message.channel.send(
		Sebedius.emojifyRoll(atkRoll, bot.config.commands.roll.options[game], true),
		damage
			? new YZEmbed(`${damage} Damage`, ':boom:'.repeat(damage))
			: null,
	);
}

/**
 * Rolls a crit of an attack.
 * @param {string} game The code of the game used
 * @param {?string} type Crit damage type
 * @param {?number} ref The reference of the crit, if any
 * @param {Discord.Message} ctx Discord message with context
 * @param {Discord.Collector} collector The reaction menu's collector
 * @async
 */
async function rollCrit(game, type, ref, ctx, collector) {
	//await collector.stop();
	await ctx.bot.commands.get('crit').execute([game, type, ref], ctx);
}