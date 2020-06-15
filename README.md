# Year Zero Discord Bot

**Sebedius** is a [Discord](https://discordapp.com) bot with command utilities for the Year Zero roleplaying games by *Free League Publishing (Fria Ligan)*.

The supported games are:
* [Mutant: Year Zero](http://frialigan.se/en/games/mutant-year-zero/)
* [Forbidden Lands](https://frialigan.se/en/games/forbidden-lands/)
* [ALIEN](https://alien-rpg.com/)
* [Vaesen](https://frialigan.se/en/games/vaesen/)

<br />

[![Discord Bots](https://discordbots.org/api/widget/status/543445246143365130.svg)](https://discordbots.org/bot/543445246143365130)

# Add the Bot to your Server

Follow this link: https://discordapp.com/api/oauth2/authorize?client_id=543445246143365130&scope=bot&permissions=289856

The link will prompt you to authorize the bot on a server. Once the bot's authorized, you'll see it in the Member List.

# Available Commands

Commands are triggered with the prefix `!`. This prefix can be configured for your server. Most of the commands can be executed from channels and privately through DMs.

#### Vocabulary

Below you'll find a list of available commands to use. The instructions use the following scheme:

* Chevrons `<...>` mean that the argument is mandatory for the command to work.
* Brackets `[...]` mean that the argument is facultative.
* Vertical bar `|` means "OR". *E.g. `d6|d66` means you can type either d6 or d66 for the command.*

#### Generic commands

* `help` – The bot's manual. Read it!
* `initiative [quantity]` – Draws one or more initiative cards. The deck is specific to each Discord channel. Use the parameter `shuffle` to reset it. *(Which is probably needed at the beginning of every new encounter.)*

#### *MYZ* commands

* `roll <dice>` – Rolls dice for the *Mutant: Year Zero* roleplaying game. See possible outcome:
  * `roll d6|d66|d666 [name]` – Rolls a D6, D66, or D666.
  * `roll Xd|Xd6 [name]` – Rolls X D6 and sums their results.
  * `roll res d6|d8|d10|d12 [name]` – Rolls a Resource Die. *(Concept imported from Forbidden Lands.)*
  * `roll init [bonus]` – Rolls initiative with or without a bonus.
  * `roll [Xb][Ys][Zg] [Artifact Die] [name] [--fullauto]` – Rolls a pool of dice following the rules of MYZ:
    * `X b` – Rolls X base dice (yellow color).
    * `Y s` – Rolls Y skill dice (green color). Use `n` instead of `s` for negative dice.
    * `Z g` – Rolls Z gear dice (black color).
    * `Artifact Die` – Rolls an Artifact Die (`d6|d8|d10|d12`). *(Concept imported from Forbidden Lands.)*
    * `--fullauto` – Allows unlimited pushes.
* `crit [table]` – Rolls for a random critical injury. You may specify a table or a numeric value. The default is the damage table. Other available tables are:
  * `nontypical` or `nt` – Critical injury for non-typical damage.
  * `horror` or `h` – The *Forbidden Lands* Horror traumas, adapted for MYZ.
  * `pushed` – Critical injury for pushed damage (none).
* `scrap [quantity]` – Gets you a bunch of scrap.
* `rumor` – Tells a random rumor. *(Thanks to Myr Midon's work.)*
* `mutation` – Draws a random mutation (no details).
* `artifact` – Draws a random artifact (no details).
* `threat` – Draws a random Zone threat (no details).
* `arkthreat` – Draws a random threat against the Ark (no details).
* `monster` – Generates a random monster according to the tables found in *Zone Compendium 1: The Lair of the Saurians*.

#### *Forbidden Lands* commands

* `rollf <dice>` – Rolls dice for the *Forbidden Lands* roleplaying game. See possible outcome:
  * `rollf d6|d66|d666 [name]` – Rolls a D6, D66, or D666.
  * `rollf Xd|Xd6 [name]` – Rolls X D6 and sums their results.
  * `rollf res d6|d8|d10|d12 [name]` – Rolls a Resource Die.
  * `rollf init [bonus]` – Rolls initiative with or without a bonus.
  * `rollf [Xb][Ys][Zg] [Artifact Die] [name] [--fullauto]` – Rolls a pool of dice following the rules of MYZ:
    * `X b` – Rolls X base dice (yellow color).
    * `Y s` – Rolls Y skill dice (green color). Use `n` instead of `s` for negative dice.
    * `Z g` – Rolls Z gear dice (black color).
    * `Artifact Die` – Rolls an Artifact Die (`d6|d8|d10|d12`).
    * `--fullauto` – Allows unlimited pushes.
* `crit [table]` – Rolls for a random critical injury. You may specify a table or a numeric value. The default is the damage table from MYZ. Other available tables are:
  * `slash` or `sl` – The *Forbidden Lands* Critical injuries due to Slash Wounds.
  * `blunt` or `bl` – The *Forbidden Lands* Critical injuries due to Blunt Force.
  * `stab` or `st` – The *Forbidden Lands* Critical injuries due to Stab Wounds.
  * `horror` or `h` – The *Forbidden Lands* Horror traumas, adapted for MYZ.
* `demon` – Generates a random demon according to the tables found in the roleplaying game *Forbidden Lands*.
* `legend` – Generates a random legend according to the tables found in the roleplaying game *Forbidden Lands*.

#### *ALIEN* commands

* `rolla <dice>` – Rolls dice for the *ALIEN* roleplaying game. See possible outcome:
  * `rolla d6|d66|d666 [name]` – Rolls a D6, D66, or D666.
  * `rolla Xd|Xd6 [name]` – Rolls X D6 and sums their results.
  * `rolla res|supply <rating> [name]` – Rolls for a supply.
  * `rolla init [bonus]` – Rolls initiative with or without a bonus.
  * `rolla [Xb][Ys][Zg] [Artifact Die] [name] [--fullauto]` – Rolls a pool of dice following the rules of *ALIEN*:
    * `X b` – Rolls X base dice (black color).
    * `Y s` – Rolls Y stress dice (yellow color).
    * `--fullauto` – Allows unlimited pushes.
* `crit [table]` – Rolls for a random critical injury. You may specify a table or a numeric value. The default is the damage table from MYZ. Other available tables are:
  * `alien` or `a` – The *ALIEN* Critical injuries.
  * `synth` or `s` – The *ALIEN* Critical injuries on Synthetics and Androids.
  * `xeno` or `x` – The *ALIEN* Critical injuries on Xenomorphs.
  * `mental` or `m` – The *ALIEN* Permanent Mental traumas.
* `panic <stress>` – Rolls a random panic effect for the *ALIEN* roleplaying game.
* `star` – Generates a random star sector for the *ALIEN* rpg.
* `colony` – Generates a random colonized planet for the *ALIEN* rpg.
* `job` – Generates a random job for the *ALIEN* rpg.

#### Other commands

Only a member with administrator rights can change these settings:

* `setconf prefix [value]` – Changes the bot's prefix to a new value (can be '?' or '>' or anything else).
* `setconf game [name]` – Change the default icons layout for the rolled dice. Options are: `mutant|myz`, `fbl`, `alien`, `vaesen`.

### Roll Examples

`roll 4b1g` – Rolls 4 base and 1 gear dice.

`roll 5b3s Shake-It Off!` – Rolls 5 base, 3 skill dice, named "Shake-It Off!".

`roll 4b3s2g d10 Uber ROLL --fullauto` – Rolls 4 base, 3 skill, 2 gear dice and a D10 Artifact Die. The roll is named "Uber ROLL" and can be pushed any number of times. 

`rolla 8b2s` – Rolls 8 base and 2 stress dice for *ALIEN*. Pushing them will add an extra stress die.

`roll d66` – Rolls a D66 (D6 × 10 + D6).

`roll 2d` – Rolls two hexahedrons and sums their results.

`roll res d8 Torches` – Rolls a D8 Resource Die for "Torches".

`rolla supply 6 Air` – Rolls supply for "Air" with six stress dice and count ones (banes).

`roll init 1` – Rolls a D6 labelled "Initiative" and adds 1 to the result.

`init` or `init 1` – Draws one initiative cards.

`init shuffle` – Shuffles all the initiative cards in a new deck (= reset).

`panic 4` – Rolls a D6 and adds 4 to the result, then returns the result from the *ALIEN* roleplaying game Panic table.


### Dice Cap

The maximum number of dice that can be rolled at once is capped at 42. *(Discord messages have a limited number of characters.)*

### Pushing

The push option for the dice pool roll is available for 60 seconds. Only the user who initially rolled the dice can push them.

### Command Aliases

Most commands have aliases. For example, hitting `!roll` or `!sla` or `!rm` has the same output.

Send `!help <command>` for a list of aliases for a specific command.

# Permissions

This is a detailed list of needed permissions:

* `ADD_REACTIONS` : The bot uses a reaction menu for roll pushing.
* `VIEW_CHANNEL` : Mandatory.
* `SEND_MESSAGES` : Mandatory.
* `MANAGE_MESSAGES` : The bot needs this permission to remove pushing reaction emojis.
* `EMBED_LINKS` : The bot uses rich embed to display the dice results.
* `USE_EXTERNAL_EMOJIS` : The bot uses custom dice emojis.

# List of Changes

See the [CHANGELOG](https://github.com/Stefouch/sebedius-myz-discord-bot/blob/master/CHANGELOG.md#changelog) for a complete list of changes applied to the Bot.

# License

The literal and graphical information presented with this bot about *Mutant: Year Zero*, *Forbidden Lands* & *ALIEN*, including the textures, is copyright *Fria Ligan / Free League Publishing*. This bot is not produced by, endorsed by, supported by, or affiliated with *Fria Ligan*.

The bot's JS source code is under MIT license.

*FBL* dice's images are courtesy of M. Hilton Perantunes. Thanks to him for sharing them.

*ALIEN* dice's images are courtesy of M. Radomir Balint. Thanks to him for sharing them.

# Contributing

If you've experience with the Discord.js API, you're more than welcome to expand the project.

## How to Run Sebedius Locally

Install [Node.JS](https://nodejs.org/en/download/)

Install the required packages with the command:
```
npm install
```

Create a `.env` file with the following parameter:
```
TOKEN="YourBotTokenAlphaNumericChain"
```

Start the bot with the command:
```
npm start
```

And enjoy!

# Contact

Hit me up if you've any question!

**Twitter:** [Stefouch](https://twitter.com/stefouch)

**Discord:** Stefouch#5202 (join the [Year Zero Worlds](https://discord.gg/ftxkYZn) discord server for extra support and testing the bot.)

# Support

I'd like to thanks to Jeremy Mettler, Joe Guilmette, Matt Kay and all my other patrons and generous donators who are supporting this project and made it possible!

You too you can also support this project with as little as $1 per month.<br />Visit the [Stefouch's Patreon page](https://patreon.com/Stefouch) for details.

You may find [paypal.me/Stefouch](https://www.paypal.me/stefouch) useful for a one-time donation.

=]¦¦¦¬ 
