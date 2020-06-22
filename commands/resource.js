const Util = require('../util/Util');
const YZRoll = require('../util/YZRoll');
const YZEmbed = require('../util/YZEmbed');

const ARTIFACT_DIE_REGEX = /^d(6|8|10|12)$/i;

module.exports = {
	name: 'resource',
	type: 'Forbidden Lands',
	description: 'Rolls a Resource Die.',
	aliases: ['res', 'ressource', 'resources', 'ressources'],
	guildOnly: false,
	args: true,
	usage: '<d6|d8|d10|d12> [name]',
	async execute(args, message, client) {
		const resourceDieArgument = args.shift();

		if (ARTIFACT_DIE_REGEX.test(resourceDieArgument)) {
			const [, size] = resourceDieArgument.match(ARTIFACT_DIE_REGEX);
			const resTitle = args.length ? args.join(' ') : 'Resource';
			const roll = new YZRoll(message.author.id, {}, resTitle);
			roll.addArtifactDie(size);
			roll.setGame('fbl');
			sendMessageForResourceDie(roll, message, client);
		}
		else {
			message.reply('⚠️ I don\'t understand this resource die. Use `d6`, `d8`, `d10` or `d12`.');
		}
	},
};

function sendMessageForResourceDie(roll, message, client) {
	if (roll.size > client.config.commands.roll.max) return message.reply('Can\'t roll that, too many dice!');

	const die = roll.artifactDice[0];
	const desc = `**\`D${die.size}\`** Resource Die: **${die.result}**`;
	const embed = new YZEmbed(roll.title, desc, message, true);
	const text = client.commands.get('roll').emojifyRoll(roll, client.config.commands.roll.options[roll.game], client.config.icons);

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
	message.channel.send(text, embed);
}