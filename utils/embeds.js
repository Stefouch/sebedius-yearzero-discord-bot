const { MessageEmbed } = require('discord.js');
const { SOURCE_MAP } = require('./constants');
const { strCamelToNorm } = require('./Util');

/**
 * A Discord.MessageEmbed with predefined properties.
 * @extends {MessageEmbed}
 */
class YZEmbed extends MessageEmbed {
	/**
	 * @param {string} title The embed's title
	 * @param {string} description The embed's description
	 * @param {?import('discord.js').Message} [triggeringMessage=null] The triggering message (default is null)
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

/**
 * A Discord embed message for Year Zero monsters.
 * @extends {MessageEmbed}
 */
class YZMonsterEmbed extends MessageEmbed {
	/**
	 * @param {import('../yearzero/YZObject').YZMonster} monster Year Zero monster object
	 * @param {string} [color=0x1AA29B] Embed.color
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

/**
 * A Discord embed message that displays info about a Character.
 * @extends {MessageEmbed}
 */
class CharacterEmbed extends MessageEmbed {
	/**
	 * @param {import('../yearzero/sheet/Character')} character Character
	 * @param {import('./ContextMessage')} ctx Discord message with context
	 */
	constructor(character, ctx) {
		super({
			color: ctx ? ctx.member.displayColor : undefined,
			author: ctx
				? {
					name: ctx.member.displayName,
					iconURL: ctx.author.avatarURL(),
				}
				: undefined,
			title: character.name,
			description: character.description,
			footer: { text: `ID: ${character.id}` },
			fields: [
				{
					name: 'Attributes',
					value: character.attributes
						.map(a => `${strCamelToNorm(a.name)}: **${a.value}**`)
						.join('\n'),
					inline: true,
				},
				{
					name: 'Skills',
					value: character.skills
						.filter(s => s.value > 0)
						.map(s => `${strCamelToNorm(s.name)}: **${s.value}**`)
						.join('\n'),
					inline: true,
				},
			],
		});
	}
}

/**
 * A Discord embed message that displays info about a user.
 * @extends {MessageEmbed}
 */
class UserEmbed extends MessageEmbed {
	/**
	 * @param {import('discord.js').User} user Discord User
	 * @param {string} [color=0x1AA29B] Embed.color
	 */
	constructor(user, color = 0x1AA29B) {
		super({
			color,
			title: `${user.username} (${user.tag})`,
			description: `Language: **${user.locale}**`,
			thumbnail: { url: user.displayAvatarURL() },
			timestamp: new Date(),
			footer: { text: `ID: ${user.id}` },
			fields: [
				{
					name: 'Status',
					value: user.presence.status.toUpperCase(),
				},
				{
					name: 'Created At',
					value: user.createdAt,
					inline: true,
				},
			],
		});
		this.user = user;
		if (user.bot) this.addField('Bot', '⚠️ This user is a bot!', true);
		// if (user.flags.bitfield) this.addField('Flags', user.flags.bitfield, true);
		if (user.lastMessage) this.addField('Last Message', user.lastMessage.content, false);
	}
}

/**
 * A Discord embed message that displays info about a user.
 * @extends {MessageEmbed}
 */
class GuildEmbed extends MessageEmbed {
	/**
	 * @param {import('discord.js').Guild} guild Discord Guild
	 * @param {string} [color=0x1AA29B] Embed.color
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
					name: 'Text Channels',
					value: guild.channels.cache.filter(ch => ch.type === 'text').size,
					inline: true,
				},
				{
					name: 'Voice Channels',
					value: guild.channels.cache.filter(ch => ch.type === 'voice').size,
					inline: true,
				},
				{
					name: 'Owner',
					value: `${guild.owner.user.tag} (${guild.ownerID})`,
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

module.exports = { YZEmbed, YZMonsterEmbed, CharacterEmbed, UserEmbed, GuildEmbed };