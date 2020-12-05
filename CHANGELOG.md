# Changelog
All notable changes to this project will be documented in this file.
<br />The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
<br />and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.8.0] - 2020-12-04
### Added
- Twilight 2000 4E rolls (`!rw` command) show more detailed info for Ammo dice.

### Changed
- New dice emojis for Twilight 2000 4E.
- New default D6 emoji [#53](https://github.com/Stefouch/sebedius-myz-discord-bot/issues/53).
- New default emoji for deadly critics [#66](https://github.com/Stefouch/sebedius-myz-discord-bot/issues/66).

### Fixed
- Correct Twilight 2000 4E rolls (`!rw` command) based on the official alpha rules.
- Issue [#59](https://github.com/Stefouch/sebedius-myz-discord-bot/issues/59)
- Issue [#65](https://github.com/Stefouch/sebedius-myz-discord-bot/issues/65).

## [3.7.2] - 2020-10-10
### Fixed
- Temporary fix for a Discord privileged intents' issue.

## [3.7.1] - 2020-09-17
### Added
- (GitHub) More protection against breaking updates: GitHub CI can now test all commands individually.

### Fixed
- Correct statistics for `!roll` and `!crit` commands.

## [3.7.0] - 2020-09-15
### Changed
- Command `!journey` has been revamped.

## [3.6.0] - 2020-09-11
### Added
- New command: `!sector` – Creates a random Mutant: Year Zero Zone sector.
- New command: `!journey` – Performs a Forbidden Lands Journey.

## [3.5.0] - 2020-09-04
### Added
- New command: `!embed` – Creates an embed message.

### Changed
- `!help` command revamped.
- (JavaScript) Refactored the whole commands architecture.
- (JavaScript) Discord.Message "ctx" now uses Sebedius.ContextMessage which extends Discord.Message
- (JavaScript) Added command cooldown support.
- (Database) Databases are cleaned of orphaned entries when the bot leaves a server. 
- (GitHub) Use of GitHub CI for workflow tests.

### Fixed
- A bug with `!roll` command where a modifier of `±0` was translated into `±1`.

### Removed
- Argument `--no-dm` from `!help` command.

## [3.4.0] - 2020-09-01
### Added
- New command argument `-list` for `!help`: Gets a list of all commands.
- New CONTRIBUTING.md file with instructions on how to contribute.
- New admin tools to remotely manage the bot.

### Changed
- New README.md file.
- Migrated most of the help into the [Wiki](https://github.com/Stefouch/sebedius-myz-discord-bot/wiki).
- (API) Intents GUILD_PRESENCES & GUILD_MEMBERS enabled for the Admin tools.

### Fixed
- A bug with `!module` command not working at all.
- A glitch with `!roll init` showing success count.

## [3.3.3] - 2020-08-26
### Added
- New command argument `-mod <±X>` for `!roll`: Applies a difficulty modifier of `+X` or `-X` to the roll.

### Changed
- Ammo dice for *Twilight 2000* can also be rolled with `Xa` or `Xd`.
- Better presentation of the details of the blank dice results in Embed messages.

### Fixed
- A bug with monsters' attack dice in `!attack` command.
- A bug with the *Nerves of Steel* talent not decreasing the Panic roll properly.
- A bug allowing *Coriolis* pushed rolls to go over the dice quantity limit, causing a bot crash.

## [3.3.2] - 2020-08-25
### Added
- New command argument `-min <value>` for `!panic`: Adjust a minimum treshold for multiple consecutive panic effects.
- New command alias `!rollw` for `!rolltwilight`.
- New argument aliases `#` and `-#` for `-name` in `!roll` command. *(You still need a space between `#` and the name.)*
- More Panic emojis.

### Changed
- `!roll` command is more user-friendly. More differenciation between roll types (Year Zero rolls, D66/D666 rolls & Generic Rolls).
- Push reaction menu is removed if no dice can be pushed.
- Inverted the d8 *Twilight 2000* dice emojis.

### Fixed
- A bug with `-pride` argument in `!roll` command not working.
- A bug with `--no-dm` argument in `!help` command not working.
- A bug with defined names not showing in `!roll` command.
- A bug with defined names not showing in `!cast` command.

## [3.3.1] - 2020-08-24
### Added
- Ammo count for *Twilight 2000* rolls.

### Changed
- Generic rolls parsing reworked.
- Better *Twilight 2000* dice emojis.

### Fixed
- A bug causing additional dice from pushes *(Coriolis & Alien RPG)* to not work.
- A bug causing pushes details from *Coriolis* rolls to be inexact.
- A bug causing generic rolls to stop functionning with games that have blank dice emojis.

## [3.3.0] - 2020-08-23
### Added
- Support for **TWILIGHT 2000 __PRE-ALPHA__** rolls: `!rolltwilight` or `!rw`. *(This is based on pre-alpha information gathered from Fria Ligan interviews.)*

### Changed
- Better dice emojis for *Alien RPG, Coriolis* and *Tales from the Loop*.
- `!artifact` parameters use `mek` instead of `mech`.
- (Hidden) `!myzpower` parameters use `mek` instead of `mec`.
- (JavaScript) YZRoll code revamped.

### Fixed
- Banes counting "ones" from negative dice. *(Shouldn't.)*

## [3.2.1] - 2020-08-12
### Added
- New parameter `-nerves` for `!panic`.
- New parameter `-nerves` for `!roll`.
- New alias `!mut`for `!mutation|mp`.
- (Admin only) Description and usage for `!setpresence` command.

### Fixed
- An error when typing `!init hp` without any other argument.
- An error when using `!drawinit` in a DM.
- Typo in attack display Message Embed.
- (Admin only) An error with `!setpresence` not working properly.

## [3.2.0] - 2020-07-24
### Added
- New command: `!atk` – Rolls a random attack from a monster.
- New Parameter `-private` for `!crit`: Sends the result in a private DM.
- Reaction menu to the Embed Selector.

### Changed
- `!monster` aliases and effects.
- `!critmutant` renamed into `!critmyz` ("critmutant" is still an alias for this command).
- New command alias for `!rollmyz`: rollmutant.

## [3.1.1] - 2020-07-13
### Changed
- `!cast <power> [name]` instead of `!cast <power> [-name <name>]`.
- `!prefix [set <new prefix>]` instead of `!prefix [new prefix]`.

### Fixed
- Issue #25
- Issue #26
- Issue with `!init list -private` not being private.
- `!roll pride` alone works now.
- Typos in bot activities.
- Typos in the Readme.

## [3.1.0] - 2020-07-10
### Added
- New command: `!cast` – Rolls a spell's Power Level and checks for any Magic Mishap.
- New command: `!mishap` – Draws a random Magic Mishap.
- New command: `!mutation` – Rolls dice for a Mutation and checks for any Misfire.
- New command: `!feral` – Rolls dice for a GenLab Alpha Animal Power and checks for any Feral Effect.
- New command: `!module` – Rolls dice for a Mechatron Module and checks for any Overheating.
- New command: `!contact` – Rolls dice for an Elysium Contact and checks for any Backlash.
- New command: `!myzpower` – Rolls dice for a MYZ power.

### Changed
- Renamed the old `!mutation` command into `!drawmutation`.

### Fixed
- Typos in both Readme files.

## [3.0.1] - 2020-07-08
### Changed
- Bot activities.

### Fixed
- A bug causing all Alien RPG dice to be turned into stress dice.
- A bug with the `!setconf lang` subcommand.
- `!init hp` subcommand not warning the user about errors.
- Missing Alien's `!planet` command entry in the readme.
- Use of an offline database in developper mode.

## [3.0.0] - 2020-07-08
Initially planned to be v2.1, the large quantity of changes brought along the new Initiative Tracker is simply too much for a **minor** version increment.
Therefore, this update is a **major** change from v2 to v3 in less than one month.

### Added
- New feature: **Initiative Tracker** with command `!init`.
- New administration command: `!setpresence`.
- Bot's activities loop.

### Changed
- Renamed the old `!init` command into `!drawinit`.
- Added new arguments and functionalities to `!drawinit`.
- Large code rewritting:
  - Resorted the whole files/folders architecture.
  - Reworked the access to databases.
  - Use of a custom Discord.Client class.
  - Use of Discord.Message with extra context.

### Fixed
- "st" shortcut not working for FBL's stab critical table.
- `!br` now properly deletes the invoke message.
- A potential security breach with the roll parsing function.

## [2.0.0] - 2020-06-22
### Added
- Support for **TALES FROM THE LOOP** rolls: `!rolltales` or `!rt`.
- Support for **CORIOLIS** rolls: `!rollcoriolis` or `!rc` (including praying the icons).
- Support for **VAESEN** rolls: `!rollvaesen` or `!rv`.
- New command: `!supply` – Rolls for a supply (*ALIEN* rpg).
- New command: `!resource` – Rolls a Resource Die (*Forbidden Lands*).
- New command: `!critmutant` or `!critm` – Shortcut for *Mutant: Year Zero* critical injuries.
- New command: `!critfbl` or `!critf` – Shortcut for *Forbidden Lands* critical injuries.
- New command: `!critalien` or `!crita` – Shortcut for *ALIEN* critical injuries.
- New command: `!ping` – Checks the bot's latency.
- New command: `!br` – Prints a scene break.
- New command: `!changelog` – Prints a link to the official changelog.
- New command: `!invite` – Prints a link to invite Sebedius to your server.
- New command: `!prefix` – Gets the prefixes for the current server.
- The `!panic` command has now a `--fixed` argument if you want to use a fixed number (no D6 rolled).
- New `!setconf` configuration parameter: `game` – Defines the game used for the default dice template and critics tables.
- New `!setconf` configuration parameter: `lang` – Defines the default language.
- New critical tables in CSV format.
- New JavaScript utils and tools for the bot's code.
- New administration commands: `!eval` and `!stats`.
- Error Watching: The bot sends me a DM for each uncaught errors.

### Changed
- Discord.js API upgraded to v12.2.0. Fixed Connection log, BaseManager cache, MessageEmbed, and ReactionCollector accordingly.
- Permissions: `READ_MESSAGE_HISTORY` is needed to react to messages with emojis.
- `!roll` command revamped. See Readme for details.
  - Pushing duration increased from 60 to 120 seconds.
  - Dice arguments are now adaptable. *E.g. Typing `5b3s` is now the same as `b5 3s`.*
- `!crit` command revamped. See Readme for details.
- Relooking of the `!help` command.
- Updated code for `!panic`, `!admin` and the above commands.
- Future support for different languages.

### Fixed
- A bug where the player's avatar was not showing in the roll embed message.
- A typo in job.cargo.goods.medicinal JSON data.
- A bug that was breaking the `!init` command.
- A fatal error causing the bot to crash on a certain condition related to the roll command.
- Permissions checks.

## [1.7.0] - 2019-12-26
### Added
- New command: `!star` – Generates a random star sector for the *ALIEN* rpg.
- New command: `!planet` – Generates a random uncolonized planet for the *ALIEN* rpg.
- New command: `!colony` – Generates a random colonized planet for the *ALIEN* rpg.
- New command: `!job` – Generates a random job for the *ALIEN* rpg.
- All roll commands can now interpret simple generic rolls.
- All the Mutant: Elysium artifacts.
- More admin support for the bot owner (me).

### Fixed
- Issue #13: `!arto` is now specific.
- Some `!help` incorrect informations.
- Charts with the first edition of Alien RPG:
  - Panic Roll chart: updated page numbers and Berzerk.
  - Permanent Mental Trauma critical chart: updated page numbers.
  - Xeno Critical Injuries chart: updated text.

## [1.6.3] - 2019-08-27
### Changed
- Bot's activity flare from "MYZ" to "YZE" (stands for *Year Zero Engine*).

### Fixed
- A bug that prevented `!admin servers` from functionning.

## [1.6.2] - 2019-06-27
### Added
- New crit subcommand: `!crit alien` – The *ALIEN* Critical injuries.
- New crit subcommand: `!crit synth` – The *ALIEN* Critical injuries for Synthetics and Androids.
- New crit subcommand: `!crit xeno` – The *ALIEN* Critical injuries for Xenomorphs.

### Fixed
- A bug preventing the Crit subcommand `!crit horror` from working.

## [1.6.1] - 2019-06-06
### Added
- New crit subcommand: `!crit mental` – The *ALIEN* Permanent Mental traumas.
- A reminder for a risk of a Permanent Mental trauma with Panic roll >=13.
- A reminder for a canceled skill roll with Panic roll >= 10.

### Changed
- The database module has switched to PostgreSQL (with Keyv).

### Fixed
- Panic roll not occurring after pushed rolls (issue #8).
- Guild-custom prefixes were only saved for 24h (issue #9).

## [1.6.0] - 2019-06-05
### Added
- New command: `!initiative` – Draws initiative cards.

### Changed
- The database module have migrated from JSON to SQLite with Keyv.
- Bot icon to reflect more Fria Ligan's Year Zero games.

### Removed
- All guild-specific parameters have been deleted. *Sorry!*

## [1.5.0] - 2019-06-04
### Added
- New command: `!rolla` – Rolls dice for the *ALIEN* roleplaying game.
- New command: `!rollf` – Rolls dice for the *Forbidden Lands* roleplaying game.
- New command: `!panic` – Rolls a random panic effect for the *ALIEN* roleplaying game.
- New roll subcommand: `!roll init [bonus]` – Rolls initiative with or without a bonus.
- New roll subcommand: `!rolla res|supply <rating> [name]` – Rolls a supply for the *ALIEN* roleplaying game.
- Artifact Die emojis for *Forbidden Lands* rolls.
- Feature request / bug report weblink to the help command.

### Fixed
- Many typo errors.

### Removed
- Removed `crit p` alias (for `crit pushed`).
- `sheet` command is deprecated and will never be implemented.

## [1.4.2] - 2019-03-13
### Fixed
- Some typo errors in the mutations list.

## [1.4.1] - 2019-03-11
### Fixed
- Fixed Insect Demon's icon in `demon` embed messages: Is now 🐞 *(lady beetle)* instead of 🐜 *(ant)*. The ant emoji was difficult to see on Discord's dark themes.
- Fixed Undead Demon's icon in `demon` embed messages: Is now 💀 *(skull)* instead of 🧟 *(zombie)*. The zombie emoji isn't supported by Discord.
- Fixed words wrapping in `demon` embed messages.
- Removed a useless extra dot in `demon` embed messages.
- Removed a useless extra space in `monster` embed messages.

## [1.4.0] - 2019-03-09
### Added
- New command: `!monster` – Generates a random monster according to the tables found in *Zone Compendium 1: The Lair of the Saurians*.
- New command: `!demon` – Generates a random demon according to the tables found in the roleplaying game *Forbidden Lands*.
- New command: `!legend` – Generates a random legend according to the tables found in the roleplaying game *Forbidden Lands*.
- A new `psi` category for the `!mutation` command.

### Changed
- Altered roll parsing functions.

### Fixed
- A typo error in the mutations list.
- A typo error in the rumors list.
- Moved the "Diary" artifact to the metaplot category.

## [1.3.0] - 2019-02-28
### Added
- New command: `!artifact` – Draws a random artifact.
- New command: `!threat` – Draws a random Zone threat.
- 80 additional scrap items, for a total of 297.

### Fixed
- A bug that broke the resource die roll.
- A bug related to the `!mutation` command not working with argument `all`.

## [1.2.3] - 2019-02-26
### Added
- Bot's version display in console at startup and in admin maintenance.

### Changed
- Moved the character sheets in a subfolder.

## [1.2.2] - 2019-02-25
### Fixed
- Proper author name/pseudo for YZEmbed in chat message.

## [1.2.1] - 2019-02-24
### Added
- New command: `!admin` – Performs bot's maintenance. Only available for the bot's owner.

### Fixed
- A bug introduced with the last release. Member with no role could'nt execute bot's commands.
- A thrown error when pushing rolls in DMs.
- Some rumors typos in `rumors.json`.

## [1.2.0] - 2019-02-23
### Added
- New command: `!rumor` – Tells a random rumor.
- New command: `!mutation` – Draws a random mutation.
- Bot's response to its mention, which lets him answer its prefix.
- New JS Class: YZEmbed (extends Discord.RichEmbed with predefined properties).

## [1.1.0] - 2019-02-22
### Added
- Support for negative dice rolls.
- Negative dice icon emojis (red).

### Changed
- Modified the dice cap to 42.
- Updated various commands' help messages.
- Greatly improved the help for the `!roll` command.

### Fixed
- A bug related to setting custom prefixes.

### Removed
- Scrap list timestamp.
- Bot's response to its mention. *(This will come back in a future version.)*

## [1.0.0] - 2019-02-21
! Initial commit