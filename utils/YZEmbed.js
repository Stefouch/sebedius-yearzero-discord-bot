const { RichEmbed } = require('discord.js');

class YZEmbed extends RichEmbed {
	constructor(title, description, triggeringMessage = null, hasAuthor = false) {
		super({
			color: 0x1AA29B,
			title: title,
			description: description,
		});

		if (triggeringMessage) {

			if (triggeringMessage.channel.type === 'text') {
				this.setColor(triggeringMessage.member.colorRole.color);
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