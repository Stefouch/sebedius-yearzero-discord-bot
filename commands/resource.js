const YZEmbed = require('../utils/embeds');
const YZRoll = require('../yearzero/YZRoll');
const Sebedius = require('../Sebedius');

const ARTIFACT_DIE_REGEX = /^d(6|8|10|12)$/i;

module.exports = {
	name: 'resource',
	group: 'Forbidden Lands',
	description: 'Rolls a Resource Die.',
	aliases: ['res', 'ressource', 'resources', 'ressources'],
	guildOnly: false,
	args: true,
	usage: '<d6|d8|d10|d12> [name]',
	async execute(args, ctx) {
		const resourceDieArgument = args.shift();

		if (ARTIFACT_DIE_REGEX.test(resourceDieArgument)) {
			const [, size] = resourceDieArgument.match(ARTIFACT_DIE_REGEX);
			const resTitle = args.length ? args.join(' ') : 'Resource';
			const roll = new YZRoll(ctx.author.id, {}, resTitle);
			roll.addArtifactDie(size);
			roll.setGame('fbl');
			sendMessageForResourceDie(roll, ctx);
		}
		else {
			ctx.reply('⚠️ I don\'t understand this resource die. Use `d6`, `d8`, `d10` or `d12`.');
		}
	},
};

function sendMessageForResourceDie(roll, ctx) {
	if (roll.size > ctx.bot.config.commands.roll.max) return ctx.reply('Can\'t roll that, too many dice!');

	const die = roll.artifactDice[0];
	const desc = `**\`D${die.size}\`** Resource Die: **${die.result}**`;
	const embed = new YZEmbed(roll.title, desc, ctx, true);
	const text = Sebedius.emojifyRoll(roll, ctx.bot.config.commands.roll.options[roll.game]);

	if (die.result <= 2) {
		const resSizes = [0, 6, 8, 10, 12];
		const newSize = resSizes[resSizes.indexOf(die.size) - 1];

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
	ctx.channel.send(text, embed);
}