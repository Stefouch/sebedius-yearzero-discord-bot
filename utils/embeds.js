const { MessageEmbed } = require('discord.js');
const { SOURCE_MAP } = require('./constants');

class YZEmbed extends MessageEmbed {
	/**
	 * A Discord.MessageEmbed with predefined properties.
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
					triggeringMessage.author.avatarURL(),
				);
			}
		}
	}
}

class YZMonsterEmbed extends MessageEmbed {

	/**
	 * A Discord embed message for Year Zero monsters.
	 * @param {YZMonster} monster Year Zero monster object
	 * @param {?string} color Embed.color
	 */
	constructor(monster, color = 0x1AA29B) {
		super({
			title: monster.name.toUpperCase(),
			description: undefined,
			color,
		});

		// Monster stats.
		this.addField('Attributes', monster.attributesToString(), true);
		this.addField('Armor', monster.armorToString(), true);
		this.addField('Skills', monster.skillsToString(), true);
		this.addField('Signature Attacks', monster.attacksToString(), false);
		if (monster.special) {
			const special = monster.special.replace(/{mutation}/g, 'Random mutation') + '.';
			this.addField('Special', special, false);
		}

		this.setFooter(`Source: ${SOURCE_MAP[monster.source]}`);
	}
}

module.exports = { YZEmbed, YZMonsterEmbed };