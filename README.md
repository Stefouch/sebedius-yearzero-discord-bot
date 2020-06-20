# Year Zero Discord Bot

[![Discord Bots](https://discordbots.org/api/widget/status/543445246143365130.svg)](https://discordbots.org/bot/543445246143365130)

**Sebedius** is a [Discord](https://discordapp.com) bot with command utilities for the Year Zero roleplaying games by *Free League Publishing (Fria Ligan)*.

The supported games are:
* [Mutant: Year Zero](http://frialigan.se/en/games/mutant-year-zero/)
* [Forbidden Lands](https://frialigan.se/en/games/forbidden-lands/)
* [Tales From The Loop](https://frialigan.se/en/games/tales-from-the-loop/) & Things From the Flood
* [Coriolis – The Third Horizon](https://frialigan.se/en/games/coriolis-2/)
* [ALIEN](https://alien-rpg.com/)
* [Vaesen](https://frialigan.se/en/games/vaesen/)

# Add the Bot to your Server

Follow this link: https://discordapp.com/api/oauth2/authorize?client_id=543445246143365130&scope=bot&permissions=354368

The link will prompt you to authorize the bot on a server. Once the bot's authorized, you'll see it in the Member List.

# Available Commands

Commands are triggered with the prefix `!`. This prefix can be configured for your server. The commands can be executed from channels and some of them privately through DMs.

### Vocabulary

Below you'll find a list of available commands to use. The instructions use the following scheme:

* Chevrons `<...>` mean that the argument is mandatory for the command to work.
* Brackets `[...]` mean that the argument is facultative.
* Vertical bar `|` means "OR". *E.g. `d6|d66` means you can type either d6 or d66 for the command.*

### Generic commands

* `help` – The bot's manual. Read it! Use the `--no-dm` argument to diplay the help message on the channel.
* `initiative [quantity]` – Draws one or more initiative cards. The deck is specific to each Discord server. Use the parameter `shuffle` to reset it. *(Which is probably needed at the beginning of every new encounter.)*
* `ping` – Checks the bot's latency.

### **ROLL** command

Rolls dice for the Year Zero roleplaying games.

```
roll [game] <dice> [arguments]
```

* `[game]` is used to specify the skin of the rolled dice. Can be omitted.
  * Choices: `myz` *(Mutant: Year Zero)*, `fbl` *(Forbidden Lands)*, `tales` *(Tales From The Loop)*, `coriolis`, `alien` and `vaesen`.
* `<dice>`
  * **Simple Rolls**
    * `d6|d66|d666` – Rolls a D6, D66, or D666.
    * `XdY±Z` – Rolls X dice of range Y, modified by Z. *E.g. 2d20+3.*
    * `init` – Rolls initiative (one D6).
  * **Year Zero Rolls:** Use any combinations of these letters with a number: *E.g. 5b 3s 2g*
    * `b` – Base dice (attributes)
    * `s` – Skill dice / Stress dice (for ALIEN)
    * `g` – Gear dice (from equipment)
    * `n` – Negative dice (for MYZ and FBL)
    * `d` – Generic dice
    * `a8` – D8 Artifact dice (from FBL)
    * `a10` – D10 Artifact dice (from FBL)
    * `a12` – D12 Artifact dice (from FBL)
* `[arguments]` are additional options for the roll:
  * `-n <text>` : Defines a name for the roll.
  * `-p <number>` : Changes the maximum number of allowed pushes.
  * `-f` : "Full-auto", unlimited number of pushes (max 10).
  * `-pride` : Adds a D12 Artifact Die to the roll.

#### Dice Cap

The maximum number of dice that can be rolled at once is capped at 42. *(Discord messages have a limited number of characters.)*

#### Pushing

To push the roll, click the 🔄 reaction icon under the message. The push option for the dice pool roll is available for 2 minutes. Only the user who initially rolled the dice can push them.

### **CRIT** command

Rolls for a random critical injury.

```
crit [game] [table] [numeric]
```

* `[game]` – Specifies the game you are using *(default is "myz")*.
  * Choices: `myz` *(Mutant: Year Zero)*, `fbl` *(Forbidden Lands)*, `tales` *(Tales From The Loop)*, `coriolis`, `alien` and `vaesen`.
* `[table]` – Specifies the table you want from this game *(default is "damage")*.
* `[numeric]` – Specifies a fixed reference.

### **MYZ** specific commands

* `rollmutant`|`rm` – Shortcut for rolling dice. See the **Roll** command above for more details.
* `critmutant`|`critm` – Shortcut for critical tables. See the **Crit** command above for more details. Available tables:
  * `damage`|`dmg` – Critical injuries from damage
  * `horror`|`h` – The *Forbidden Lands* Horror traumas, adapted for MYZ
  * `nontypical`|`nt` – Critical injury for non-typical damage
  * `pushed`|`p` – Critical injury for pushed damage (none)
* `scrap [quantity]` – Gets you a bunch of scrap
* `rumor` – Tells a random rumor. *(Thanks to Myr Midon's work.)*
* `mutation` – Draws a random mutation (no details).
* `artifact` – Draws a random artifact (no details).
* `threat` – Draws a random Zone threat (no details).
* `arkthreat` – Draws a random threat against the Ark (no details).
* `monster` – Generates a random monster according to the tables found in *Zone Compendium 1: The Lair of the Saurians*.

### **Forbidden Lands** specific commands

* `rollfbl`|`rf` – Shortcut for rolling dice. See the **Roll** command above for more details.
* `critfbl`|`critf` – Shortcut for critical tables. See the **Crit** command above for more details. Available tables:
  * `slash`|`sl` – Critical injuries due to Slash wounds
  * `blunt`|`bl` – Critical injuries due to Blunt force
  * `stab`|`st` – Critical injuries due to Stab wounds
  * `horror`|`h` – Horror traumas
  * `nontypical`|`nt` – Critical injury for non-typical damage
  * `pushed`|`p` – Critical injury for pushed damage (none)
* `demon` – Generates a random demon according to the tables found in the roleplaying game *Forbidden Lands*.
* `legend` – Generates a random legend according to the tables found in the roleplaying game *Forbidden Lands*.

### **ALIEN** specific commands

* `rollalien`|`ra` – Shortcut for rolling dice. See the **Roll** command above for more details.
* `critalien`|`crita` – Shortcut for critical tables. See the **Crit** command above for more details. Available tables:
  * `damage`|`d` – Critical injuries from damage
  * `synthetic`|`synth`|`s` – Critical injuries on Synthetics and Androids
  * `xeno`|`x` – Critical injuries for Xenomorphs
  * `mental`|`m` – Permanent mental traumas
* `panic <stress> [-f <number>]` – Rolls a random panic effect for the *ALIEN* roleplaying game. Use the `-f` parameter for a fixed value. 
* `star` – Generates a random star sector for the *ALIEN* rpg.
* `colony` – Generates a random colonized planet for the *ALIEN* rpg.
* `job` – Generates a random job for the *ALIEN* rpg.

### **Tales From The Loop** commands

* `rolltales`|`rt` – Shortcut for rolling dice. See the **Roll** command above for more details.

### **Coriolis** commands

* `rollcoriolis`|`rc` – Shortcut for rolling dice. See the **Roll** command above for more details.

### **Vaesen** commands

* `rollvaesen`|`rv` – Shortcut for rolling dice. See the **Roll** command above for more details.

### Other commands

Only a member with administrator rights can use these commands:

* `setconf prefix [value]` – Changes the bot's prefix to a new value (can be '?' or '>' or anything else).
* `setconf game [name]` – Changes the default game used (for dice skins and critical tables). Options are: `myz`, `fbl`, `tales`, `coriolis`, `alien`, `vaesen`.
* `setconf lang [language code]` – Changes the default language (for translations). There are no options currently (it's implemented for future updates).

## Examples

`roll 4b1g` – Rolls 4 base and 1 gear dice.

`roll 5b 3s -n Shake-It Off!` – Rolls 5 base, 3 skill dice, named "Shake-It Off!".

`rf 4b3s 2g a10 -n Uber ROLL -f` – Rolls 4 base, 3 skill, 2 gear dice and a D10 Artifact Die. The roll is named "Uber ROLL" and can be pushed any number of times. Uses Forbidden Lands skin for the dice.

`ra 8b 2s` – Rolls 8 base and 2 stress dice for *ALIEN*. Pushing them will add an extra stress die.

`roll d66` – Rolls a D66 (D6 × 10 + D6).

`roll 2d` – Rolls two hexahedrons.

`roll d2` – Rolls a d2 (a coin).

`res d8 Torches` – Rolls a D8 Resource Die for "Torches".

`supply 6 Air` – Rolls supply for "Air" with six stress dice and counts ones (banes).

`init` or `init 1` – Draws one initiative cards.

`init shuffle` – Shuffles all the initiative cards in a new deck (= reset).

`panic 4` – Rolls a D6 and adds 4 to the result, then returns the result from the *ALIEN* rpg's Panic table.

`crit fbl slash` – Draws a random critical injury from the Slash amage table in Forbidden Lands.

`crita dmg 66` – Draws the #66 critical injury from the Damage table in the ALIEN rpg. You're dead.

## Command Aliases

Most commands have aliases. For example, hitting `!roll` or `!sla` or `!r` has the same output.

Type `!help <command>` for a list of aliases for a specific command.

# Permissions

This is a detailed list of needed permissions:

* `ADD_REACTIONS` : The bot uses a reaction menu for roll pushing.
* `VIEW_CHANNEL` : Mandatory.
* `READ_MESSAGE_HISTORY` : The bot cannot react to its own message without this permission. ⚠️<font color=red>**NEW**</font>
* `SEND_MESSAGES` : Mandatory.
* `MANAGE_MESSAGES` : The bot needs this permission to remove pushing reaction emojis.
* `EMBED_LINKS` : The bot uses rich embed to display the dice results.
* `USE_EXTERNAL_EMOJIS` : The bot uses custom dice emojis.

# List of Changes

See the [CHANGELOG](https://github.com/Stefouch/sebedius-myz-discord-bot/blob/master/CHANGELOG.md#changelog) for a complete list of changes applied to the Bot.

# License

The literal and graphical information presented with this bot about *Mutant: Year Zero*, *Forbidden Lands* & *ALIEN*, including the textures, is copyright *Fria Ligan / Free League Publishing*. This bot is not produced by, endorsed by, supported by, or affiliated with *Fria Ligan*.

The bot's JavasScript source code is under MIT license.

The dice images are courtery of several people. Thanks to them for sharing them!

- *Forbidden Lands* dice: M. Hilton Perantunes.
- *Tales* & *Coriolis* dice: M. Jonathan Pay.
- *ALIEN* dice: M. Radomir Balint. 
- *Vaesen* dice: M. Matt Kay

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

I'd like to thank Jeremy Mettler, Joe Guilmette, Matt Kay and all my other patrons and generous donators who are supporting this project and made it possible!

You too you can also support this project.<br />Visit the [Stefouch's Patreon page](https://patreon.com/Stefouch) for details.

You may find [paypal.me/Stefouch](https://www.paypal.me/stefouch) useful for a one-time donation.

=]¦¦¦¬ 
