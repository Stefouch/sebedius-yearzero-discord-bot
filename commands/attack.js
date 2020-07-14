const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const YZEmbed = require('../utils/embeds');
const YZMonster = require('../yearzero/YZMonster');

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
		const ref = args.shift();
		console.log(YZMonster.monsters());
	},
};