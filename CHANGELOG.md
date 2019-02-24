# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- New command: `!arkthreat` - Draws a random threat against the Ark.
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