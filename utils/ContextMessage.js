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
	 * @type {Discord.Client|import('../Sebedius')}
	 * @readonly
	 */
	get bot() { return this.client; }

	/**
	 * Sends a message to the channel.
	 * @param {StringResolvable|Discord.APIMessage} [content=''] The content to send
	 * @param {Discord.MessageOptions|Discord.MessageAdditions} [options={}] The options to provide
	 * @param {number} options.deleteAfter Time before deleting the message, in seconds
	 * @returns {Promise<Discord.Message|Discord.Message[]>}
	 * @async
	 */
	async send(content, options) {
		// if (this.client.muted) return;
		// if (this.channel.type === 'dm') return await this.author.send(content, options);
		const msg = await this.channel.send(content, options);
		if (options && options.deleteAfter) this.constructor.deleteAfter(msg, options.deleteAfter * 1000);
		return msg;
	}
	/**
	 * Replies to the message.
	 * @param {StringResolvable|APIMessage} [content=''] The content for the message
	 * @param {MessageOptions|MessageAdditions} [options={}] The options to provide
	 * @param {number} options.deleteAfter Time before deleting the message, in seconds
	 * @returns {Promise<Message|Message[]>}
	 */
	async reply(content, options) {
		const msg = await super.reply(content, options);
		if (options && options.deleteAfter) this.constructor.deleteAfter(msg, options.deleteAfter * 1000);
		return msg;
	}

	/**
	 * Deletes a message after a delay in milliseconds.
	 * @param {Discord.Message} msg Discord message to delete
	 * @param {number} delay in milliseconds
	 */
	static deleteAfter(msg, delay) {
		if (!(msg instanceof Discord.Message)) return;

		setTimeout(() => {
			try { msg.delete(); }
			catch (error) { console.error(error); }
		}, delay);
	}
}

module.exports = ContextMessage;