const { RichEmbed } = require('discord.js');

class YZEmbed extends RichEmbed {
	/**
	 * A Discord.RichEmbed with predefined properties.
	 * @param {string} title The embed's title
	 * @param {string} description The embed's description
	 * @param {Discord.Message} triggeringMessage The triggering message (default is null)
	 * @param {boolean} hasAuthor Shows or not the triggering message's author (default is false)
	 */
	constructor(title, description, triggeringMessage = null, hasAuthor = false) {
		super({
			color: 0x1AA29B,
			title,
			description,
		});

		if (triggeringMessage) {

			if (triggeringMessage.channel.type === 'text') {

				if (typeof triggeringMessage.member.displayColor !== 'undefined') {
					this.setColor(triggeringMessage.member.displayColor);
				}
			}

			if (hasAuthor) {
				this.setAuthor(
					triggeringMessage.author.username,
					triggeringMessage.author.avatarURL
				);
			}
		}
	}
}

module.exports = YZEmbed;