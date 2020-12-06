const { emojifyRoll } = require('../Sebedius');
const { isNumber, clamp } = require('../utils/Util');
const { YZEmbed } = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');

module.exports = {
	name: 'supply',
	aliases: ['sup'],
	category: 'alien',
	description: 'Rolls for a supply.',
	guildOnly: false,
	args: true,
	usage: '<rating> [name]',
	async run(args, ctx) {
		let rating;
		// Accepts "8" and "8d", but not "d8".
		if (/^\d{1,2}d$/i.test(args[0])) rating = args.shift().match(/\d+/)[0];
		else rating = +args.shift();

		if (isNumber(rating)) {
			// A maximum of 6 dice are rolled. See ALIEN corebook pg. 34 for details.
			const resQty = clamp(rating, 0, 6);
			const resTitle = args.length ? args.join(' ') : 'Supply';
			const roll = new YZRoll('alien', ctx.author, resTitle)
				.addStressDice(resQty);
			sendMessageForResourceRoll(rating, roll, ctx);
		}
		else {
			ctx.reply('ℹ️ This Supply Roll is not possible. Try `supply <rating> [name]`');
		}
	},
};

function sendMessageForResourceRoll(resRating, roll, ctx) {
	// const resRating = roll.stress;
	const newRating = resRating - roll.panic;

	const gameOptions = ctx.bot.config.commands.roll.options[roll.game];

	const text = emojifyRoll(roll, gameOptions);
	const embed = new YZEmbed(`**${roll.name.toUpperCase()}** (${resRating})`, null, ctx, true);

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
	ctx.send(text, embed);
}