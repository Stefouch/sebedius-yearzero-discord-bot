# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - In Progress
### Added
- New command: `!star` – Generates a random star sector for the *ALIEN* rpg.
- New command: `!colony` – Generates a random colonized planet for the *ALIEN* rpg.
- New command: `!job` – Generates a random job for the *ALIEN* rpg.
- All roll commands can now interpret simple generic rolls.
- All the Mutant: Elysium artifacts.
- More admin support for the bot owner.

### Fixed
- Issue #13: `!arto` is now specific.
- Some `!help` incorrect informations.
- Charts with the first edition of ALIEN rpg:
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