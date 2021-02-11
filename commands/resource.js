const { YZEmbed } = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');
const { emojifyRoll } = require('../Sebedius');

const ARTIFACT_DIE_REGEX = /^[dw](6|8|10|12)$/i;

module.exports = {
	name: 'resource',
	aliases: ['res', 'ressource', 'resources', 'ressources'],
	category: 'fbl',
	description: 'Rolls a Resource Die.',
	guildOnly: false,
	args: true,
	usage: '<d6|d8|d10|d12> [name]',
	async run(args, ctx) {
		const resourceDieArgument = args.shift();

		if (ARTIFACT_DIE_REGEX.test(resourceDieArgument)) {
			const [, size] = resourceDieArgument.match(ARTIFACT_DIE_REGEX);
			const resTitle = args.length ? args.join(' ') : 'Resource';
			const roll = new YZRoll('fbl', ctx.author, resTitle)
				.addDice('arto', 1, size);
			sendMessageForResourceDie(roll, ctx);
		}
		else {
			ctx.reply('⚠️ I don\'t understand this resource die. Use `d6`, `d8`, `d10` or `d12`.');
		}
	},
};

function sendMessageForResourceDie(roll, ctx) {
	if (roll.size > ctx.bot.config.commands.roll.max) return ctx.reply('Can\'t roll that, too many dice!');

	const die = roll.dice[0];
	const desc = `**\`D${die.range}\`** Resource Die: **${die.result}**`;
	const embed = new YZEmbed(roll.name, desc, ctx, true);
	const text = emojifyRoll(roll, ctx.bot.config.commands.roll.options[roll.game]);

	if (die.result <= 2) {
		const resSizes = [0, 6, 8, 10, 12];
		const newSize = resSizes[resSizes.indexOf(die.range) - 1];

		if (newSize > 0) {
			embed.addField(
				'⬇ Decreased',
				`One unit is used. The Resource Die is decreased one step to a **\`D${newSize}\`**.`,
			);
		}
		else {
			embed.addField(
				'🚫 Exhausted',
				'The consumable is fully depleted.',
			);
		}
	}
	else {
		embed.addField(
			'✅ Unchanged',
			'The Resource Die didn\'t decrease.',
		);
	}
	ctx.send(text, embed);
}