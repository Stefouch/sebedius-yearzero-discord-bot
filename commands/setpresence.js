const { ActivityTypes } = require('discord.js').Constants;
const PresenceStatus = ['online', 'idle', 'invisible', 'dnd'];

module.exports = {
	name: 'setpresence',
	aliases: ['setactivity'],
	category: 'admin',
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
	ownerOnly: true,
	guildOnly: false,
	args: true,
	usage: '[-name|text <text..>] [-type <?>] [-status <?>] [-idle] [-loop] [-afk]',
	async run(args, ctx) {
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
				name: ['Ready to roll dice!'],
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

		// Parses.
		argv.type = argv.type.toUpperCase();
		argv.status = argv.status.toLowerCase();
		let name, type, status, afk, message;

		if (argv.idle || argv._[0] === 'idle') {
			name = '🚧 On Maintenance';
			type = 'WATCHING';
			status = 'dnd';
			afk = true;
			message = ':ballot_box_with_check: Sebedius is `ON MAINTENANCE`.';
		}
		else {
			name = argv.name.join(' ');
			type = ActivityTypes.includes(argv.type) ? argv.type : ActivityTypes[0];
			status = PresenceStatus.includes(argv.status) ? argv.status : PresenceStatus[0];
			afk = argv.afk ? true : false;
			message = ':ballot_box_with_check: New status set with success.';
		}

		// Sets the presence.
		ctx.bot.user.setPresence({ status, afk, activity: { name, type } });

		// Restores the Activities interval.
		if (argv.loop) {
			ctx.bot.activity = require('../utils/activities')(ctx.bot);
			message = ':ballot_box_with_check: Sebedius\'s activities are `LOOPING`.';
		}

		return await ctx.send(message);
	},
};
