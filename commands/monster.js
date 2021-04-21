const { YZMonster } = require('../yearzero/YZObject');
const Monster = require('../generators/MYZMonsterGenerator');
const { isNumber, strCamelToNorm, alignText } = require('../utils/Util');
const { YZEmbed, YZMonsterEmbed } = require('../utils/embeds');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'monster',
	aliases: ['mon', 'creature', 'pokemon'],
	category: 'common',
	description: 'cmonster-description',
	moreDescriptions: 'cmonster-moredescriptions',
	guildOnly: false,
	args: false,
	usage: '[game] <monster name> [-attack|-atk|-a <number>] [-private|-p] [-lang <language_code>]',
	async run(args, ctx) {
		// Parses arguments.
		const { monster, argv } = await module.exports.parse(args, ctx);

		// Old MYZ monster generator.
		if (!monster) return await generateRandomMYZMonster(ctx, argv.lang);

		// Creates the embed and sends the message.
		const membed = new YZMonsterEmbed(monster);
		if (argv.private) await ctx.author.send(membed);
		else await ctx.send(membed);

		if (argv.attack) {
			const argk = [monster.game, monster.id, '-lang', monster.lang];
			if (isNumber(argv.attack)) argk.push(argv.attack);
			if (argv.private) argk.push('-p');
			return await ctx.bot.commands.get('attack').run(argk, ctx);
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
			string: ['lang'],
			alias: {
				attack: ['a', 'atk'],
				private: ['p'],
				lang: ['lng', 'language'],
			},
			default: {
				private: false,
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);
		argv.lang = lang;

		if (!argv._.length) {
			return { undefined, argv };
		}

		// Parses any reference.
		if (!argv.attack && isNumber(argv._[argv._.length - 1])) {
			argv.attack = argv._.pop();
		}

		// Parses any game.
		let game;
		if (YZMonster.getAvailableGames().includes(argv._[0])) {
			game = argv._.shift();
			game = await YZMonster.fetchGame(ctx, game, lang);
		}
		else {
			game = await ctx.bot.getGame(ctx, 'none');
			if (game === 'none') {
				game = await YZMonster.fetchGame(ctx, null, lang);
			}
		}
		argv.game = game;

		// Parses the monster.
		const monsterName = argv._.join(' ');
		const monster = await YZMonster.fetch(ctx, game, monsterName, lang);

		return { monster, argv };
	},
};


/**
 * Generates a random MYZ monster.
 * @param {Discord.Message} ctx Discord message with context
 * @returns {Discord.Message} The message sent
 * @async
 */
async function generateRandomMYZMonster(ctx, language = 'en') {
	const monster = new Monster(language);
	const articles = __('attribute-articles-' + (monster.loner ? 'singular' : 'plural'), monster.lang);

	const embed = new YZEmbed(
		`${monster.name.toUpperCase()}${monster.swarm ? 'S' : ` ⨯ ${monster.qty}`}`,
		(monster.loner ? '' : `${monster.descriptions.number} ${__('cmonster-number-of', monster.lang)} `)
		+ `*${monster.descriptions.traits.join(`${articles} ${__('and', monster.lang)} `)}${articles}* `
		+ `${monster.descriptions.size}${articles} ${monster.descriptions.type}`,
	);

	// Creature's Strength, Agility, Armor Rating & Legs.
	embed.addField(
		__('attributes', monster.lang),
		`${__('attribute-myz-strength', monster.lang)}: **${monster.str + +monster.swarm * 3}**\n${__('attribute-myz-agility', monster.lang)}: **${monster.agi}**`,
		true,
	);

	embed.addField(
		__('body', monster.lang),
		`${__('armor-rating', monster.lang)}: **${monster.armor}**\n${monster.descriptions.limbs}`,
		true,
	);

	// Creature's skill(s).
	let skillsText = '';

	if (monster.skills) {
		for (const skName in monster.skills) {

			if (skName === 'fight') { if (!monster.melee) continue; }
			if (skName === 'shoot') { if (!monster.ranged) continue; }

			skillsText += `\n${__('skill-myz-' + skName, monster.lang)}: **${monster.skills[skName]}**`;
		}
	}
	else {
		skillsText += `*${__('none', monster.lang)}*`;
	}

	embed.addField(__('skills', monster.lang), skillsText, true);

	// Creature's attack(s).
	const nameColLen = 16, dmgColLen = 10, rangeColLen = 9;
	let attacksText = '```'
		+ alignText(`\n${__('name', monster.lang)}`, nameColLen, 0)
		+ alignText(__('damage', monster.lang), dmgColLen, 0)
		+ alignText(__('range', monster.lang), rangeColLen, 0)
		+ __('special', monster.lang);

	for (const attack of monster.attacks) {
		attacksText += alignText(`\n${attack.name}`, nameColLen, 0)
			+ alignText(`${attack.damage}`, dmgColLen, 0)
			+ alignText(`${__('range-myz-' + attack.range, monster.lang)}`, rangeColLen, 0)
			+ (attack.special ? attack.special : '–');
	}

	attacksText += '\n```';

	embed.addField(__('attacks', monster.lang), attacksText, false);

	// Creature's mutation(s).
	embed.addField(
		__('mutations', monster.lang),
		(monster.mutations) ? monster.mutations.join(', ') : `*${__('none', monster.lang)}*`,
		false,
	);

	// Swarm's special.
	if (monster.swarm) {
		embed.addField(__('special', monster.lang), `${__('swarm', monster.lang)} *(${__('swarm-special', monster.lang)})*`, false);
	}

	// console.log(monster);
	return await ctx.send(embed);
}