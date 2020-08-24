const { ActivityTypes } = require('discord.js').Constants;
const PresenceStatus = ['online', 'idle', 'invisible', 'dnd'];

module.exports = {
	name: 'setpresence',
	group: 'Administration',
	description: 'Sets the presence of the bot.',
	moreDescriptions: [
		[
			'Arguments',
			`• \`-name|activity|text|desc <text..>\` – Sets the text of the activity.
			• \`-type <PLAYING | LISTENING | WATCHING>\` – Sets the type of the activity.
			• \`-status <online | idle | invisible | dnd>\` – Sets the status of the activity.
			• \`-afk\` – Sets the bot *Away From Keyboard*.`,
		],
		[
			'Special Options',
			`• \`-loop\` – Restart the normal activities loop.
			• \`-idle\` – Shortcut for \`-status dnd -type watching -afk -name 🚧 On Maintenance\`.`,
		],
	],
	adminOnly: true,
	guildOnly: false,
	args: true,
	usage: '[-name|text <text..>] [-type <?>] [-status <?>] [-idle] [-loop] [-afk]',
	async execute(args, ctx) {
		// Exits early if not the bot's owner.
		if (ctx.author.id !== ctx.bot.config.ownerID) return;

		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			array: ['name'],
			boolean: ['afk', 'idle', 'loop'],
			string: ['status', 'type'],
			alias: {
				name: ['activity', 'text', 'desc'],
			},
			default: {
				name: ['Hello World!'],
				afk: false,
				type: ActivityTypes[0],
				status: PresenceStatus[0],
				idle: false,
				loop: false,
			},
			configuration: ctx.bot.config.yargs,
		});
		// Clears the Activities interval.
		clearInterval(ctx.bot.activity);

		// Restores the Activities interval.
		if (argv.loop) {
			ctx.bot.activity = require('../utils/activities')(ctx.bot);
			return await ctx.channel.send(':ballot_box_with_check: Sebedius\'s activities are `LOOPING`.');
		}
		else if (argv.idle) {
			await ctx.bot.user.setPresence({
				status: 'dnd',
				afk: true,
				activity: {
					name: '🚧 On Maintenance',
					type: 'WATCHING',
				},
			})
				.then(console.log)
				.catch(console.error);

			return await ctx.channel.send(':ballot_box_with_check: Sebedius is `ON MAINTENANCE`.');
		}
		argv.type = argv.type.toUpperCase();
		argv.status = argv.status.toLowerCase();
		const name = argv.name.join(' ');
		const type = ActivityTypes.includes(argv.type) ? argv.type : ActivityTypes[0];
		const status = PresenceStatus.includes(argv.status) ? argv.status : PresenceStatus[0];
		const afk = argv.afk ? true : false;

		// Sets the presence.
		await ctx.bot.user.setPresence({ status, afk, activity: { name, type } })
			.then(console.log)
			.catch(console.error);

		return await ctx.channel.send(':ballot_box_with_check: New status set with success.');
	},
};