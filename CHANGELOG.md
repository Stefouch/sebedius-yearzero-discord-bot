# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [7.0.0](https://github.com/Stefouch/sebedius-yearzero-discord-bot/compare/v6.5.3...v7.0.0) (2024-02-09)

### Sharding

This version adds support for [Sharding](https://discordjs.guide/sharding/#how-does-sharding-work) and allows the bot to be invited on more than 2500 servers.

## [6.5.3](https://github.com/Stefouch/sebedius-yearzero-discord-bot/compare/v6.5.2...v6.5.3) (2023-04-01)

### Bug Fixes

- Fixed critical issue #195.

## [6.5.2](https://github.com/Stefouch/sebedius-yearzero-discord-bot/compare/v6.5.1...v6.5.2) (2022-10-31)

### Features

- **Locales:** 🌐🇩🇪 Add German translation for the new `/crit` command.
- **Roll:** ♻️ Remove requirement for Base Dice in MYZ & FBL games, as requested in #170.

### Bug Fixes

- **Roll:** 🩹 Add a single Base Die if the roll is empty (before modification).
- **Roll:** 🐛 Fix bad regex execution for T2K undefined inputs ([#190](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/190)) ([391b91f](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/391b91f2185796eb6b571068ccd50cebac4c2325))
- **Gamedata:** Conforming some entry names ([d1d03bb](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/d1d03bb1b8621a48b94e1699143a86f8def42267))
- **Gamedata:** Fix punctuation in effects of vaesen crit tables ([6b5881d](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/6b5881da3d5181b875efdf84ab4c4cc7ac047a9f))

## [6.5.1](https://github.com/Stefouch/sebedius-yearzero-discord-bot/compare/v6.5.0...v6.5.1) (2022-10-28)

### Bug Fixes

- **Help:** 🐛 Hide owner-only commands from the Help autocomplete ([#186](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/186)) ([51a18a1](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/51a18a1f6eefac3aa7ac6a2f40e7c54b31037278))

## [6.5.0](https://github.com/Stefouch/sebedius-yearzero-discord-bot/compare/v6.4.1...v6.5.0) (2022-10-27)

### Features

- **Commands:** Add `/crit` command ([#183](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/183)) ([b720344](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/b720344b9dd2793306752c7eab2eb60dc3afcd01))
- **Help:** ✨ Add autocompletion for the `command` argument of the `/help` command ([ecc212f](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/ecc212f13e62bf4894e801cddb014a3b43b7b047))
- **Locales:** 🌐🇸🇪 Add Swedish translations ([#184](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/184)) ([cdeb2bb](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/cdeb2bb1ade5b1bc9b773255b12de909fbe14f20))

## [6.4.1](https://github.com/Stefouch/sebedius-yearzero-discord-bot/compare/v6.4.0+a...v6.4.1) (2022-10-18)

### Features

- **Initiative:** ✨ Add color gradient to the embed result ([faa422f](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/faa422fc3baa7398e9b1bc6a5af9747e64a62d4f))
- **ready-event:** ✨ Add version when ready ([1ea77d3](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/1ea77d3ed695164726567e961cc2c6ddfdf82b59))
- **Roll:** ✨ Roll a D66 from `/roll` ([#165](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/165)) ([88c3d20](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/88c3d2028567023971b653a98c20954eeb46ab83))

### Bug Fixes

- **Panic:** negative modifiers not reducing stress dice ([#182](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/182)) ([67bf23b](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/67bf23be059cd919d531e69900a2c9f2b81d6996)), closes [#180](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/180) [#180](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/180)
- **Panic:** 🐛 Patch panicValue minimum ([e3284b3](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/e3284b35c7b923a675073335d92ee11023a60175))

## [6.4.0](https://github.com/Stefouch/sebedius-yearzero-discord-bot/compare/v6.3.0...v6.4.0) (2022-09-24)

### Features

- **Commands:** Add `/initiative` command ([#177](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/177)) ([5d113bf](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/5d113bfba1396aaf71dd1c4cdbf384eff5fa50a1))
- **Commands:** Add `/rollall` command ([#169](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/169)) ([01b47f9](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/01b47f9d21b096a3825bc97322812137134c4630))

### Bug Fixes

- **Panic:** 🐛 Add correct index for 0-6 results on the table ([#175](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/175)) ([351499e](https://github.com/Stefouch/sebedius-yearzero-discord-bot/commit/351499eeea6dab94b00b4bcae831f17c8c2d3ad3)), closes [#171](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/171)

## [6.3.0](https://github.com/Stefouch/sebedius-yearzero-discord-bot/compare/v6.2.2...v6.3.0) (2022-09-12)

### Features

- 🌐🇫🇷 French translation of commands
- 🌐🇩🇪 German translation of commands

## [6.2.2] - 2022-09-09

### Added

- A missing `neg` option in `/roll myz` & `/roll fbl` commands to add negative dice.

### Changed

- The `modifier` argument for `/roll bladerunner` now have the advantage/disadvantage choices.

### Fixed

- A minor issue where the message buttons appeared with a roll that has panic.
- Some typos in various translations.

## [6.2.1] - 2022-09-07

### Fixed

- Command `/conf` not working in some cases.

## [6.2.0] - 2022-09-07

### Added

- Enable locales `fr` & `de` (still work in progress).
- _(Bot admin only)_ Add webhook for the logs.

## [6.1.0] - 2022-09-06

### Added

- **Slash Commands:**
  - Admin: (`/emit`)
  - Roll: `/panic` – for ALIEN RPG
- The `/roll alien` with a `stress` value command can now automatically trigger a panic roll.
- The `/roll coriolis` command now has more push options _(Pray the Icons!)_.
- The `/help command:<command>` now returns more details with each subcommand and argument' description.
- Add a section to how to use slash commands in the readme.
- Add a gamedata parser method for future random generation commands.
- **Gamedata:**
  - ALIEN RPG: Panic table for `en-US` & `de` locales.

### Fixed

- Add missing `fullauto` argument to the command `/roll myz`.

### Changed

- **Locale:** _(minor)_ English translation now uses the code `en-US` instead of `en`. _(Plain "en" was not supported by Discord.)_

### Removed

- Due to its complexity, roll commands (`/roll` & `/rolld66`) in DM (private messages) have been temporarely disabled until Discord fixes their API. See #148 & #146.
- Remove `fullauto` argument from the command `/roll fbl`.

## [6.0.1] - 2022-09-04

### Added

- Git Localize link in the docs: https://gitlocalize.com/repo/7923

### Changed

- `/rolld66` dice argument is no more required, and will roll a D66 by default.
- Simplified Github templates for bug reports & feature requests.

### Fixed

- Ephemeral messages not pushable.
- `/rolld66` rendering blank dice with some games.
- Errors with guild events.
- Some other errors.

## [6.0.0] - 2022-09-03

### Added

- _Slash_ `/commands`:
  - Admin: `/conf`, `/thread`, (`/botinfo`), (`/eval`)
  - Roll: `/roll`, `/rolld66`
  - Utils: `/help`, `/ping`
- Support for Blade Runner RPG rolls (still missing the dice icons).
- Support for generic rolls like `5d6!>6`.
- A [privacy policy](../../PRIVACY_POLICY.md) declaration.

### Changed

- **(Breaking)** Sebedius needed **permissions** have changed. You might need to kick and re-add the bot to have it work properly.
- License is now **GPL-3.0-or-later** (was MIT)
- Use of the `Mersenne-Twister` algorithm for the random numbers generations instead of the vanilla javascript `Math.random` method.
- Better [Contributing Guide](../../CONTRIBUTING.md).
- **(Breaking)** New Database: MongoDB (was postgres)
- Code revamp:
  - Clean code using modern javascript coding guidelines
  - Use of Eslint & Prettier
  - Commented everywhere
  - Templates for easy contribution
  - Typed methods for VS Code Intellisense support
  - Better translation module implementing **i18next**.
  - Use of DiscordJS library v14 for Discord API v10

### Removed

- **(Breaking)** Discord policy change: **ALL** _prefixed_ `!commands` have been disabled:
  - All command files are archived in the `./archives` folder for later conversion into slash commands.
- **(Breaking)** Translations refactored:
  - Due to the use of a new translation module (i18next), the current german translation is disabled. The original files are stored in the `./archives` folder for later re-use.

## [5.0.1] - 2022-05-31

### Fixed

- Issue with commands `!monster` and `!attack` not waiting for an input choice.
- Issue with command `!help -list` not sending DM.
- Issue with command `!stats` not working.
- Other small fixes.

## [5.0.0] - 2022-05-30

### Changed

- Use of latest DiscordJS V13 (compatible with Discord API V9).
- Update to the latest NPM packages.

### Fixed

- #40
- #122
- #123
- #133

## [4.1.1] - 2021-07-10

### Fixed

- Issue [#119](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/119).
- Issue [#116](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/116).
- Bug: wrong version of the bot was displayed in the help message.
- (JavaScript) Updated all packages.

## [4.1.0] - 2021-07-05

### Changed

- Use of the final version of the dice rules for Twilight 2000.

## [4.0.3] - 2021-04-23

### Fixed

- A critical bug causing a crash of the bot with the error log.

## [4.0.2] - 2021-04-21

### Added

- More locale and german translations.
- Better error log.

### Fixed

- A few hidden bugs.

## [4.0.1] - 2021-03-20

### Added

- German translation for monsters and attacks for the Alien RPG.
- GitHub templates for pull requests, bug reports and feature requests.

### Changed

- (JavaScript) Drop of `utils/version.js` in favor of the 'version' properties in `./package.json`.

### Fixed

- Issue [#100](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/100).
- Issue [#98](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/98).
- Arguments for `!attack` command if it's called from the `!monster` command.
- Incorrect key names in the language files.
- Missing keys in the german language file.

## [4.0.0] - 2021-03-15

Major update with a large refactoring of the bot's javascript code to allow localisation.

### Added

- [Discussions](https://github.com/Stefouch/sebedius-yearzero-discord-bot/discussions)
- Full support for localisation of the bot.
- German localisation.
- Coriolis & Vaesen critical injuries:
  - New command: `!critcoriolis` or `!critc` – Shortcut for _Coriolis_ critical injuries.
  - New command: `!critvaesen` or `!critv` – Shortcut for _Vaesen_ critical injuries.
- New argument `-lang` for many commands to allow language change on the go.
- `!crit` command:
  - New argument `-lucky <rank>`: _Lucky_ talent — On rank `1`, rolls twice and takes the lowest. On `2`, rolls twice and takes the lowest inverted. On `3`, takes the first critical injury (#11).
- `!colony` & `!planet` commands:
  - New argument `-type <planet_type>`: Specifies the planet type. Choices are `rocky`, `icy`, `gasgiant`, `gasgiant-moon` and `asteroid-belt`.
  - New argument `-location <core|arm>`: Specifies if the colony belongs to the independent `core` system colonies or the american or anglo-japanese `arm`.

### Changed

- New repository name: `sebedius-myz-discord-bot` becomes `sebedius-yearzero-discord-bot`.
- [Wiki](https://github.com/Stefouch/sebedius-yearzero-discord-bot/wiki) updated.
- The `!drawinit` command now shows all drawn initiative cards, included discarded ones (e.g. with the `-haste` argument).
- (GitHub) Better CI & CD Workflows

### Fixed

- Issue [#77](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/77).

---

## [3.8.2] - 2020-12-13

## Fixed

- Issue [#78](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/78).
- Issue [#76](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/76).

## [3.8.1] - 2020-12-06

### Fixed

- A small error with displayed text in T2K embed roll messages.
- Issue [#60](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/60).

## [3.8.0] - 2020-12-05

### Added

- Twilight 2000 4E rolls (`!rw` command) show more detailed info for Ammo dice.

### Changed

- New dice emojis for Twilight 2000 4E.
- New default D6 emoji [#53](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/53).
- New default emoji for deadly critics [#66](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/66).

### Fixed

- Correct Twilight 2000 4E rolls (`!rw` command) based on the official alpha rules.
- Issue [#59](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/59).
- Issue [#65](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/65).

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
- Migrated most of the help into the [Wiki](https://github.com/Stefouch/sebedius-yearzero-discord-bot/wiki).
- (API) Intents GUILD_PRESENCES & GUILD_MEMBERS enabled for the Admin tools.

### Fixed

- A bug with `!module` command not working at all.
- A glitch with `!roll init` showing success count.

## [3.3.3] - 2020-08-26

### Added

- New command argument `-mod <±X>` for `!roll`: Applies a difficulty modifier of `+X` or `-X` to the roll.

### Changed

- Ammo dice for _Twilight 2000_ can also be rolled with `Xa` or `Xd`.
- Better presentation of the details of the blank dice results in Embed messages.

### Fixed

- A bug with monsters' attack dice in `!attack` command.
- A bug with the _Nerves of Steel_ talent not decreasing the Panic roll properly.
- A bug allowing _Coriolis_ pushed rolls to go over the dice quantity limit, causing a bot crash.

## [3.3.2] - 2020-08-25

### Added

- New command argument `-min <value>` for `!panic`: Adjust a minimum treshold for multiple consecutive panic effects.
- New command alias `!rollw` for `!rolltwilight`.
- New argument aliases `#` and `-#` for `-name` in `!roll` command. _(You still need a space between `#` and the name.)_
- More Panic emojis.

### Changed

- `!roll` command is more user-friendly. More differenciation between roll types (Year Zero rolls, D66/D666 rolls & Generic Rolls).
- Push reaction menu is removed if no dice can be pushed.
- Inverted the d8 _Twilight 2000_ dice emojis.

### Fixed

- A bug with `-pride` argument in `!roll` command not working.
- A bug with `--no-dm` argument in `!help` command not working.
- A bug with defined names not showing in `!roll` command.
- A bug with defined names not showing in `!cast` command.

## [3.3.1] - 2020-08-24

### Added

- Ammo count for _Twilight 2000_ rolls.

### Changed

- Generic rolls parsing reworked.
- Better _Twilight 2000_ dice emojis.

### Fixed

- A bug causing additional dice from pushes _(Coriolis & Alien RPG)_ to not work.
- A bug causing pushes details from _Coriolis_ rolls to be inexact.
- A bug causing generic rolls to stop functionning with games that have blank dice emojis.

## [3.3.0] - 2020-08-23

### Added

- Support for **TWILIGHT 2000 **PRE-ALPHA\*\*\*\* rolls: `!rolltwilight` or `!rw`. _(This is based on pre-alpha information gathered from Fria Ligan interviews.)_

### Changed

- Better dice emojis for _Alien RPG, Coriolis_ and _Tales from the Loop_.
- `!artifact` parameters use `mek` instead of `mech`.
- (Hidden) `!myzpower` parameters use `mek` instead of `mec`.
- (JavaScript) YZRoll code revamped.

### Fixed

- Banes counting "ones" from negative dice. _(Shouldn't.)_

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

---

## [2.0.0] - 2020-06-22

### Added

- Support for **TALES FROM THE LOOP** rolls: `!rolltales` or `!rt`.
- Support for **CORIOLIS** rolls: `!rollcoriolis` or `!rc` (including praying the icons).
- Support for **VAESEN** rolls: `!rollvaesen` or `!rv`.
- New command: `!supply` – Rolls for a supply (_ALIEN_ rpg).
- New command: `!resource` – Rolls a Resource Die (_Forbidden Lands_).
- New command: `!critmutant` or `!critm` – Shortcut for _Mutant: Year Zero_ critical injuries.
- New command: `!critfbl` or `!critf` – Shortcut for _Forbidden Lands_ critical injuries.
- New command: `!critalien` or `!crita` – Shortcut for _ALIEN_ critical injuries.
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
  - Dice arguments are now adaptable. _E.g. Typing `5b3s` is now the same as `b5 3s`._
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

---

## [1.7.0] - 2019-12-26

### Added

- New command: `!star` – Generates a random star sector for the _ALIEN_ rpg.
- New command: `!planet` – Generates a random uncolonized planet for the _ALIEN_ rpg.
- New command: `!colony` – Generates a random colonized planet for the _ALIEN_ rpg.
- New command: `!job` – Generates a random job for the _ALIEN_ rpg.
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

- Bot's activity flare from "MYZ" to "YZE" (stands for _Year Zero Engine_).

### Fixed

- A bug that prevented `!admin servers` from functionning.

## [1.6.2] - 2019-06-27

### Added

- New crit subcommand: `!crit alien` – The _ALIEN_ Critical injuries.
- New crit subcommand: `!crit synth` – The _ALIEN_ Critical injuries for Synthetics and Androids.
- New crit subcommand: `!crit xeno` – The _ALIEN_ Critical injuries for Xenomorphs.

### Fixed

- A bug preventing the Crit subcommand `!crit horror` from working.

## [1.6.1] - 2019-06-06

### Added

- New crit subcommand: `!crit mental` – The _ALIEN_ Permanent Mental traumas.
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

- All guild-specific parameters have been deleted. _Sorry!_

## [1.5.0] - 2019-06-04

### Added

- New command: `!rolla` – Rolls dice for the _ALIEN_ roleplaying game.
- New command: `!rollf` – Rolls dice for the _Forbidden Lands_ roleplaying game.
- New command: `!panic` – Rolls a random panic effect for the _ALIEN_ roleplaying game.
- New roll subcommand: `!roll init [bonus]` – Rolls initiative with or without a bonus.
- New roll subcommand: `!rolla res|supply <rating> [name]` – Rolls a supply for the _ALIEN_ roleplaying game.
- Artifact Die emojis for _Forbidden Lands_ rolls.
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

- Fixed Insect Demon's icon in `demon` embed messages: Is now 🐞 _(lady beetle)_ instead of 🐜 _(ant)_. The ant emoji was difficult to see on Discord's dark themes.
- Fixed Undead Demon's icon in `demon` embed messages: Is now 💀 _(skull)_ instead of 🧟 _(zombie)_. The zombie emoji isn't supported by Discord.
- Fixed words wrapping in `demon` embed messages.
- Removed a useless extra dot in `demon` embed messages.
- Removed a useless extra space in `monster` embed messages.

## [1.4.0] - 2019-03-09

### Added

- New command: `!monster` – Generates a random monster according to the tables found in _Zone Compendium 1: The Lair of the Saurians_.
- New command: `!demon` – Generates a random demon according to the tables found in the roleplaying game _Forbidden Lands_.
- New command: `!legend` – Generates a random legend according to the tables found in the roleplaying game _Forbidden Lands_.
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
- Bot's response to its mention. _(This will come back in a future version.)_

## [1.0.0] - 2019-02-21

! Initial commit
