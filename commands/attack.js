const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const { YZEmbed, YZMonsterEmbed } = require('../utils/embeds');
const RollTable = require('../utils/RollTable');
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
		if (argv.private) await ctx.author.send(embed);
		else await ctx.channel.send(embed);

		// Rolls the attack.
		if (attack.d || attack.dmg) {
			const atkRoll = new YZRoll(
				ctx.author,
				{ base: attack.d },
				embed.title,
			);
			atkRoll.setGame(game);
			const hit = atkRoll.sixes;
			const damage = hit ? +attack.dmg + hit - 1 : 0;

			await ctx.channel.send(
				Sebedius.emojifyRoll(atkRoll, ctx.bot.config.commands.roll.options[game], true),
				damage
					? new YZEmbed('')
			);
		}
	},
};