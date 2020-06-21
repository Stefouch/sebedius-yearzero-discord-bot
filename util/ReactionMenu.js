const Discord = require('discord.js');

class ReactionMenu {
	constructor(message, client, time, reactions) {
		this.channel = message.channel;
		this.client = client;
		this.time = time;
	}
}

module.exports = ReactionMenu;