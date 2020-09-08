module.exports = {
	name: 'rolltwilight',
	aliases: ['rollt2k', 'rollw', 'rw'],
	category: 't2k',
	description: 'Rolls dice for the *Twilight 2000* roleplaying game.'
		+ '\nType `help roll` for more details.',
	moreDescriptions: [
		[
			'Rolling Twilight 2000 Dice',
			'Use any combinations of the following.'
			+ '\n__Attribute or skill dice__:'
			+ '\n• `d12 | a` – Rolls a D12'
			+ '\n• `d10 | b` – Rolls a D10'
			+ '\n• `d8 | c` – Rolls a D8'
			+ '\n• `d6 | d` – Rolls a D6'
			+ '\n__Other__:'
			+ '\n• `Xg` – Rolls X ammo dice'
			+ '\n• `Xd | Xb | Xs` – Rolls X base (D6) dice',
		],
		[
			'Examples',
			'!rw d12 d8\n!rw a c\n!rw b 5g',
		],
		[
			'Arguments',
			'Type `help roll` for the list of available arguments.',
		],
		[
			'⚠️ Disclaimer!',
			'This is based on pre-alpha info gathered from Fria Ligan Interviews on internet.',
		],
	],
	guildOnly: false,
	args: true,
	usage: '[attribute and/or skill] [ammo] [arguments]',
	async run(args, ctx) {
		args.unshift('t2k');
		await ctx.bot.commands.get('roll').run(args, ctx);
	},
};