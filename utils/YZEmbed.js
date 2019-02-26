const { RichEmbed } = require('discord.js');

class YZEmbed extends RichEmbed {
	/**
	 * A Discord.RichEmbed with predefined properties.
	 * @param {string} title The embed's title
	 * @param {string} description The embed's description
	 * @param {?Discord.Message} [triggeringMessage=null] The triggering message (default is null)
	 * @param {boolean} [hasAuthor=false] Shows or not the triggering message's author (default is false)
	 */
	constructor(title, description, triggeringMessage = null, hasAuthor = false) {
		super({
			color: 0x1AA29B,
			title,
			description,
		});

		if (triggeringMessage) {
			const isTextChannel = triggeringMessage.channel.type === 'text';

			if (isTextChannel) {

				if (typeof triggeringMessage.member.displayColor !== 'undefined') {
					this.setColor(triggeringMessage.member.displayColor);
				}
			}

			if (hasAuthor) {
				const name = isTextChannel ? triggeringMessage.member.displayName : triggeringMessage.author.username;
				this.setAuthor(
					name,
					triggeringMessage.author.avatarURL
				);
			}
		}
	}
}

module.exports = YZEmbed;