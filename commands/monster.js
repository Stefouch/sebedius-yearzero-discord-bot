const Util = require('../utils/Util');
const { YZEmbed, YZMonsterEmbed } = require('../utils/embeds');
const { SUPPORTED_GAMES } = require('../utils/constants');
const YZMonster = require('../yearzero/YZMonster');
const Monster = require('../generators/MYZMonsterGenerator');

module.exports = {
	name: 'monster',
	group: 'Core',
	description: 'Gets a monster from the catalogs or generates a random monster according to the tables found in'
		+ ' the *Zone Compendium 1: The Lair of the Saurians*.',
	aliases: ['mon', 'creature', 'pokemon'],
	guildOnly: false,
	args: false,
	usage: '[game] <monster name> [-attack|-atk|-a <number>] [-private|-p]',
	async execute(args, ctx) {
		// Old MYZ monster generator.
		if (!args.length) return await generateRandomMYZMonster(ctx);

		// Parses arguments.
		const { monster, argv } = await module.exports.parse(args, ctx);

		// Creates the embed and sends the message.
		const membed = new YZMonsterEmbed(monster);
		if (argv.private) await ctx.author.send(membed);
		else await ctx.channel.send(membed);

		if (argv.attack) {
			const argk = [monster.game, monster.name];
			if (Util.isNumber(argv.attack)) argk.push(argv.attack);
			if (argv.private) argk.push('-p');
			return await ctx.bot.commands.get('attack').execute(argk, ctx);
		}
		return monster;
	},
	/**
	 * Parses the arguments.
	 * @param {string[]} args Command's arguments
	 * @param {Discord.Message} ctx Discord message with context
	 * @returns {Object} { monster, argv }
	 *  * monster: YZMonster
	 *  * argv: yargs parsed arguments
	 * @async
	 */
	async parse(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			boolean: ['private'],
			alias: {
				attack: ['a', 'atk'],
				private: ['p'],
			},
			default: {
				private: false,
			},
			configuration: ctx.bot.config.yargs,
		});
		// Parses any reference.
		if (!argv.attack && Util.isNumber(argv._[argv._.length - 1])) {
			argv.attack = argv._.pop();
		}

		// Parses any game.
		let game;
		if (SUPPORTED_GAMES.includes(argv._[0])) game = argv._.shift();
		else game = await ctx.bot.getGame(ctx);
		argv.game = game;

		// Parses the monster.
		const monsterName = argv._.join(' ');
		const monster = await YZMonster.fetch(ctx, game, monsterName);

		return { monster, argv };
	},
};


/**
 * Generates a random MYZ monster.
 * @param {Discord.Message} ctx Discord message with context
 * @returns {Discord.Message} The message sent
 * @async
 */
async function generateRandomMYZMonster(ctx) {
	const monster = new Monster();

	const embed = new YZEmbed(
		`${monster.name.toUpperCase()}${monster.swarm ? 'S' : ` ⨯ ${monster.qty}`}`,
		(monster.loner ? '' : `${monster.descriptions.number} of `)
			+ `*${monster.descriptions.traits.join(' and ')}* `
			+ `${monster.descriptions.size} ${monster.descriptions.type}${monster.loner ? '' : 's'}`,
	);

	// Creature's Strength, Agility, Armor Rating & Legs.
	embed.addField(
		'Attributes',
		`Strength: **${monster.str + +monster.swarm * 3}**\nAgility: **${monster.agi}**`,
		true,
	);

	embed.addField(
		'Body',
		`Armor Rating: **${monster.armor}**\n${monster.descriptions.limbs}`,
		true,
	);

	// Creature's skill(s).
	let skillsText = '';

	if (monster.skills) {
		for (const skName in monster.skills) {

			if (skName === 'fight') { if (!monster.melee) continue; }
			if (skName === 'shoot') { if (!monster.ranged) continue; }

			skillsText += `\n${Util.strCamelToNorm(skName)}: **${monster.skills[skName]}**`;
		}
	}
	else {
		skillsText += '*None*';
	}

	embed.addField('Skills', skillsText, true);

	// Creature's attack(s).
	const nameColLen = 16, dmgColLen = 10, rangeColLen = 9;
	let attacksText = '```'
		+ Util.alignText('\nName', nameColLen, 0)
		+ Util.alignText('Damage', dmgColLen, 0)
		+ Util.alignText('Range', rangeColLen, 0)
		+ 'Special';

	for (const attack of monster.attacks) {
		attacksText += Util.alignText(`\n${attack.name}`, nameColLen, 0)
			+ Util.alignText(`${attack.damage}`, dmgColLen, 0)
			+ Util.alignText(`${attack.range}`, rangeColLen, 0)
			+ (attack.special ? attack.special : '–');
	}

	attacksText += '\n```';

	embed.addField('Attacks', attacksText, false);

	// Creature's mutation(s).
	embed.addField(
		'Mutations',
		(monster.mutations) ? monster.mutations.join(', ') : '*None*',
		false,
	);

	// Swarm's special.
	if (monster.swarm) {
		embed.addField('Special', 'Swarm *(Can only be damaged by flamethrowers and mutations)*', false);
	}

	// console.log(monster);
	return await ctx.channel.send(embed);
}