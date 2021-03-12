/* eslint-disable max-len */
const { SUPPORTED_GAMES } = require('../utils/constants');
const Config = require('../config.json');
const YZJourney = require('../yearzero/YZJourney');

const LOCALES = {
	en: {
		none: 'none',
		unknown: 'Unknown',
		damage: 'Damage',
		name: 'Name',
		aliases: 'Aliases',
		usage: 'Usage',
		description: 'Description',
		table: 'Table',
		possessives: '\'s',
		game: 'Game',
		ability: 'Ability',
		abilities: 'Abilities',
		attack: 'Attack',
		attacks: 'Attacks',
		attribute: 'Attribute',
		attributes: 'Attributes',
		armor: 'Armor',
		'armor-rating': 'Armor Rating',
		artifact: 'Artifact',
		body: 'Body',
		demon: 'Demon',
		'signature-attacks': 'Signature Attacks',
		skill: 'Skill',
		skills: 'Skills',
		source: 'Source',
		special: 'Special',
		weakness: 'Weakness',
		weaknesses: 'Weaknesses',
		clip: 'Clip',
		fullauto: 'Fullauto',
		light: 'Light',
		heavy: 'Heavy',
		energy: 'Energy',
		'armor-piercing': 'Armor Piercing',
		explosive: 'Explosive',
		'blast-power': 'Blast Power',
		rot: 'Rot',
		mounted: 'Mounted',
		fire: 'Fire',
		barrels: 'Barrels',
		'jury-rigged': 'Jury-Rigged',
		base: 'Base',
		'base-dice': 'Base Dice',
		'base-power-level': 'Base Power Level',
		overcharging: 'Overcharging',
		'magic-mishap': 'Magic Mishap',
		permanent: 'Permanent',
		'permanent-effects': 'These effects are permanent.',
		'healing-time': 'Healing Time',
		'healing-time-until-end-text': 'days until end of effects.',
		lethality: 'Lethality',
		'selection-title': 'Multiple Matches Found',
		'selection-description': 'Which one were you looking for?',
		'selection-instructions': 'Type your response in the channel you called the command. '
			+ 'This message was PMed to you to hide the choices (i.e. the monster name).',
		success: 'Success',
		successes: 'Successes',
		trauma: 'Trauma',
		traumas: 'Traumas',
		'gear-damage': 'Gear Damage',
		'extra-hit': 'Extra Hit',
		'extra-hits': 'Extra Hits',
		suppression: 'Suppression',
		suppressions: 'Suppressions',
		mishap: 'Mishap',
		panic: 'Panic',
		details: 'Details',
		pushed: 'Pushed',
		initiative: 'Initiative',
		pride: 'Pride',
		page: 'page',
		instructions: 'Instructions',
		mutation: 'Mutation',
		journey: 'Journey',
		terrain: 'Terrain',
		terrains: 'Terrains',
		activity: 'Activity',
		activities: 'Activities',
		characteristic: 'Characteristic',
		characteristics: 'Characteristics',
		modifier: 'Modifier',
		modifiers: 'Modifiers',
		weather: 'Weather',
		'quarter-day': 'Quarter Day',
		morning: 'Morning',
		day: 'Day',
		evening: 'Evening',
		night: 'Night',
		season: 'Season',
		spring: 'Spring',
		summer: 'Summer',
		autumn: 'Autumn',
		winter: 'Winter',
		daylight: 'Daylight',
		darkness: 'Darkness',
		icy: 'Icy',
		cold: 'Cold',
		snowfall: 'Snowfall',
		wind: 'Wind',
		population: 'Population',
		mission: 'Mission',
		missions: 'Missions',
		allegiance: 'Allegiance',
		orbit: 'Orbit',
		faction: 'Faction',
		factions: 'Factions',
		event: 'Event',
		'alien-mission': 'Mission',
		'alien-missions' : 'Missions',
		'alien-event': 'Event',
		'attribute-myz-strength': 'Strength',
		'attribute-myz-agility': 'Agility',
		'attribute-myz-wits': 'Wits',
		'attribute-myz-empathy': 'Empathy',
		'attribute-fbl-strength': 'Strength',
		'attribute-fbl-agility': 'Agility',
		'attribute-fbl-wits': 'Wits',
		'attribute-fbl-empathy': 'Empathy',
		'skill-myz-endure': 'Endure',
		'skill-myz-force': 'Force',
		'skill-myz-fight': 'Fight',
		'skill-myz-sneak': 'Sneak',
		'skill-myz-sneak-underground': 'Sneak underground',
		'skill-myz-move': 'Move',
		'skill-myz-move-underground': 'Move underground',
		'skill-myz-move-underwater': 'Move underwater',
		'skill-myz-shoot': 'Shoot',
		'skill-myz-scout': 'Scout',
		'skill-myz-comprehend': 'Comprehend',
		'skill-myz-know-the-zone': 'Know the Zone',
		'skill-myz-sense-emotion': 'Sense Emotion',
		'skill-myz-manipulate': 'Manipulate',
		'skill-myz-heal': 'Heal',
		'skill-myz-jury-rig': 'Zusammenschustern',
		'skill-fbl-might': 'Might',
		'skill-fbl-endurance': 'Endurance',
		'skill-fbl-melee': 'Melee',
		'skill-fbl-crafting': 'Crafting',
		'skill-fbl-sneak': 'Stealth',
		'skill-fbl-sleightofhand': 'Sleight of Hand',
		'skill-fbl-move': 'Move',
		'skill-fbl-marksmanship': 'Marksmanship',
		'skill-fbl-scout': 'Scouting',
		'skill-fbl-lore': 'Lore',
		'skill-fbl-survival': 'Survival',
		'skill-fbl-insight': 'Insight',
		'skill-fbl-manipulation': 'Manipulation',
		'skill-fbl-performance': 'Performance',
		'skill-fbl-healing': 'Healing',
		'skill-fbl-animalhandling': 'Animal Handling',
		range: 'Range',
		'range-myz-arm': 'Arm',
		'range-myz-near': 'Near',
		'range-myz-short': 'Short',
		'range-myz-long': 'Long',
		'range-myz-distant': 'Distant',
		'range-fbl-arm': 'Arm',
		'range-fbl-near': 'Near',
		'range-fbl-short': 'Short',
		'range-fbl-long': 'Long',
		'range-fbl-distant': 'Distant',
		'range-coriolis-close': 'Close',
		'range-coriolis-short': 'Short',
		'range-coriolis-long': 'Long',
		'range-coriolis-extreme': 'Extreme',
		'range-alien-engaged': 'Engaged',
		'range-alien-short': 'Short',
		'range-alien-medium': 'Medium',
		'range-alien-long': 'Long',
		'range-alien-extreme': 'Extreme',
		'terrain-movement-open': 'Open',
		'terrain-movement-difficult': 'Difficult',
		'terrain-movement-requires-raft': 'Requires raft',
		'terrain-movement-requires-boat-or-raft': 'Requires boat or raft',
		'terrain-movement-requires-boat': 'Requires boat',
		'terrain-movement-impassable': 'Impassable',
		'terrain-plains': 'Plains',
		'terrain-forest': 'Forest',
		'terrain-dark-forest': 'Dark Forest',
		'terrain-hills': 'Hills',
		'terrain-mountains': 'Mountains',
		'terrain-high-mountains': 'High Mountains',
		'terrain-lake': 'Lake',
		'terrain-river': 'River',
		'terrain-marshlands': 'Marshlands',
		'terrain-quagmire': 'Quagmire',
		'terrain-ruins': 'Ruins',
		'terrain-tundra': 'Tundra',
		'terrain-ice-cap': 'Ice Cap',
		'terrain-beneath-the-ice': 'Beneath The Ice',
		'terrain-ice-forest': 'Ice Forest',
		'terrain-ocean': 'Ocean',
		'terrain-sea-ice': 'Sea Ice',
		'carkthreat-description': 'Draws a random threat against the Ark.',
		'carkthreat-title': 'Threat Against the Ark',
		'cartifact-description': 'Draws a random artifact from the MYZ core rulebook. Available additional sources are (combine one or more):'
			+ '\n• `myz` – Mutant: Year Zero (default if none are specified)'
			+ '\n• `gla` – Mutant: GenLab Alpha'
			+ '\n• `mek` – Mutant: Mechatron'
			+ '\n• `ely` – Mutant: Elysium'
			+ '\n• `astra` – Mutant: Ad Astra'
			+ '\nMetaplot items are removed by default. Use `meta` to add them to the stack.'
			+ '\nUse `all` to pick from all book sources (including metaplot items).',
		'cartifact-not-found': 'I\'m sorry, no artifact was found within this unknown package!',
		'cattack-description': 'Rolls a random attack from a monster.',
		'cattack-moredescriptions': [
			[
				'Arguments',
				`• \`game\` – Specifies the game you are using. Can be omitted.
				• \`name\` – Specifies the monster you want to fetch.
				• \`number\` – Specifies the desired attack instead of choosing a random one.
				• \`-private|-p\` – Sends the message in a private DM.`,
			],
			[
				'Reaction Menu',
				`• Click ⚔️ to roll the dice of the attack.
				• Click ☠️ to roll the critical (some attacks have fixed crits, others are random).
				• Click ❌ to stop the reaction menu.`,
			],
		],
		'cbr-description': 'Prints a scene break.',
		'ccast-description': 'Cast a spell. Use the `-mishap` parameter if you want a specific mishap.',
		'ccast-title': 'Spell Casting',
		'ccast-invalid-mishap-reference': 'Invalid Magic Mishap\'s reference!',
		'ccast-invalid-power-level': 'Invalid Power Level!',
		'ccharacter-description': 'Manages your characters.',
		'ccharacter-moredescriptions': [
			[
				'Subcommands',
				'• `sheet` – Prints the embed sheet of your currently active character.'
				+ '\n• `list` – Lists your characters.'
				+ '\n• `update [-v]` – Updates your current character sheet. The `-v` argument displays an embed sheet.'
				+ '\n• `delete` – Deletes a character.',
			],
		],
		'ccolony-description': 'Generates a colonized planet for the Alien RPG.',
		'ccolony-moredescriptions': [
			[
				'Arguments',
				'• `name` - Specifies a custom colony name.'
				+ '\n• `type` - Specifies the planet type (default is "rocky").'
				+ '\n> Choices: rocky, icy, gasgiant, gasgiant-moon, asteroid-belt'
				+ '\n• `location` - Specifies if the colony belongs to the independent `core` system colonies or the american or anglo-japanese `arm`'
			]
		],
		'ccrit-description': 'Rolls for a random critical injury. Use the `-private` argument to send the result in a DM.',
		'ccrit-moredescriptions': [
			[
				'Arguments',
				'There are three main arguments you can use with this command in any order:'
				+ '\n• `game` – Specifies the game you are using. Can be omitted if you set it with `!setconf game [default game]`.'
				+ `\n> Choices: \`${SUPPORTED_GAMES.join('`, `')}\`.`
				+ '\n• `table` – Specifies the table you want from this game. See below for possible options *(default is "damage")*.'
				+ '\n• `numeric` – Specifies a fixed reference.',
			],
			[
				'☢️ Mutant: Year Zero',
				'• `dmg` | `damage` : Critical injuries from damage.'
				+ '\n• `h` | `horror` : The *Forbidden Lands* Horror traumas, adapted for MYZ.'
				+ '\n• `nt` | `nontypical` : Critical injury for non-typical damage.'
				+ '\n• `p` | `pushed` : Critical injury for pushed damage (none).',
			],
			[
				'⚔️ Forbidden Lands',
				'• `sl` | `slash` : Critical injuries due to Slash wounds.'
				+ '\n• `bl` | `blunt` : Critical injuries due to Blunt force.'
				+ '\n• `st` | `stab` : Critical injuries due to Stab wounds.'
				+ '\n• `h` | `horror` : Horror traumas.'
				+ '\n• `nt` | `nontypical` : Critical injury for non-typical damage.'
				+ '\n• `p` | `pushed` : Critical injury for pushed damage (none).'
				+ '\n• Add `-lucky [rank]` instead of the fixed reference to use the talent (rank is optional, default is 1).',
			],
			[
				'👾 ALIEN',
				'• `dmg` | `damage` : Critical injuries from damage.'
				+ '\n• `s`, `synth` | `synthetic` : Critical injuries on Synthetics and Androids.'
				+ '\n• `x` | `xeno` : Critical injuries for Xenomorphs.'
				+ '\n• `m` | `mental` : Permanent mental traumas.',
			],
			[
				'🌟 Coriolis: The Third Horizon',
				'• `dmg` | `damage` : Critical injuries from damage.'
				+ '\n• `at` | `atypical` : Critical injury for atypical damage.',
			],
		],
		'ccrit-too-many-arguments': 'You typed too many arguments! See `help crit` for the correct usage.',
		'ccrit-no-table-for-game-start': 'There is no critical table for the',
		'ccrit-no-table-for-game-end': 'roleplaying game in my database',
		'ccrit-table-not-found-start': 'There is no',
		'ccrit-table-not-found-end': 'critical table for',
		'ccrit-not-found': 'The critical injury wasn\'t found',
		'ccrit-lethality-start': 'This critical injury is **LETHAL** and must be HEALED',
		'ccrit-lethality-healmalus': ' (modified by',
		'ccrit-lethality-timelimit-multiple': ' within the next',
		'ccrit-lethality-timelimit-single': ' within **one',
		'ccrit-lethality-end': ' or the character will die.',
		'ccritalien-description': 'Rolls for a random critical injury.'
			+ '\nType `help crit` for more details.',
		'ccritcoriolis-description': 'Rolls for a random critical injury.'
			+ '\nType `help crit` for more details.',
		'ccritfbl-description': 'Rolls for a random critical injury.'
			+ '\nType `help crit` for more details.',
		'ccritmyz-description': 'Rolls for a random critical injury.'
			+ '\nType `help crit` for more details.',
		'cdemon-description': 'Generates a random demon according to the tables found in'
			+ ' the *Forbidden Lands - Gamemaster\'s Guide*.'
			+ '\nNote: all bonuses from the demon\'s abilities are not computed into its stats/armor/skills.'
			+ '\nNote: the attacks output is not optimal on a small screen (smartphone).',
		'cdrawinit-description': 'Draws one or more initiative cards. The deck is specific to each Discord server.\n\n'
			+ `__Parameter__
			• \`[speed]\` – Number of initiative cards to draw. Default: 1.

			__Arguments__
			• \`[-haste <value>]\` – Draws more initiative cards and keeps the best one. The other are shuffled back into the deck before others draw their cards. Use this for special talents like *Lightning Fast*. Default: 1.
			• \`[-shuffle]\` – Resets the deck. *(Which is probably needed at the beginning of every new encounter.)*`,
		'cdrawinit-deck-too-small': 'The size of the *Initiative* deck is too small.',
		'cdrawinit-shuffled': 'Shuffled a new deck of *Initiative* cards.',
		'cdrawinit-hastepool': 'Shuffled back into the deck because of haste',
		'cdrawmutation-description': 'Draws a random mutation from the MYZ core rulebook. Available additional sources are:'
			+ '\n• `gla` – Adds *Mutant: GenLab Alpha* mutations'
			+ '\n• `zc2` – Adds *Zone Compendium 2: Dead Blue Sea* mutations'
			+ '\n• `zc5` – Adds *Zone Compendium 5: Hotel Imperator* mutations'
			+ '\n• `psi` – Draws only from Psionic/mental mutations'
			+ '\nUse `all` to pick from all book sources.',
		'cembed-description': 'Creates an embed message. Both the title and the description of the embed are mandatory and must be separated by an `|` horizontal bar character.',
		'cembed-invalid-arguments': 'Invalid arguments. Try',
		'cembed-empty-title': 'Embed\'s `title` is empty',
		'cembed-empty-description': 'Embed\'s `description` is empty',
		'cferal-description': 'Rolls dice for a GenLab Alpha Animal Power and checks for any Feral Effect.',
		'chelp-description': 'Lists all available commands. If a command\'s name is specified, prints more info about that specific command instead.',
		'chelp-command-list-title': 'List of Commands',
		'chelp-command-list-start': 'Type',
		'chelp-command-list-middle': 'to get the list of all commands.' + '\nType',
		'chelp-command-list-end': 'to get info on a specific command',
		'chelp-sent-dm': 'I\'ve sent you a DM with all my commands!',
		'chelp-dm-error': 'It seems like I can\'t DM you! Do you have DMs disabled?',
		'chelp-invalid-command': 'That\'s not a valid command!',
		'cimportcharacter-description': 'Imports a character sheet. The `-v` argument displays an embed sheet.',
		'cimportcharacter-invalid-url': 'Invalid URL',
		'cimportcharacter-importing': 'Importing character...',
		'cimportcharacter-could-not-retrieve': 'Could not retrieve character from',
		'cimportcharacter-success': 'was successfully imported!',
		'cinit': 'TODO',
		'cinvite-description': 'Prints a link to invite Sebedius to your server.',
		'cinvite-title': 'Sebedius Invite',
		'cinvite-text': 'You can invite Sebedius to your server here',
		'cjob': 'TODO',
		'cjourney-description': 'Performs a *Forbidden Lands* Journey.'
			+ '\nWith this command, you can **Create** a Journey with defined *Quarter Day*, *Season* and *Terrain* to display information about the roll modifiers and the available activities. Players can then use a reaction menu to choose their activity as a reminder for the GM.'
			+ '\nYou can also draw a random **Mishap** for a failed activity.'
			+ '\nWeather effects and Mishaps tables for *The Bitter Reach* are also available.',
		'cjourney-moredescriptions': [
			[
				'Subcommands',
				'• `create|c` or `-create|-c` – Creates a Journey.'
				+ '\n• `mishap|m` or `-mishap|-m` – Draws a random Journey mishap.'
				+ '\n• `help` – Displays this help.',
			],
			[
				'Create: `!journey  create|c  [QUARTER_DAY] [SEASON] [TERRAIN] [arguments...]`',
				'`[QUARTER_DAY]` – Defines the current **Quarter of Day**. Available options are: `morning`, `day` *(default)*, `evening` and `night`.'
				+ '\n• `-quarter|-q|-d|-quarterday|-qd [search]` – Prompts a menu to choose a **Quarter of Day** option, filtered by what you provided in the `[search]` parameter.'
				+ '\n• `[SEASON]` – Defines the current **Season**. Available options are: `spring` *(default)*, `summer`, `autumn` and `winter`.'
				+ '\n• `-season|-s [search]` – Prompts a menu.'
				+ '\n• `[TERRAIN]` – Defines the current **Terrain** type. Available options are: `plains` *(default)*, `forest`, `dark_forest`, `hills`, `mountains`, `high_mountains`, `lake`, `river`, `ocean`, `marshlands`, `quagmire`, `ruins`, *(Bitter Reach)* `tundra`, `ice_cap`, `beneath_the_ice`, `ice_forest` and `sea_ice`.'
				+ '\n• `-terrain|-t [search]` – Prompts a menu.'
				+ '\n• `...arguments` – See other common arguments below.',
			],
			[
				'Mishap: `!journey  mishap|m  [activity] [...arguments]`',
				'Possible activities that have Mishaps: '
				+ '`' + YZJourney.Activities
					.filter(a => a.mishap)
					.array()
					.map(a => a.tag)
					.join('`, `')
					.toLowerCase() + '`'
				+ '\n*If no activity is specified, the bot prompts a menu to choose one (filtered by partial words you may have provided).*',
			],
			[
				'Other Common Arguments',
				'• `-fbr|-bitterreach|-snow|-ice` – Uses *Forbidden Lands: The Bitter Reach* Mishaps tables and draws random *Bitter Reach* weather effects.'
				+ '\n • `-name|-title|-n <title>` – Defines a title.'
				+ '\n • `-lang|-language|-lng <language_code>` – Uses a different language. See `setconf` command for available options.',
			],
		],
		'cjourney-activity-mishap-mismatch': 'Choose an **Activity** with a **Mishap**',
		'cjourney-choose-subcommand': 'Please choose a subcommand `create`, `mishap` or `help`.',
		'cjourney-choose-quarterday': 'Choose a **Quarter Day**',
		'cjourney-choose-season': 'Choose a **Season**',
		'cjourney-choose-terrains': 'Choose a **Terrain**',
		'cjourney-choose-activity': 'Choose an **Activity**',
		'cjourney-generic-description': 'Choose an Activity and roll for `SURVIVAL`.',
		'cjourney-movement-modifier-open': 'On foot: 2 Hexagons / Quarter\nOn Horse-back: 3 Hexagons / Quarter',
		'cjourney-movement-modifier-difficult': 'On foot: 1 Hexagon / Quarter\nOn Horse-back: 1 Hexagon / Quarter',
		'cjourney-movement-modifier-boat': 'On boat: 2 hexagons / Quarter',
		'croll-description': 'Rolls dice for any Year Zero roleplaying game.',
		'croll-moredescriptions': [
			[
				'Select [game]',
				'This argument is used to specify the skin of the rolled dice.'
				+ ' Can be omitted if you set it with `!setconf game [default game]` or if you use one of the shortcut commands'
				+ `\n Choices: \`${SUPPORTED_GAMES.join('`, `')}\`.`,
			],
			[
				'Rolling Simple Dice',
				'`roll d6|d66|d666` – Rolls a D6, D66, or D666.'
				+ '\n`roll XdY±Z` – Rolls X dice of range Y, modified by Z.'
				+ '\n`roll init` – Rolls initiative (one D6).',
			],
			[
				'Rolling Year Zero Dice',
				'Use a number in any combinations with these letters:'
				+ '\n• `b` – Base dice (attributes)'
				+ '\n• `s` – Skill dice (or Stress dice for *Alien RPG*)'
				+ '\n• `n` – Negative dice (*MYZ* and *FBL* only)'
				+ '\n• `g` – Gear dice (*MYZ* and *FBL* only)'
				+ '\n• `d` – Generic dice (or Ammo dice for *Twilight 2000*)'
				+ '\n• `a` – Ammo dice (*Twilight 2000* only)'
				+ '\n• `a8` – D8 Artifact die (see *FBL*)'
				+ '\n• `a10` – D10 Artifact die (see *FBL*)'
				+ '\n• `a12` – D12 Artifact die (see *FBL*)'
				+ '\n\n*Example:* `roll 5b 3s 2g`',
			],
			[
				'Additional Arguments',
				'Additional options for the roll:'
				+ '\n`-name|-n|-#|# <name>` : Defines a name for the roll.'
				+ '\n`-push|-p <number>` : Changes the maximum number of allowed pushes.'
				+ '\n`-fullauto|-fa|-f` : "Full-auto", unlimited number of pushes (max 10).'
				+ '\n`-mod <±X>`: Applies a difficulty modifier of `+X` or `-X` to the roll.'
				+ '\n`-pride` : Adds a D12 Artifact Die to the roll.'
				+ '\n`-nerves` : Applies the talent *Nerves of Steel* (Alien RPG).'
				+ '\n`-minpanic <value>` : Adjusts a minimum treshold for multiple consecutive panic effects (Alien RPG).'
				+ '\n`-lang <language_code>` : Changes the desired language.',
			],
			[
				'More Info',
				`To push the roll, click the ${Config.commands.roll.pushIcon} reaction icon under the message.`
				+ ' The push option for the dice pool roll is available for 2 minutes. Only the user who initially rolled the dice can push them.'
				+ '\nTo clear the reaction menu, click the ❌ reaction icon.'
				+ '\nCoriolis has more push options: 🙏 (Praying the Icons, +1D) and 🕌 (in a chapel, +2D).'
				+ `\nMax ${Config.commands.roll.max} dice can be rolled at once. If you try to roll more, it won't happen.`,
			],
			[
				'See Also',
				'The following commands are shortcuts if you don\'t want to specify the [game] parameter each time.'
				+ '\n`rm` – Rolls *Mutant: Year Zero* dice.'
				+ '\n`rf` – Rolls *Forbidden Lands* dice.'
				+ '\n`rt` – Rolls *Tales From The Loop* dice.'
				+ '\n`rc` – Rolls *Coriolis* dice.'
				+ '\n`ra` – Rolls *Alien RPG* dice.'
				+ '\n`rv` – Rolls *Vaesen* dice.'
				+ '\n`rw` – Rolls *Twilight 2000 4E* dice.',
			],
		],
		'croll-ammo-spent': 'Ammo Spent',
		'croll-generic-roll': 'Generic Roll',
		'croll-single-roll': 'Single D6 / D66 / D666 Roll',
		'malien-xeno-bloodburster': 'Bloodburster',
		'malien-xeno-neophyte': 'Juvenile Neomorph (Neophyte)',
		'malien-xeno-neomorph': 'Adult Neomorph',
		'malien-xeno-ovomorph': 'Ovomorph (Egg)',
		'malien-xeno-queenegg': 'Queen\'s Egg',
		'malien-xeno-facehugger': 'Facehugger',
		'malien-xeno-praetofacehugger': 'Praeto-Facehugger',
		'malien-xeno-royalfacehugger': 'Royal Facehugger',
		'malien-xeno-chestburster': 'Chestburster',
		'malien-xeno-bambiburster': 'Bambi Burster',
		'malien-xeno-imp': 'Imp',
		'malien-xeno-queenburster': 'Queenburster',
		'malien-xeno-stalker': 'Stalker',
		'malien-xeno-scout': 'Scout',
		'malien-xeno-drone': 'Drone',
		'malien-xeno-soldier': 'Soldier',
		'malien-xeno-worker': 'Worker',
		'malien-xeno-sentry': 'Sentry',
		'malien-xeno-praetorian': 'Praetorian',
		'malien-xeno-crusher': 'Crusher',
		'malien-xeno-queen': 'Queen',
		'malien-swarm': 'The Swarm',
		'malien-adultharvester': 'Harvester',
		'malien-juvenileharvester': 'Harvester Juvenile',
		'malien-lionworm': 'Lion Worm',
		'malien-scorpionid-onland': 'Tanakan Scorpionid (On Land)',
		'malien-scorpionid-inwater': 'Tanakan Scorpionid (In Water)',
		'mmyz-humanoid-amnesiac': 'Amnesiac',
		'mmyz-humanoid-cannibal': 'Cannibal',
		'mmyz-humanoid-beastmutant-dog': 'Beast Mutant - Dog',
		'mmyz-humanoid-beastmutant-bear': 'Beast Mutant - Bear',
		'mmyz-humanoid-beastmutant-rodent': 'Beast Mutant - Rodent',
		'mmyz-humanoid-beastmutant-monkey': 'Beast Mutant - Monkey',
		'mmyz-humanoid-doomcultist': 'Doom Cultist',
		'mmyz-humanoid-exiledmutant': 'Exiled Mutant',
		'mmyz-humanoid-helldriver': 'Helldriver',
		'mmyz-humanoid-morlock': 'Morlock',
		'mmyz-humanoid-novacultist': 'Nova Cultist',
		'mmyz-humanoid-scraporacle': 'Scrap Oracle',
		'mmyz-humanoid-wanderer': 'Wanderer',
		'mmyz-humanoid-watertrader': 'Water Trader',
		'mmyz-humanoid-wrecker': 'Wrecker',
		'mmyz-humanoid-zoneghoul': 'Zone Ghoul',
		'mmyz-monster-acidgrass': 'Acid Grass',
		'mmyz-monster-airjellies': 'Air Jellies',
		'mmyz-monster-automaton': 'Automaton',
		'mmyz-monster-bitterbeast': 'Bitterbeast',
		'mmyz-monster-deathworm': 'Deathworm',
		'mmyz-monster-devourer': 'Devourer',
		'mmyz-monster-grazer': 'Grazer',
		'mmyz-monster-gutfish': 'Gutfish',
		'mmyz-monster-killertree': 'Killer Tree',
		'mmyz-monster-killertree-seedpod': 'Seedpod',
		'mmyz-monster-mindmosquitoes': 'Mind Mosquitoes',
		'mmyz-monster-nightmareflowers': 'Nightmare Flowers',
		'mmyz-monster-parasitefungus': 'Parasite Fungus',
		'mmyz-monster-razorback': 'Razorback',
		'mmyz-monster-rotants': 'Rot Ants',
		'mmyz-monster-rotfish': 'Rot Fish',
		'mmyz-monster-scrapcrows': 'Scrap Crows',
		'mmyz-monster-trashhawk': 'Trash Hawk',
		'mmyz-monster-wormswarm': 'Worm Swarm',
		'mmyz-monster-zonedogs': 'Zone Dogs',
		'mmyz-monster-zonerats': 'Zone Rats',
		'mmyz-monster-zonespider': 'Zone Spider',
		'mmyz-monster-zonewasps': 'Zone Wasps',
		'mmyz-monster-zoneleeches': 'Zone Leeches',
		'mgla-creeper': 'Creeper',
		'mgla-creeper-model-two': 'Creeper Model II "Webshooter"',
		'mgla-creeper-model-three': 'Creeper Model III "Black Widow"',
		'wmyz-assaultrifle': 'Assault Rifle',
		'wmyz-baseballbat-spiked': 'Spiked Baseball Bat',
		'wmyz-baseballbat-wooden': 'Baseball Bat',
		'wmyz-bicyclechain': 'Bicycle Chain',
		'wmyz-bluntinstrument': 'Blunt Instrument',
		'wmyz-bow': 'Bow',
		'wmyz-brassknuckles': 'Brass Knuckles',
		'wmyz-chainknife': 'Chain Knife',
		'wmyz-chainsaw': 'Chainsaw',
		'wmyz-compoundbow': 'Compound Bow',
		'wmyz-crossbow': 'Crossbow',
		'wmyz-decapitator': 'Decapitator',
		'wmyz-emprifle': 'EMP Rifle',
		'wmyz-flamethrower': 'Flamethrower',
		'wmyz-flaregun': 'Flare Gun',
		'wmyz-gausspistol': 'Gauss Pistol',
		'wmyz-gaussrifle': 'Gauss Rifle',
		'wmyz-grenade-energy': 'Energy Grenade',
		'wmyz-grenade-frag': 'Frag Grenade',
		'wmyz-grenade-hand': 'Hand Grenade',
		'wmyz-gyrojetcarbine': 'Gyrojet Carbine',
		'wmyz-gyrojetpistol': 'Gyrojet Pistol',
		'wmyz-harpoonpistol': 'Harpoon Pistol',
		'wmyz-harpoonrifle': 'Harpoon Rifle',
		'wmyz-huntingrifle': 'Hunting Rifle',
		'wmyz-improvisedexplosive': 'Improvised Explosive',
		'wmyz-katana': 'Katana',
		'wmyz-lasercannon': 'Laser Cannon',
		'wmyz-laserpistol': 'Laser Pistol',
		'wmyz-laserrifle': 'Laser Rifle',
		'wmyz-laserwelder': 'Laser Welder',
		'wmyz-machete': 'Machete',
		'wmyz-maserpistol': 'Maser Pistol',
		'wmyz-molotovcocktail': 'Molotov Cocktail',
		'wmyz-nailgun': 'Nail Gun',
		'wmyz-oldagespeargun': 'Old Age Speargun',
		'wmyz-pickaxe': 'Pick Axe',
		'wmyz-plasmarifle': 'Plasma Rifle',
		'wmyz-pulselaser': 'Pulse Laser',
		'wmyz-revolver': 'Revolver',
		'wmyz-rock-thrown': 'Thrown Rock',
		'wmyz-rustychain': 'Rusty Chain',
		'wmyz-scrapaxe': 'Scrap Axe',
		'wmyz-scrapcannon': 'Scrap Cannon',
		'wmyz-scrapcrossbow': 'Scrap Crossbow',
		'wmyz-scrapderringer': 'Scrap Derringer',
		'wmyz-scrapflamethrower': 'Scrap Flamethrower',
		'wmyz-scrapknife': 'Scrap Knife',
		'wmyz-scrapmachete': 'Scrap Machete',
		'wmyz-scrappistol': 'Scrap Pistol',
		'wmyz-scraprifle': 'Scrap Rifle',
		'wmyz-scrapshiv': 'Scrap Shiv/Shank',
		'wmyz-scrapshotgun': 'Scrap Shotgun',
		'wmyz-scrapsledgehammer': 'Scrap Sledgehammer',
		'wmyz-scrapspear': 'Scrap Spear',
		'wmyz-semiautopistol': 'Semi-auto Pistol',
		'wmyz-shotgun-doublebarrel': 'Double-barreled Shotgun',
		'wmyz-shotgun-pumpaction': 'Pump-action Shotgun',
		'wmyz-slingshot': 'Slingshot',
		'wmyz-studdedwoodenclub': 'Studded Wooden Club',
		'wmyz-stunbaton': 'Stun Baton',
		'wmyz-stungun': 'Stun Gun',
		'wmyz-tasergun': 'Taser Gun',
		'wmyz-ultrasoniccarbine': 'Ultrasonic Carbine',
		'wmyz-unarmed': 'Unarmed',
		'wmyz-vibroknife': 'Vibroknife',
		'wmyz-whaleharpoon': 'Whale Harpoon',
		'wmyz-wrench': 'Wrench',
	},
	de: {
		none: 'Ohne',
		unknown: 'Unbekannt',
		damage: 'Schaden',
		name: 'Name',
		aliases: 'Aliase',
		usage: 'Verwendung',
		description: 'Beschreibung',
		table: 'Tabelle',
		possessives: 's',
		game: 'Spiel',
		ability: 'Fähigkeit',
		abilities: 'Fähigkeiten',
		attack: 'Angriff',
		attacks: 'Angriffe',
		attribute: 'Attribut',
		attributes: 'Attribute',
		armor: 'Rüstung',
		'armor-rating': 'Rüstungswert',
		artifact: 'Artefakt',
		body: 'Körper',
		demon: 'Dämon',
		'signature-attacks': 'Angriffe',
		skill: 'Fertigkeit',
		skills: 'Fertigkeiten',
		source: 'Quelle',
		special: 'Spezial',
		weakness: 'Schwäche',
		weaknesses: 'Schwächen',
		clip: 'Magazin',
		fullauto: 'Automatikfeuer',
		light: 'Leicht',
		heavy: 'Schwer',
		energy: 'Energie',
		'armor-piercing': 'Panzerbrechend',
		explosive: 'Explosiv',
		'blast-power': 'Sprengkraft',
		rot: 'Fäulnis',
		mounted: 'Montiert',
		fire: 'Feuer',
		barrels: 'Läufe',
		'jury-rigged': 'Gebastelt',
		base: 'Basis',
		'base-dice': 'Basiswürfel',
		'base-power-level': 'Basis-Machtstufe',
		overcharging: 'Überladen',
		'magic-mishap': 'Magisches Missgeschick',
		permanent: 'Permanent',
		'permanent-effects': 'Diese Effekte sind permanent.',
		'healing-time': 'Heilungsdauer',
		'healing-time-until-end-text': 'Tage bis zum Ende der Effekte.',
		lethality: 'Tödlich',
		'selection-title': 'Mehrere Einträge gefunden',
		'selection-description': 'Nach welchem hast du gesucht?',
		'selection-instructions': 'Schreibe deine Antwort in den Kanal, aus welchem du diesen Befehl aufgrufen hast. '
			+ 'Diese Nachricht hast du als Direktnachricht erhalten um die Auswahlmöglichkeiten zu verstecken (z.B. die Monsternamen).',
		success: 'Erfolg',
		successes: 'Erfolge',
		trauma: 'Trauma',
		traumas: 'Traumas',
		'gear-damage': 'Ausrüstungsschaden',
		'extra-hit': 'Extra Treffer',
		'extra-hits': 'Extra Treffer',
		suppression: 'Suppression',
		suppressions: 'Suppressions',
		mishap: 'Missgeschick',
		panic: 'Panik',
		details: 'Details',
		pushed: 'Strapaziert',
		initiative: 'Initiative',
		pride: 'Stolz',
		page: 'Seite',
		instructions: 'Anleitung',
		mutation: 'Mutation',
		journey: 'Reise',
		terrain: 'Gelände',
		terrains: 'Gelände',
		activity: 'Aktivität',
		activities: 'Aktivitäten',
		characteristic: 'Eigenschaft',
		characteristics: 'Eigenschaften',
		modifier: 'Modifikator',
		modifiers: 'Modifikatoren',
		weather: 'Wetter',
		'quarter-day': 'Tagesabschnitt',
		morning: 'Morgen',
		day: 'Tag',
		evening: 'Abend',
		night: 'Nacht',
		season: 'Jahreszeit',
		spring: 'Frühling',
		summer: 'Sommer',
		autumn: 'Herbst',
		winter: 'Winter',
		daylight: 'Tageslicht',
		darkness: 'Dunkelheit',
		icy: 'Eiskalt',
		cold: 'Kälte',
		snowfall: 'Schneefall',
		wind: 'Wind',
		population: 'Bevölkerung',
		mission: 'Mission',
		missions: 'Missionen',
		allegiance: 'Zugehörigkeit',
		orbit: 'Orbit',
		faction: 'Fraktion',
		factions: 'Fraktionen',
		event: 'Ereignis',
		'alien-mission': 'Aufgabe',
		'alien-missions' : 'Aufgaben',
		'alien-event': 'Handlungsaufhänger',
		'attribute-myz-strength': 'Stärke',
		'attribute-myz-agility': 'Geschicklichkeit',
		'attribute-myz-wits': 'Verstand',
		'attribute-myz-empathy': 'Empathie',
		'attribute-fbl-strength': 'Stärke',
		'attribute-fbl-agility': 'Geschicklichkeit',
		'attribute-fbl-wits': 'Verstand',
		'attribute-fbl-empathy': 'Empathie',
		'skill-myz-endure': 'Erdulden',
		'skill-myz-force': 'Kraftakt',
		'skill-myz-fight': 'Prügeln',
		'skill-myz-sneak': 'Schleichen',
		'skill-myz-sneak-underground': 'Schleichen (unterirdisch)',
		'skill-myz-move': 'Bewegen',
		'skill-myz-move-underground': 'Bewegen (unterirdisch)',
		'skill-myz-move-underwater': 'Bewegen (Unterwasser)',
		'skill-myz-shoot': 'Schießen',
		'skill-myz-scout': 'Auskundschaften',
		'skill-myz-comprehend': 'Begreifen',
		'skill-myz-know-the-zone': 'Zonenkunde',
		'skill-myz-sense-emotion': 'Emotionsgespür',
		'skill-myz-manipulate': 'Manipulieren',
		'skill-myz-heal': 'Heilen',
		'skill-myz-jury-rig': 'Zusammenschustern',
		'skill-fbl-might': 'Kraft',
		'skill-fbl-endurance': 'Stärke',
		'skill-fbl-melee': 'Nahkampf',
		'skill-fbl-crafting': 'Handwerk',
		'skill-fbl-sneak': 'Heimlichkeit',
		'skill-fbl-sleightofhand': 'Fingerfertigkeit',
		'skill-fbl-move': 'Bewegen',
		'skill-fbl-marksmanship': 'Fernkampf',
		'skill-fbl-scout': 'Auskundschaften',
		'skill-fbl-lore': 'Wissen',
		'skill-fbl-survival': 'Überleben',
		'skill-fbl-insight': 'Menschenkenntnis',
		'skill-fbl-manipulation': 'Manipulation',
		'skill-fbl-performance': 'Darbietung',
		'skill-fbl-healing': 'Heilen',
		'skill-fbl-animalhandling': 'Tierkunde',
		range: 'Reichweite',
		'range-myz-arm': 'Arm',
		'range-myz-near': 'Nah',
		'range-myz-short': 'Kurz',
		'range-myz-long': 'Weit',
		'range-myz-distant': 'Extrem',
		'range-fbl-arm': 'Arm',
		'range-fbl-near': 'Nah',
		'range-fbl-short': 'Kurz',
		'range-fbl-long': 'Weit',
		'range-fbl-distant': 'Extrem',
		'range-coriolis-close': 'Nah',
		'range-coriolis-short': 'Kurz',
		'range-coriolis-long': 'Weit',
		'range-coriolis-extreme': 'Extrem',
		'range-alien-engaged': 'Kontakt',
		'range-alien-short': 'Kurz',
		'range-alien-medium': 'Mittel',
		'range-alien-long': 'Weit',
		'range-alien-extreme': 'Extrem',
		'terrain-movement-open': 'Offen',
		'terrain-movement-difficult': 'Schwierig',
		'terrain-movement-requires-raft': 'Erfordert Floß',
		'terrain-movement-requires-boat-or-raft': 'Erfordert Boot oder Floß',
		'terrain-movement-requires-boat': 'Erfordert Boot',
		'terrain-movement-impassable': 'Unpassierbar',
		'terrain-plains': 'Ebenen',
		'terrain-forest': 'Wald',
		'terrain-dark-forest': 'Tiefer Wald',
		'terrain-hills': 'Hügel',
		'terrain-mountains': 'Gebirge',
		'terrain-high-mountains': 'Hochgebirge',
		'terrain-lake': 'See',
		'terrain-river': 'Fluss',
		'terrain-marshlands': 'Marschland',
		'terrain-quagmire': 'Sumpf',
		'terrain-ruins': 'Ruinen',
		'terrain-tundra': 'Tundra',
		'terrain-ice-cap': 'Eisdecke',
		'terrain-beneath-the-ice': 'Unter dem Eis',
		'terrain-ice-forest': 'Eiswald',
		'terrain-ocean': 'Meer',
		'terrain-sea-ice': 'Meeres-Eis',
		'carkthreat-description': 'Zieht eine zufällige Bedrohung für die Arche.',
		'carkthreat-title': 'Bedrohung für die Arche',
		'cartifact-description': 'Zieht ein zufälliges Artefakt aus dem MYZ Grundregelwerk. Weitere verfügbare Quellbücher sind (es können mehrere kombiniert werden):'
			+ '\n• `myz` – Mutant: Jahr Null (Standard falls nichts angegeben wurde)'
			+ '\n• `gla` – Mutant: Genlabor Alpha'
			+ '\n• `mek` – Mutant: Mechatron'
			+ '\n• `ely` – Mutant: Elysium'
			+ '\n• `astra` – Mutant: Ad Astra'
			+ '\nMetaplot-Gegenstände sind standardmäßig nicht enthalten. Nutze `meta` um sie dem Stapel hinzuzufügen.'
			+ '\nMit `all` wird aus allen Quellenbüchern gezogen (inklusive Metaplot-Gegenständen).',
		'cartifact-not-found': 'Entschuldigung, es wurde kein Artefakt in diesem unbekannten Quellenbuch gefunden!',
		'cattack-description': 'Würfelt einen zufälligen Angriff eines Monsters.',
		'cattack-moredescriptions': [
			[
				'Parameter',
				`• \`game\` – Gibt das genutzte Spiel an. Kann ausgelassen werden.
				• \`name\` – Gibt das Monster an, das abgerufen werden soll.
				• \`number\` – Gibt den gewünschten Angriff an, anstatt eines zufälligen.
				• \`-private|-p\` – Sendet das Ergebnis in einer Direktnachricht.`,
			],
			[
				'Reaktionenmenü',
				`• Klicke ⚔️ um die Angrifsswürfel zu werden.
				• Klicke ☠️ um die kritische Verletzung zu werfen (manche Angriffe haben feste Werte, andere sind zufällig).
				• Klicke ❌ um das Reaktionenmenü zu beenden.`,
			],
		],
		'cbr-description': 'Zeigt einen Szenentrenner an (Leerzeile).',
		'ccast-description': 'Einen Zauber wirken. Mit dem `-mishap`-Parameter kann ein spezifisches magisches Missgeschick ausgewählt werden.',
		'ccast-title': 'Zauber wirken',
		'ccast-invalid-mishap-reference': 'Ungültiger \'Magisches Missgeschickt\'-Verweis!',
		'ccast-invalid-power-level': 'Ungültige Machtstufe!',
		'ccharacter-description': 'Verwaltet deine Charaktere.',
		'ccharacter-moredescriptions': [
			[
				'Unterbefehle',
				'• `sheet` – Zeigt das Charakterblatt deines aktuell aktiven Charakters an.'
				+ '\n• `list` – Listet deine Charaktere auf.'
				+ '\n• `update [-v]` – Aktualisiert dein aktuelles Charakterblatt. Der `-v` Parameter zeigt das Charakterblatt an.'
				+ '\n• `delete` – Löscht einen Charakter.',
			],
		],
		'ccolony-description': 'Generiert einen kolonisierten Planeten für das Alien Rollenspiel.',
		'ccolony-moredescriptions': [
			[
				'Argumente',
				'• `name` - Gibt einen eigenen Namen für die Kolonie an.'
				+ '\n• `type` - Gibt die Planetenart an (Standard ist "rocky").'
				+ '\n> Optionen: felsig: rocky, Eisplanet: icy, Gasriese: gasgiant, Gasriesen-Mond: gasgiant-moon, Asteroidengürtel: asteroid-belt'
				+ '\n• `location` - Gibt an, ob die Kolonie zu den unabhängigen Kernsystemkolonien `core` oder dem amerikanischen oder anglo-japanischen Arm `arm` gehört.'
			]
		],
		'ccrit-description': 'Würfelt eine zufällige kritische Verletzung. Nutze den `-private` Parameter um das Ergebnis in einer Direktnachricht zu erhalten.',
		'ccrit-moredescriptions': [
			[
				'Parameter',
				'Es gibt drei Hauptparamter, welche mit diesem Befehl in beliebiger Rheinfolge genutzt werden können:'
				+ '\n• `game` – Gibt das genutzte Spiel an. Kann ausgelassen werden, wenn ein Standard mit `!setconf game [default game]` gesetzt wurde.'
				+ `\n> Möglichkeiten: \`${SUPPORTED_GAMES.join('`, `')}\`.`
				+ '\n• `table` – Gibt die gewünschte Tabelle des Spiels an. Siehe unten für die Optionen *(Standard ist "damage")*.'
				+ '\n• `numeric` – Ruft einen bestimmten Eintrag aus der Tabelle ab.',
			],
			[
				'☢️ Mutant: Jahr Null (myz)',
				'• `dmg` | `damage` : Kritische Verletzungen durch Schaden.'
				+ '\n• `h` | `horror` : Die geistigen Traumata der *Verbotene Lande*, adaptiert für MYZ.'
				+ '\n• `nt` | `nontypical` : Kritische Verletzungen durch untypischen Schaden.'
				+ '\n• `p` | `pushed` : Kritische Verletzungen durch strapazierten Schaden (keine).',
			],
			[
				'⚔️ Verbotene Lande (fbl)',
				'• `sl` | `slash` : Kritische Verletzungen durch Schnittwunden.'
				+ '\n• `bl` | `blunt` : Kritische Verletzungen durch stumpfe Schläge.'
				+ '\n• `st` | `stab` : Kritische Verletzungen durch Stichwunden.'
				+ '\n• `h` | `horror` : Geistige Traumata.'
				+ '\n• `nt` | `nontypical` : Kritische Verletzungen durch untypischen Schaden.'
				+ '\n• `p` | `pushed` : Kritische Verletzungen durch strapazierten Schaden (keine).'
				+ '\n• Anstatt eines bestimmten Eintrags kann der Parameter `-lucky [rank]` angegeben werden um das Talent __Glückspilz__ zu nutzen (Stufe ist optional, Standard ist 1).',
			],
			[
				'👾 ALIEN',
				'• `dmg` | `damage` : Krtisiche Verletzungen durch Schaden.'
				+ '\n• `s`, `synth` | `synthetic` : Kritische Verletzungen von Androiden.'
				+ '\n• `x` | `xeno` : Kritische Verletzungen bei Xenomorphen.'
				+ '\n• `m` | `mental` : Dauerhafte mentale Traumata.',
			],
			[
				'🌟 Coriolis: Der Dritte Horizont',
				'• `dmg` | `damage` : Kritische Verletzungen durch Schaden.'
				+ '\n• `at` | `atypical` : Kritische Verletzungen durch atypischen Schaden.',
			],
		],
		'ccrit-too-many-arguments': 'Es wurden zu viele Parameter angegeben! Siehe `help crit` für die korrekte Verwendung.',
		'ccrit-no-table-for-game-start': 'Es gibt keine Tabelle mit kritischen Verletzung für das',
		'ccrit-no-table-for-game-end': 'Rollenspiel in meiner Datenbank',
		'ccrit-table-not-found-start': 'Es gibt keine',
		'ccrit-table-not-found-end': 'Tabelle mit Kritischen Verletzungen für',
		'ccrit-not-found': 'Die kritische Verletzung wurde nicht gefunden',
		'ccrit-lethality-start': 'Diese kritische Verletzung ist **TÖDLICH** und muss',
		'ccrit-lethality-healmalus': ' (mit einem Malus von ',
		'ccrit-lethality-timelimit-multiple': ' innerhalb der nächsten',
		'ccrit-lethality-timelimit-single': ' innerhalb **eines',
		'ccrit-lethality-end': ' GEHEILT werden oder der Charakter stirbt.',
		'ccritalien-description': 'Würfelt eine zufällige kritische Verletzung.'
			+ '\nGib `help crit` für mehr Details ein.',
		'ccritcoriolis-description': 'Würfelt eine zufällige kritische Verletzung.'
			+ '\nGib `help crit` für mehr Details ein.',
		'ccritfbl-description': 'Würfelt eine zufällige kritische Verletzung.'
			+ '\nGib `help crit` für mehr Details ein.',
		'ccritmyz-description': 'Würfelt eine zufällige kritische Verletzung.'
			+ '\nGib `help crit` für mehr Details ein.',
		'cdemon-description': 'Erzeugt einen zufälligen Dämon anhand der Tabellen aus dem'
			+ ' *Verbotene Lande - Spielleiterhandbuch*.'
			+ '\nHinweis: Alle Boni aus den Fähigkeiten des Dämons werden nicht in dessen Werte/Rüstung/Fähigkeiten einberechnet.'
			+ '\nHinweis: Die Anzeige der Angriffe ist nicht optimiert für kleine Bildschirme (z.B. Smartphones).',
		'cdrawinit-description': 'Zieht eine oder mehrere Initiativekarten. Der Stapel ist eindeutig für jeden Discord-Server.\n\n'
			+ `__Parameter__
			• \`[speed]\` – Zahl der zu ziehenden Initiativekarten. Standard: 1.

			__Weitere Optionen__
			• \`[-haste <value>]\` – Zieht mehr Initiativekarten und behält die beste. Die anderen werden zurück in den Stapel gemischt bevor weitere Spieler ihre Karten ziehen. Nutze dies für bestimmte Talente, wie *Blitzschnell*. Standard: 1.
			• \`[-shuffle]\` – Setzt den Stapel zurück und mischt ihn. *(Dies wird wahrscheinlich am Anfang jeder neuen Begegnung benötigt.)*`,
		'cdrawinit-deck-too-small': 'Die Größe des *Initiativestapels* ist zu klein.',
		'cdrawinit-shuffled': 'Ein neuer Stapel *Initiativekarten* wurde gemischt.',
		'cdrawinit-hastepool': 'Aufgrund von Blitzschnell in den Stapel zurückgemischt',
		'cdrawmutation-description': 'Zieht eine zufällige Mutation aus dem MJN-Grundregelwerk. Zusätzlich sind folgende Quellenbücher verfügbar:'
			+ '\n• `gla` – Fügt Mutationen aus *Mutant: Genlabor Alpha* hinzu'
			+ '\n• `zc2` – Fügt Mutationen aus *Zonenkompendium 2: Das nasse Grab* hinzu'
			+ '\n• `ACHTUNG`: Es wurde ein exklusiv für den deutschen Markt produziertes viertes Zonenkompendium eingefügt, daher stimmen die Nummern ab Band 4 nicht mehr mit den englischen überein'
			+ '\n• `zc5` – Fügt Mutationen aus *Zonenkompendium 6: Hotel Imperator* hinzu.'
			+ '\n• `psi` – Zieht nur aus den Psionischen/mentalen Mutationen.'
			+ '\nNutze `all` um alle Quellenbücher zu nutzen.',
		'cembed-description': 'Erzeugt eine neue eingebundene Nachricht. Der Titel und die Beschreibung der Nachricht sind beide Pflichtangaben und müssen mit einem horizontalen Strich `|` (AltGr + <) getrennt werden.',
		'cembed-invalid-arguments': 'Unbekannte Parameter. Versuche',
		'cembed-empty-title': 'Der `Titel` ist leer',
		'cembed-empty-description': 'Die `Beschreibung` ist leer',
		'cferal-description': 'Wirft Würfel für eine Genlabor Alpha Tierkraft und prüft auf Wildheitseffekte.',
		'chelp-description': 'Listet alle verfügbaren Befehle auf. Wird ein Befehlsname angegeben, werden mehr Informationen zu diesem Befehl ausgegeben.',
		'chelp-command-list-title': 'Liste der Befehle',
		'chelp-command-list-start': 'Gib',
		'chelp-command-list-middle': 'ein, um eine Liste aller verfügbaren Befehle zu erhalten.' + '\nGib',
		'chelp-command-list-end': 'ein, um Informationen zu einem bestimmten Befehl zu erhalten',
		'chelp-sent-dm': 'Ich habe dir eine Direknachricht mit allen meinen Befehlen geschickt!',
		'chelp-dm-error': 'Scheinbar kann ich dir keine Direktnachrichten schicken! Hast du diese vielleicht deaktiviert?',
		'chelp-invalid-command': 'Das ist kein gültiger Befehl!',
		'cimportcharacter-description': 'Importiert einen Charakterbogen. Der `-v` Parameter zeigt den eingebundenen Bogen an.',
		'cimportcharacter-invalid-url': 'Ungültige URL',
		'cimportcharacter-importing': 'Importiere Charakter...',
		'cimportcharacter-could-not-retrieve': 'Fehlschlag beim Abruf des Charakters von ',
		'cimportcharacter-success': 'wurde erfolgreich importiert!',
		'cinvite-description': 'Gibt einen Link zurück um Sebedius zum einem Server einzuladen.',
		'cinvite-title': 'Sebedius-Einladung',
		'cinvite-text': 'Du kannst Sebedius hiermit zu deinem Server einladen',
		'cjourney-description': 'Führt eine *Verbotene Lande* Reise aus.'
			+ '\nMan eine Reise **erstellen** und dabei den *Tagesabschnitt*, die *Jahreszeit* und das *Gelände* angeben um Informationen über die Würfelmodifikatoren und die möglichen Aktivitäten anzuzeigen. Spieler können das Reaktionsmenü benutzen um ihre Aktivität anzuzeigen (als Erinnerung für die SL).'
			+ '\nAußerdem kann man auch zufällige **Mißgeschicke** für fehlgeschlagene Aktivitäten ziehen.'
			+ '\nWettereffekte und Mißgeschicke für *Die Frostweiten* sind ebenfalls verfügbar.',
		'cjourney-moredescriptions': [
			[
				'Unterbefehle',
				'• `create|c` or `-create|-c` – Erstellt eine Reise.'
				+ '\n• `mishap|m` or `-mishap|-m` – Zieht ein zufälliges Reise-Mißgeschick.'
				+ '\n• `help` – Zeigt diese Hilfe an.',
			],
			[
				'Create: `!journey  create|c  [QUARTER_DAY] [SEASON] [TERRAIN] [arguments...]`',
				'`[QUARTER_DAY]` – Legt den aktuellen **Tagesabschnitt** fest.'
				+ '\n• `-quarter|-q|-d|-quarterday|-qd [search]` – Zeigt ein Menü an um eine Option für den **Tagesabschnitt** zu wählen, gefiltert nach den Angaben mit dem `[search]` Parameter.'
				+ '\n• `[SEASON]` – Legt die aktuelle **Jahreszeit** fest.'
				+ '\n• `-season|-s [search]` – Zeigt ein Menü an.'
				+ '\n• `[TERRAIN]` – Legt die aktuelle **Geländeart** fest.'
				+ '\n• `-terrain|-t [search]` – Zeigt ein Menü an.'
				+ '\n• `...arguments` – Siehe die anderen Argumente unten.',
			],
			[
				'Create-Optionen',
				'• **Tagesabschnitte**: Morgen: `morning`, Tag: `day` *(Standard)*, Abend: `evening` und Nacht: `night`.'
				+ '\n• **Jahreszeiten**: Frühling: `spring` *(Standard)*, Sommer: `summer`, Herbst: `autumn` und Winter: `winter`.'
				+ '\n• **Geländearten**: Ebenen: `plains` *(Standard)*, Wald: `forest`, Tiefer Wald: `dark_forest`, Hügel: `hills`, Gebirge: `mountains`, Hochgebirge: `high_mountains`, See: `lake`, Fluß: `river`, Meer: `ocean`, Marschland: `marshlands`, Sumpf: `quagmire`, Ruinen: `ruins`, *(Frostweiten)* Tundra: `tundra`, Eisdecke: `ice_cap`, Unter dem Eis: `beneath_the_ice`, Eiswald: `ice_forest` und Meeres-Eis: `sea_ice`.'
			],
			[
				'Mishap: `!journey  mishap|m  [activity] [...arguments]`',
				'Mögliche Aktivitäten die ein Mißgeschick haben können: '
				+ '`' + YZJourney.Activities
					.filter(a => a.mishap)
					.array()
					.map(a => a.tag)
					.join('`, `')
					.toLowerCase() + '`'
				+ '\n*Wurde keine Aktivität angegeben wird der Bot ein Menü anbieten um eine auszuwählen (gefiltert nach möglicherweise angegebenen Wortbestandteilen).*',
			],
			[
				'Andere übliche Argumente',
				'• `-fbr|-bitterreach|-snow|-ice` – Benutzt *Die Frostweiten* Mißgeschicke und Wettereffekte.'
				+ '\n • `-name|-title|-n <title>` – Legt einen Titel fest.'
				+ '\n • `-lang|-language|-lng <language_code>` – Gibt eine andere Sprache an. Siehe den `setconf` Befehl für mögliche Optionen.',
			],
		],
		'cjourney-activity-mishap-mismatch': 'Wähle eine **Aktivität** mit einem **Mißgeschick**',
		'cjourney-choose-subcommand': 'Bitte wähle einen der folgenden Unterbefehle `create`, `mishap` oder `help`.',
		'cjourney-choose-quarterday': 'Wähle einen **Tagesabschnitt**',
		'cjourney-choose-season': 'Wähle eine **Jahreszeit**',
		'cjourney-choose-terrains': 'Wähle eine **Geländeart**',
		'cjourney-choose-activity': 'Wähle eine **Aktivität**',
		'cjourney-generic-description': 'Wähle eine Aktivität und würfle auf `ÜBERLEBEN`.',
		'cjourney-movement-modifier-open': 'Zu Fuß: 2 Hexfelder / Tagesabschnitt\nZu Pferd: 3 Hexfelder / Tagesabschnitt',
		'cjourney-movement-modifier-difficult': 'Zu Fuß: 1 Hexfelder / Tagesabschnitt\nZu Pferd: 1 Hexfelder / Tagesabschnitt',
		'cjourney-movement-modifier-boat': 'Zu Boot: 2 Hexfelder / Tagesabschnitt',
		'croll-description': 'Wirft Würfel für ein beliebiges Year Zero Rollspiel.',
		'croll-moredescriptions': [
			[
				'Wähle Spiel mit [game]',
				'Dieser Parameter wird genutzt um das Aussehen der Würfel zu ändern.'
				+ ' Kann ausgelassen werden, falls das Spiel mit `!setconf game [default game]` gesetzt wurde oder eines der spezifischen Kürzel genutzt wird.'
				+ `\n Möglichkeiten: \`${SUPPORTED_GAMES.join('`, `')}\`.`,
			],
			[
				'Einfache Würfel werfen',
				'`roll d6|d66|d666` – Würfelt einen D6, D66, oder D666.'
				+ '\n`roll XdY±Z` – Wirft X Würfel der Augenzahl Y, modifiziert durch Z.'
				+ '\n`roll init` – Würfelt Initiative (einen D6).',
			],
			[
				'Year Zero Würfel werfen',
				'Benutze eine beliebige Kombination mit diesen Buchstaben:'
				+ '\n• `b` – Basiswürfel (Attribute)'
				+ '\n• `s` – Fertigkeitswürfel (oder Stresswürfel für das *Alien RPG*)'
				+ '\n• `n` – Negativwürfel (nur *MYZ* und *FBL*)'
				+ '\n• `g` – Ausrüstungs-/Waffenwürfel (nur *MYZ* und *FBL*)'
				+ '\n• `d` – Generische Würfel (oder Munitionswürfel für *Twilight 2000*)'
				+ '\n• `a` – Munitionswürfel (nur *Twilight 2000*)'
				+ '\n• `a8` – W8 Artefaktwürfel (siehe *FBL*)'
				+ '\n• `a10` – W10 Artefaktwürfel (siehe *FBL*)'
				+ '\n• `a12` – W12 Artefaktwürfel (siehe *FBL*)'
				+ '\n\n*Beispiel:* `roll 5b 3s 2g`',
			],
			[
				'Zusätzliche Parameter',
				'Zusätzliche Optionen für den Wurf:'
				+ '\n`-name|-n|-#|# <name>` : Legt einen Namen für den Wurf fest.'
				+ '\n`-push|-p <number>` : Ändert die maximale Anzahl an erlaubten Strapazierwürfen.'
				+ '\n`-fullauto|-fa|-f` : "Full-auto", unbegrenzte Anzahl an Strapazierwürfen (max 10).'
				+ '\n`-mod <±X>`: Verändert das Ergebnis mit einem Schwierigkeitsmodifizierer von `+X` oder `-X`.'
				+ '\n`-pride` : Fügt einen W12-Artefaktwürfel zum Wurf hinzu.'
				+ '\n`-nerves` : Nutzt das Talent *Nerven aus Stahl* (Alien RPG).'
				+ '\n`-minpanic <value>` : Verändert den minimalen Schwellenwert für mehrere aufeinanderfolgende Panik-Effekte (Alien RPG).'
				+ '\n`-lang <language_code>` : Ändert die gewünschte Sprache.',
			],
			[
				'Mehr Info',
				`Um einen Wurf zu strapazieren, klicke das ${Config.commands.roll.pushIcon} Reaktionssymbol unter der Nachricht.`
				+ ' Die Strapazieroption für den Würfelwurf ist 2 Minuten lang verfügbar. Nur der Benutzer, der die Würfel geworfen hat kann den Wurf strapazieren.'
				+ '\nUm das Reaktionsmenü zu entfernen, klicke das ❌ Reaktionssymbol.'
				+ '\nCoriolis hat mehr Strapazieroptionen: 🙏 (Zu den Ikonen beten, +1W) und 🕌 (in einer Kapelle, +2W).'
				+ `\nMaximal ${Config.commands.roll.max} Würfel können gleichzeitig geworfen werden. Versuchst du mehr, wird nichts passieren.`,
			],
			[
				'Siehe auch',
				'Die folgenden Befehle sind Kürzel, falls du nicht den Spiel-Parameter [game] jedes Mal angeben möchtest.'
				+ '\n`rm` – Wirft *Mutant: Jahr Null* Würfel.'
				+ '\n`rf` – Wirft *Verbotene Lande* Würfel.'
				+ '\n`rt` – Wirft *Tales From The Loop* Würfel.'
				+ '\n`rc` – Wirft *Coriolis* Würfel.'
				+ '\n`ra` – Wirft *Alien RPG* Würfel.'
				+ '\n`rv` – Wirft *Vaesen* Würfel.'
				+ '\n`rw` – Wirft *Twilight 2000 4E* Würfel.',
			],
		],
		'croll-ammo-spent': 'Ausgegebene Munition',
		'croll-generic-roll': 'Generischer Wurf',
		'croll-single-roll': 'Einzelner D6 / D66 / D666 Wurf',
		'malien-xeno-bloodburster': 'Bloodburster',
		'malien-xeno-neophyte': 'Juvenile Neomorph (Neophyte)',
		'malien-xeno-neomorph': 'Adult Neomorph',
		'malien-xeno-ovomorph': 'Ovomorph (Egg)',
		'malien-xeno-queenegg': 'Queen\'s Egg',
		'malien-xeno-facehugger': 'Facehugger',
		'malien-xeno-praetofacehugger': 'Praeto-Facehugger',
		'malien-xeno-royalfacehugger': 'Royal Facehugger',
		'malien-xeno-chestburster': 'Chestburster',
		'malien-xeno-bambiburster': 'Bambi Burster',
		'malien-xeno-imp': 'Imp',
		'malien-xeno-queenburster': 'Queenburster',
		'malien-xeno-stalker': 'Stalker',
		'malien-xeno-scout': 'Scout',
		'malien-xeno-drone': 'Drone',
		'malien-xeno-soldier': 'Soldier',
		'malien-xeno-worker': 'Worker',
		'malien-xeno-sentry': 'Sentry',
		'malien-xeno-praetorian': 'Praetorian',
		'malien-xeno-crusher': 'Crusher',
		'malien-xeno-queen': 'Queen',
		'malien-swarm': 'The Swarm',
		'malien-adultharvester': 'Harvester',
		'malien-juvenileharvester': 'Harvester Juvenile',
		'malien-lionworm': 'Lion Worm',
		'malien-scorpionid-onland': 'Tanakan Scorpionid (On Land)',
		'malien-scorpionid-inwater': 'Tanakan Scorpionid (In Water)',
		'mmyz-humanoid-amnesiac': 'Gedächtnisloser',
		'mmyz-humanoid-cannibal': 'Kannibale',
		'mmyz-humanoid-beastmutant-dog': 'Tiermutant - Hund',
		'mmyz-humanoid-beastmutant-bear': 'Tiermutant - Bär',
		'mmyz-humanoid-beastmutant-rodent': 'Tiermutant - Nagetier',
		'mmyz-humanoid-beastmutant-monkey': 'Tiermutant - Affe',
		'mmyz-humanoid-doomcultist': 'Untergangskultist',
		'mmyz-humanoid-exiledmutant': 'Verstossener Mutant',
		'mmyz-humanoid-helldriver': 'Höllenfahrer',
		'mmyz-humanoid-morlock': 'Morlock',
		'mmyz-humanoid-novacultist': 'Nova-Kultist',
		'mmyz-humanoid-scraporacle': 'Schrottorakel',
		'mmyz-humanoid-wanderer': 'Wanderer',
		'mmyz-humanoid-watertrader': 'Wasserhändler',
		'mmyz-humanoid-wrecker': 'Wracker',
		'mmyz-humanoid-zoneghoul': 'Zonenghul',
		'mmyz-monster-acidgrass': 'Säuregras',
		'mmyz-monster-airjellies': 'Luftgelee',
		'mmyz-monster-automaton': 'Automat',
		'mmyz-monster-bitterbeast': 'Bitterbiest',
		'mmyz-monster-deathworm': 'Todeswurm',
		'mmyz-monster-devourer': 'Verschlinger',
		'mmyz-monster-grazer': 'Graser',
		'mmyz-monster-gutfish': 'Bauchfisch',
		'mmyz-monster-killertree': 'Killerbaum',
		'mmyz-monster-killertree-seedpod': 'Samenkapsel',
		'mmyz-monster-mindmosquitoes': 'Gedankenmoskitos',
		'mmyz-monster-nightmareflowers': 'Albtraumblumen',
		'mmyz-monster-parasitefungus': 'Parasitenpilz',
		'mmyz-monster-razorback': 'Messerrücken',
		'mmyz-monster-rotants': 'Fäulnisameisen',
		'mmyz-monster-rotfish': 'Faulfisch',
		'mmyz-monster-scrapcrows': 'Schrottkrähe',
		'mmyz-monster-trashhawk': 'Müllfalke',
		'mmyz-monster-wormswarm': 'Wurmschwarm',
		'mmyz-monster-zonedogs': 'Zonenhunde',
		'mmyz-monster-zonerats': 'Zonenratten',
		'mmyz-monster-zonespider': 'Zonenspinne',
		'mmyz-monster-zonewasps': 'Zonenwespen',
		'mmyz-monster-zoneleeches': 'Zonenegel',
		'mgla-creeper': 'Kriecher',
		'mgla-creeper-model-two': 'Kriecher Modell II "Netzschleuder"',
		'mgla-creeper-model-three': 'Kriecher Modell III "Schwarze Witwe"',
		'wmyz-assaultrifle': 'Sturmgewehr',
		'wmyz-baseballbat-spiked': 'Baseballschläger mit Nägeln',
		'wmyz-baseballbat-wooden': 'Baseballschläger',
		'wmyz-bicyclechain': 'Fahrradkette',
		'wmyz-bluntinstrument': 'Stumpfer Gegenstand',
		'wmyz-bow': 'Bogen',
		'wmyz-brassknuckles': 'Schlagring',
		'wmyz-chainknife': 'Kettenmesser',
		'wmyz-chainsaw': 'Kettensäge',
		'wmyz-compoundbow': 'Kompositbogen',
		'wmyz-crossbow': 'Armbrust',
		'wmyz-decapitator': 'Enthaupter',
		'wmyz-emprifle': 'EMP-Gewehr',
		'wmyz-flamethrower': 'Flammenwerfer',
		'wmyz-flaregun': 'Leuchtpistole',
		'wmyz-gausspistol': 'Gauss-Pistole',
		'wmyz-gaussrifle': 'Gauss-Gewehr',
		'wmyz-grenade-energy': 'Energiegranate',
		'wmyz-grenade-frag': 'Splittergranate',
		'wmyz-grenade-hand': 'Handgranate',
		'wmyz-gyrojetcarbine': 'Gyrojet-Karabiner',
		'wmyz-gyrojetpistol': 'Gyrojet-Pistole',
		'wmyz-harpoonpistol': 'Harpunenpistole',
		'wmyz-harpoonrifle': 'Harpunengewehr',
		'wmyz-huntingrifle': 'Jagdgewehr',
		'wmyz-improvisedexplosive': 'Improvisierte Brandbombe',
		'wmyz-katana': 'Katana',
		'wmyz-lasercannon': 'Lasekanone',
		'wmyz-laserpistol': 'Laserpistole',
		'wmyz-laserrifle': 'Lasergewehr',
		'wmyz-laserwelder': 'Laserschweißer',
		'wmyz-machete': 'Machete',
		'wmyz-maserpistol': 'Maser-Pistole',
		'wmyz-molotovcocktail': 'Molotov Cocktail',
		'wmyz-nailgun': 'Nagelpistole',
		'wmyz-oldagespeargun': 'Vorzeit-Harpune',
		'wmyz-pickaxe': 'Spitzhacke',
		'wmyz-plasmarifle': 'Plasmagewehr',
		'wmyz-pulselaser': 'Impulslaser',
		'wmyz-revolver': 'Revolver',
		'wmyz-rock-thrown': 'Geworfener Stein',
		'wmyz-rustychain': 'Rostige Kette',
		'wmyz-scrapaxe': 'Schrottaxt',
		'wmyz-scrapcannon': 'Schrottkanone',
		'wmyz-scrapcrossbow': 'Schrott-Armbrust',
		'wmyz-scrapderringer': 'Schrott-Taschenpistole',
		'wmyz-scrapflamethrower': 'Schrott-Flammenwerfer',
		'wmyz-scrapknife': 'Schrottmesser',
		'wmyz-scrapmachete': 'Schrottmachete',
		'wmyz-scrappistol': 'Schrottknarre',
		'wmyz-scraprifle': 'Rohrgewehr',
		'wmyz-scrapshiv': 'Scharfer/Spitzer Gegenstand',
		'wmyz-scrapshotgun': 'Schrott-Schrotflinte',
		'wmyz-scrapsledgehammer': 'Schrott-Vorschlaghammer',
		'wmyz-scrapspear': 'Schrott-Speer',
		'wmyz-semiautopistol': 'Halbautomatische Pistole',
		'wmyz-shotgun-doublebarrel': 'Doppelläufige Schrotflinte',
		'wmyz-shotgun-pumpaction': 'Pump-action Schrotflinte',
		'wmyz-slingshot': 'Steinschleuder',
		'wmyz-studdedwoodenclub': 'Mit Nägeln besetzer Holzschläger',
		'wmyz-stunbaton': 'Betäubungsschlagstock',
		'wmyz-stungun': 'Betäubungspistole',
		'wmyz-tasergun': 'Taser',
		'wmyz-ultrasoniccarbine': 'Ultraschallkarabiner',
		'wmyz-unarmed': 'Waffenlos',
		'wmyz-vibroknife': 'Vibromesser',
		'wmyz-whaleharpoon': 'Walharpune',
		'wmyz-wrench': 'Schraubenschlüssel',
	},
};

/**
 * Returns a locale entry (translated text)
 * @param {string} text The key to look for in the translation table
 * @param {string} locale The language code to use. Default is en (english)
 */
module.exports.__ = (text, locale) => {
	if (typeof text != 'string') return text;
	text = text.replace(/_/g, '-').toLowerCase();
	const loc = LOCALES[locale] ? locale : 'en';
	if (LOCALES[loc][text]) return LOCALES[loc][text];
	else if (LOCALES.en[text]) return LOCALES.en[text];
	return text;
};