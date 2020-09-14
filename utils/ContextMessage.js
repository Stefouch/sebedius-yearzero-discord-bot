const Discord = require('discord.js');

/**
 * Represents a Discord message with context.
 * @extends {Discord.Message}
 * @see Sebedius.processMessage
 */
class ContextMessage extends Discord.Message {
	/**
	 * @param {string} prefix The prefix used to trigger the command
	 * @param {Discord.Client} client The instantiating client
	 * @param {Object} data The data for the message
	 * @param {Discord.TextChannel|Discord.DMChannel|Discord.NewsChannel} channel The channel the message was sent in
	 */
	constructor(prefix, client, data, channel) {
		super(client, data, channel);

		/**
		 * The prefix used to trigger the command.
		 * @type {string}
		 */
		this.prefix = prefix;
	}

	/**
	 * The bot client (Sebedius).
	 * @type {Discord.Client}
	 * @readonly
	 */
	get bot() { return this.client; }

	/**
	 * Sends a message to the channel.
	 * @param {StringResolvable|Discord.APIMessage} [content=''] The content to send
	 * @param {Discord.MessageOptions|Discord.MessageAdditions} [options={}] The options to provide
	 * @returns {Promise<Discord.Message|Discord.Message[]>}
	 * @async
	 */
	async send(content, options) {
		// if (this.channel.type === 'dm') return await this.author.send(content, options);
		return await this.channel.send(content, options);
	}
}

module.exports = ContextMessage;