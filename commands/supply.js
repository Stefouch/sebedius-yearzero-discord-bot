const Util = require('../util/Util');
const YZRoll = require('../util/YZRoll');
const YZEmbed = require('../util/YZEmbed');

module.exports = {
	name: 'supply',
	description: 'Rolls for a supply.',
	aliases: ['sup'],
	guildOnly: false,
	args: true,
	usage: '<rating> [name]',
	async execute(args, message, client) {
		// A maximum of 6 dice are rolled. See ALIEN corebook pg. 34 for details.
		const resQty = Util.clamp(args.shift(), 0, 6);

		if (Util.isNumber(resQty)) {
			const resTitle = args.length ? args.join(' ') : 'Supply';
			const roll = new YZRoll(message.author.id, { stress: resQty }, resTitle);
			roll.setGame('alien');
			sendMessageForResourceRoll(roll, message, client);
		}
		else {
			message.reply('ℹ️ This Supply Roll is not possible. Try `supply <rating> [name]`');
		}
	},
};

function sendMessageForResourceRoll(roll, message, client) {
	const resRating = roll.stress;
	const newRating = resRating - roll.panic;

	const gameOptions = client.config.commands.roll.options[roll.game];

	const text = client.commands.get('roll').emojifyRoll(roll, gameOptions, client.config.icons);
	const embed = new YZEmbed(`**${roll.title.toUpperCase()}** (${resRating})`, null, message, true);

	if (resRating === newRating) {
		embed.addField(
			'✅ Unchanged',
			`The supply didn't decrease.\nRating: **${newRating}**`,
		);
	}
	else if (newRating > 0) {
		embed.addField(
			'⬇ Decreased',
			`The supply is decreased by ${roll.panic} step${roll.panic > 1 ? 's' : ''}.\nNew rating: **${newRating}**`,
		);
	}
	else {
		embed.addField(
			'🚫 Exhausted',
			'The consumable is fully depleted.\tRating: **0**',
		);
	}
	message.channel.send(text, embed);
}