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
	 * @param {Object} [data={}] The data for the message
	 * @param {Discord.TextChannel|Discord.DMChannel|Discord.NewsChannel} channel The channel the message was sent in
	 */
	constructor(prefix, client, data = {}, channel) {
		super(client, data, channel);

		if (channel && channel.id) this.channelId = channel.id;

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
	 * @param {string|MessagePayload|MessageOptions} options The options to provide
	 * @param {number} options.deleteAfter Time before deleting the message, in seconds
	 * @returns {Promise<Discord.Message|Discord.Message[]>}
	 * @async
	 */
	async send(options) {
		// if (this.client.muted) return;
		// if (this.channel.type === 'DM') return await this.author.send(content, options);
		const msg = await this.channel.send(this.constructor.createMessageOptions(options));
		if (options && options.deleteAfter) this.constructor.deleteAfter(msg, options.deleteAfter * 1000);
		return msg;
	}
	/**
	 * Replies to the message.
	 * @param {string|MessagePayload|ReplyMessageOptions} options The options to provide
	 * @param {number} options.deleteAfter Time before deleting the message, in seconds
	 * @returns {Promise<Message|Message[]>}
	 */
	async reply(options) {
		const msg = await super.reply(this.constructor.createMessageOptions(options));
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

	/**
	 * Creates a `MessageOptions` that is used by Discord V13 `.send()` & `.reply()`.
	 * @param {string|MessagePayload|MessageOptions|ReplyMessageOptions} options The options to provide
	 * @returns {Discord.MessageOptions}
	 * @static
	 */
	static createMessageOptions(options) {
		const opts = { content: null, embeds: [] };

		if (typeof options === 'string') {
			opts.content = options;
		}
		else if (options instanceof Discord.MessageEmbed) {
			opts.embeds.push(options);
		}
		else if (typeof options === 'object') {
			return options;
		}
		return opts;
	}
}

module.exports = ContextMessage;
