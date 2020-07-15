const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const YZEmbed = require('../utils/embeds');
const { SUPPORTED_GAMES } = require('../utils/constants');
const YZMonster = require('../yearzero/YZMonster');

module.exports = {
	name: 'attack',
	group: 'Core',
	description: 'Rolls a random attack from a monster',
	aliases: ['atk', 'atq'],
	guildOnly: false,
	args: true,
	usage: '[game] <monster> [value]',
	async execute(args, ctx) {
		// Parses any reference.
		let ref;
		if(Util.isNumber(args[args.length - 1])) {
			ref = +args.pop();
		}

		// Parses any game.
		let game;
		if (SUPPORTED_GAMES.includes(args[0])) {
			game = args.shift();
		}
		else {
			game = await Sebedius.getConf('games', ctx, ctx.bot);
		}

		// Parses the monster.
		const monsterName = args.join(' ');
		const monster = await YZMonster.search(ctx, monsterName, game);
		const attack = monster.attack(ref);
		const effect = attack.effect
			.replace(/{prefix}/gi, ctx.prefix)
			.replace(/{success}/gi, ctx.bot.config.commands.roll.options[monster.game].successIcon);

		// Creates the Embed.
		const embed = new YZEmbed(
			`:crossed_swords: **${monster.name}**'s Attack ${attack.ref ? `(${attack.ref})` : ''}`,
			effect, ctx, false,
		);

		return await ctx.channel.send(embed);
	},
};