const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const YZEmbed = require('../utils/embeds');

const MONSTER_ATTACKS = {
	bloodburster: 'atk-xeno-bloodburster',
	neomorph: 'atk-xeno-neomorph',
	facehugger: 'atk-xeno-facehugger',
};

module.exports = {
	name: 'attack',
	group: 'Core',
	description: 'Rolls a random attack from a monster',
	aliases: ['atk', 'atq'],
	guildOnly: false,
	args: true,
	usage: '<monster> [value]',
	async execute(args, ctx) {
		const monsterName = args.shift();
		const ref = args.shift() || Util.rand(1, 6);

		if (!MONSTER_ATTACKS.hasOwnProperty(monsterName)) {
			return await ctx.reply(
				':warning: Unknown monster. '
				+ `Type \`${ctx.prefix}help attack\` for the list of available monsters.`,
			);
		}

		const atkTable = Sebedius.getTable(
			'MONSTER_ATTACK',
			'./gamedata/alien/',
			MONSTER_ATTACKS[monsterName],
			'en', 'csv',
		);
		const atk = atkTable.get(ref);

		const embed = new YZEmbed(
			`${monsterName.toUpperCase()} ATTACK (${ref})`,
			`(${atk.ref}) ${atk.effect.replaceAll('\n', 'x')}`,
			ctx,
			true,
		);

		return await ctx.channel.send(embed);
	},
};