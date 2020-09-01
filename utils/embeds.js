const { MessageEmbed } = require('discord.js');
const { SOURCE_MAP } = require('./constants');

class YZEmbed extends MessageEmbed {
	/**
	 * A Discord.MessageEmbed with predefined properties.
	 * @param {string} title The embed's title
	 * @param {string} description The embed's description
	 * @param {?Discord.Message} [triggeringMessage=null] The triggering message (default is null)
	 * @param {boolean} [hasAuthor=false] Shows or not the triggering message's author (default is false)
	 * @extends Discord.MessageEmbed
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
	 * @extends Discord.MessageEmbed
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
			const special = monster.special.replace(/{mutation}/g, 'Random mutation');
			this.addField('Special', special, false);
		}

		this.setFooter(`Source: ${SOURCE_MAP[monster.source]}`);
	}
}

class UserEmbed extends MessageEmbed {
	/**
	 * A Discord embed message that displays info about a user.
	 * @param {Discord.User} user Discord User
	 * @param {?string} color Embed.color
	 */
	constructor(user, color = 0x1AA29B) {
		super({
			color,
			title: `${user.username} (${user.tag})`,
			description: `Language: **${user.locale}**`,
			thumbnail: { url: user.avatarURL() },
			timestamp: new Date(),
			footer: { text: `ID: ${user.id}` },
			fields: [
				{
					name: 'Created At',
					value: user.createdAt,
					inline: true,
				},
			],
		});
		this.user = user;
		if (user.bot) this.addField('Bot', ':warning: This user is a bot!', true);
		if (user.flags.bitfield) this.addField('Flags', user.flags.bitfield, true);
		if (user.lasMessage) this.addField('Last Message', user.lasMessage.content, false);
	}
}

class GuildEmbed extends MessageEmbed {
	/**
	 * A Discord embed message that displays info about a user.
	 * @param {Discord.Guild} guild Discord Guild
	 * @param {?string} color Embed.color
	 */
	constructor(guild, color = 0x1AA29B) {
		super({
			color,
			title: guild.name,
			description: guild.description,
			thumbnail: { url: guild.iconURL() },
			timestamp: new Date(),
			footer: { text: `ID: ${guild.id}` },
			fields: [
				{
					name: 'Members',
					value: guild.memberCount,
					inline: true,
				},
				{
					name: 'Owner',
					value: guild.ownerID,
					inline: true,
				},
				{
					name: 'Created At',
					value: guild.createdAt,
					inline: true,
				},
			],
		});
		this.guild = guild;
	}
	async addInviteField(inline = false) {
		let invite = null;
		/* try {
			const chans = (await this.guild.fetch()).channels.cache;
			for (const [, c] of chans) {
				if (!(c instanceof TextChannel)) continue;
				// invite = (await c.createInvite()).url;
				if (invite) break;
			}
		}
		catch (error) {
			console.error(error);
		} //*/
		const invites = await this.guild.fetchInvites();
		if (invites.size) invite = invites.first().url;
		if (invite) this.addField('Invite', invite, inline);
	}
}

module.exports = { YZEmbed, YZMonsterEmbed, UserEmbed, GuildEmbed };