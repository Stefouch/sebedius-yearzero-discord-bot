# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2019-02-28
### Added
- New command: `!artifact` - Draws a random artifact.
- New command: `!threat` - Draws a random Zone threat.
- 80 additional scrap items, for a total of 297.

### Fixed
- A bug that broke the resource die roll.

## [1.2.3] - 2019-02-26
### Added
- Bot's version display in console at startup and in admin maintenance.

### Changed
- YZRoll class enhanced.
- Moved the character sheets in a subfolder.

## [1.2.2] - 2019-02-25
### Changed
- Code cleansing.

### Fixed
- Proper author name/pseudo for YZEmbed in chat message.

## [1.2.1] - 2019-02-24
### Added
- New command: `!admin` - Performs bot's maintenance. Only available for the bot's owner.
- New function `list()` to `database.js`.
- Extra documentation to `database.js`.

### Fixed
- A bug introduced with the last release. Member with no role could'nt execute bot's commands.
- A thrown error when pushing rolls in DMs.
- Some rumors typos in `rumors.json`.

### Removed
- Some useless data in `config.json`.

## [1.2.0] - 2019-02-23
### Added
- New command: `!rumor` - Tells a random rumor.
- New command: `!mutation` - Draws a random mutation.

- Bot's response to its mention, which lets him answer its prefix.
- New JS Class: YZEmbed (extends Discord.RichEmbed with predefined properties).

## [1.1.0] - 2019-02-22
### Added
- Support for negative dice rolls.
- Negative dice icon emojis (red).

### Changed
- Modified the dice cap to 42.
- Updated "README.md".
- Updated various commands' help messages.
- Greatly improved the help for the "!roll" command.

### Fixed
- A bug related to setting custom prefixes.

### Removed
- Scrap list timestamp.
- Bot's response to its mention. *(This will come back in a future version.)*

## [1.0.0] - 2019-02-21
! Initial commit