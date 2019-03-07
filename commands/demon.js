const YZEmbed = require('../util/YZEmbed');
const Demon = require('../util/FBLDemonGenerator');
// const Util = require('../util/Util');

module.exports = {
	name: 'demon',
	description: 'Generates a random demon according to the tables found in'
		+ ' the roleplaying game *Forbidden Lands*',
	aliases: ['generate-demon'],
	guildOnly: false,
	args: false,
	execute(args, message) {
		const demon = new Demon();

		const embed = new YZEmbed(
			`${demon.form.toUpperCase()} DEMON`,
			'*Forbidden Lands Demon*'
		);

		// Demon's attributes & Armor Rating.
		embed.addField(
			'Attributes',
			`Strength: **${demon.attributes.str}**`
				+ `\nAgility: **${demon.attributes.agi}**`
				+ `\nWits: **${demon.attributes.wit}**`
				+ `\nEmpathy: **${demon.attributes.emp}**`,
			true
		);
		embed.addField(
			'Body',
			`Armor Rating: ${demon.armor}`
				+ (demon.formEffect) ? `\nEffect: ${demon.formEffect}` : '',
			true
		);

		return message.channel.send(embed);
	},
};