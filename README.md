# Year Zero Discord Bot

[![Discord Bots](https://discordbots.org/api/widget/status/543445246143365130.svg)](https://discordbots.org/bot/543445246143365130)

**Sebedius** is a [Discord](https://discordapp.com) bot with command utilities for the **Year Zero** roleplaying games by *Free League Publishing (Fria Ligan)*.

The supported games are:
* [Mutant: Year Zero](http://frialigan.se/en/games/mutant-year-zero/)
* [Forbidden Lands](https://frialigan.se/en/games/forbidden-lands/)
* [Tales From The Loop](https://frialigan.se/en/games/tales-from-the-loop/) & Things From the Flood
* [Coriolis – The Third Horizon](https://frialigan.se/en/games/coriolis-2/)
* [ALIEN](https://alien-rpg.com/)
* [Vaesen](https://frialigan.se/en/games/vaesen/)

# Add the Bot to your Server

Follow this link: https://discordapp.com/api/oauth2/authorize?client_id=543445246143365130&scope=bot&permissions=355392

The link will prompt you to authorize the bot on a server. Once the bot's authorized, you'll see it in the Member List.

# Available Commands

Commands are triggered with the prefix `!` or by mentioning the bot. This prefix can be configured for your server. The commands can be executed from channels and some of them privately through DMs.

### Vocabulary

Below you'll find a list of available commands. The instructions use the following scheme:

* Chevrons `<...>` mean that the argument is mandatory for the command to work.
* Brackets `[...]` mean that the argument is facultative.
* Vertical bar `|` means "OR". *E.g. `d6|d66` means you can type either d6 or d66 for the command.*

### Generic commands

* `help [command name] [--no-dm]` – The bot's manual. Read it! Use the `--no-dm` argument to diplay the help message on the channel.
* `ping` – Checks the bot's latency.
* `invite` – Prints a link to invite Sebedius to your server.
* `changelog` – Prints a link to the official changelog.
* `prefix [new prefix]` – Gets the prefixes for the current server. If a new prefix is specified as an argument, the server's prefix is changed into the new one.
* `drawinit <speed> [-haste <value>] [shuffle]` – Draws one or more initiative cards. The deck is specific to each Discord server.
  * `<speed>` – Number of initiative cards to draw. Default: 1.
  * `[-haste <value>]` – Draws more initiative cards and keeps the best one. The other are shuffled back into the deck before others draw their cards. Use this for special talents like *Lightning Fast*. Default: 1.
  * `[-shuffle]` – Resets the deck. *(Which is probably needed at the beginning of every new encounter.)*`

### **ROLL** command

Rolls dice for the Year Zero roleplaying games.

```
roll [game] <dice> [arguments]
```

* `[game]` is used to specify the skin of the rolled dice. Can be omitted if you set it with `!setconf game [default game]` or if you use one of the shortcut commands.
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

To push the roll, click the 🔄 reaction icon under the message. The push option for the dice pool roll is available for 2 minutes. Only the user who initially rolled the dice can push them. To clear the reaction menu, click the ❌ reaction icon.

Coriolis has more push options: 🙏 (Praying the Icons, +1D) and 🕌 (in a chapel, +2D).

### **CRIT** command

Rolls for a random critical injury.

```
crit [game] [table] [numeric]
```

* `[game]` – Specifies the game you are using. Can be omitted if you set it with `!setconf game [default game]`.
  * Choices: `myz` *(Mutant: Year Zero)*, `fbl` *(Forbidden Lands)*, `tales` *(Tales From The Loop)*, `coriolis`, `alien` and `vaesen`.
* `[table]` – Specifies the table you want from this game *(default is "damage")*.
* `[numeric]` – Specifies a fixed reference.

### **INIT** command

Tracks the initiative of combatants. Read the detailed help here:
<br />https://github.com/Stefouch/sebedius-myz-discord-bot/blob/master/InitTracker-README.md

```
init <subcommand>
```

### **Mutant Year Zero** commands

* `rollmutant|rm` – Shortcut for rolling dice. See the **Roll** command above for more details.
* `critmutant|critm` – Shortcut for critical tables. See the **Crit** command above for more details. Available tables:
  * `damage|dmg` – Critical injuries from damage
  * `horror|h` – The *Forbidden Lands* Horror traumas, adapted for MYZ
  * `nontypical|nt` – Critical injury for non-typical damage
  * `pushed|p` – Critical injury for pushed damage (none)
* `mutation <mp>` – Rolls dice for a Mutation and checks for any Misfire.
* `feral <fp>` – Rolls dice for a GenLab Alpha Animal Power and checks for any Feral Effect.
* `module <ep>` – Rolls dice for a Mechatron Module and checks for any Overheating.
* `contact <ip>` – Rolls dice for an Elysium Contact and checks for any Backlash.
* `scrap [quantity]` – Gets you a bunch of scrap
* `rumor` – Tells a random rumor. *(Thanks to Myr Midon's work.)*
* `drawmutation [all | gla zc2 zc5 psi]` – Draws a random mutation (no details).
* `artifact [all | myz meta gla mech ely astra]` – Draws a random artifact (no details).
* `threat` – Draws a random Zone threat (no details).
* `arkthreat` – Draws a random threat against the Ark (no details).
* `monster` – Generates a random monster according to the tables found in *Zone Compendium 1: The Lair of the Saurians*.

### **Forbidden Lands** commands

* `rollfbl|rf` – Shortcut for rolling dice. See the **Roll** command above for more details.
* `critfbl|critf` – Shortcut for critical tables. See the **Crit** command above for more details. Available tables:
  * `slash|sl` – Critical injuries due to Slash wounds
  * `blunt|bl` – Critical injuries due to Blunt force
  * `stab|st` – Critical injuries due to Stab wounds
  * `horror|h` – Horror traumas
  * `nontypical|nt` – Critical injury for non-typical damage
  * `pushed|p` – Critical injury for pushed damage (none)
* `cast <power> [-mishap <value>]` – Rolls a spell's Power Level.
* `mishap [value]` – Draws a random Magic Mishap.
* `demon` – Generates a random demon according to the tables found in the roleplaying game *Forbidden Lands*.
* `legend` – Generates a random legend according to the tables found in the roleplaying game *Forbidden Lands*.

### **ALIEN** commands

* `rollalien|ra` – Shortcut for rolling dice. See the **Roll** command above for more details.
* `critalien|crita` – Shortcut for critical tables. See the **Crit** command above for more details. Available tables:
  * `damage|d` – Critical injuries from damage
  * `synthetic|synth|s` – Critical injuries on Synthetics and Androids
  * `xeno|x` – Critical injuries for Xenomorphs
  * `mental|m` – Permanent mental traumas
* `panic <stress> [-f <number>]` – Rolls a random panic effect. Use the `-f` parameter for a fixed value. 
* `planet` – Generates a random planet.
* `colony` – Generates a random colonized planet.
* `star` – Generates a random star sector.
* `job <cargo | mil | expe>` – Generates a random job.

### **Tales From The Loop** commands

* `rolltales|rt` – Shortcut for rolling dice. See the **Roll** command above for more details.

### **Coriolis** commands

* `rollcoriolis|rc` – Shortcut for rolling dice. See the **Roll** command above for more details.

### **Vaesen** commands

* `rollvaesen|rv` – Shortcut for rolling dice. See the **Roll** command above for more details.

### Other commands

Only a member with administrator rights can use these commands:

* `setconf prefix [new prefix]` – Changes the bot's prefix to a new value (can be '?' or '>' or anything else).
* `setconf game [game code]` – Changes the default game used (for dice skins and critical tables). Options are: `myz`, `fbl`, `tales`, `coriolis`, `alien`, `vaesen`.
* `setconf lang [language code]` – Changes the default language (for translations). There are no options currently (it's implemented for future updates).

## Examples

`roll 4b1g` – Rolls 4 base and 1 gear dice.

`roll 5b 3s -n Shake-It Off!` – Rolls 5 base, 3 skill dice, named "Shake-It Off!".

`rf 4b3s 2g a10 -n Uber ROLL -f` – Rolls 4 base, 3 skill, 2 gear dice and a D10 Artifact Die. The roll is named "Uber ROLL" and can be pushed any number of times. Uses Forbidden Lands skin for the dice.

`rf 4b 2n -pride` – Takes 4 base dice and 2 negative dice *(Forbidden Lands)*, adds a D12 Artifact Die, and rolls them all.

`roll 3b 2b 1b 2s 1s 1g 1g` – Rolls (3+2+1) base dice, (2+1) skills dice and (1+1) gear dice.

`rc 4d -p 0` – Rolls 4 dice for *Coriolis* and the roll can't be pushed.

`rv 6d -p 2` – Rolls 6 dice for *Vaesen* and the roll can be pushed twice.

`ra 8b 2s` – Rolls 8 base and 2 stress dice for *ALIEN*. Pushing them will add an extra stress die.

`roll d66` – Rolls a D66 (D6 × 10 + D6).

`roll 2d` – Rolls two hexahedrons.

`roll d2` – Rolls a d2 (a coin).

`res d8 Torches` – Rolls a D8 Resource Die for "Torches".

`supply 6 Air` – Rolls supply for "Air" with six stress dice and counts ones (banes).

`init` or `init 1` – Draws one initiative cards.

`init shuffle` – Shuffles all the initiative cards in a new deck (= reset).

`panic 4` – Rolls a D6 and adds 4 to the result, then returns the result from the *ALIEN* rpg's Panic table.

`crit fbl slash` – Draws a random critical injury from the Slash damage table in Forbidden Lands.

`crita dmg 66` – Draws the #66 critical injury from the Damage table in the ALIEN rpg. You're dead.

## Command Aliases

Most commands have aliases. For example, hitting `!roll` or `!sla` or `!r` has the same output.

Type `!help <command>` for a list of aliases for a specific command.

# Permissions

This is a detailed list of needed permissions:

* `ADD_REACTIONS` : The bot uses a reaction menu for roll pushing.
* `VIEW_CHANNEL` : Mandatory.
* `SEND_MESSAGES` : Mandatory.
* `MANAGE_MESSAGES` : The bot needs this permission to remove pushing reaction emojis.
* `EMBED_LINKS` : The bot uses rich embed to display the dice results.
* `READ_MESSAGE_HISTORY` : The bot cannot react to its own message without this permission. ⚠️<span style="color: red;">**NEW**</span>
* `USE_EXTERNAL_EMOJIS` : The bot uses custom dice emojis.

### Troubleshooting

If the bot is missing any permission above, it might not work properly.

| Symptoms | Probable Cause | Fix |
| --- | --- | --- |
| Roll command: the push emoji reaction is not removed after a few minutes.| `MANAGE_MESSAGE` is missing. | See below. |
| Roll command: the push emoji reaction don't appear at all and the roll can't be pushed | `READ_MESSAGE_HISTORY` is missing. | See below. |
| The bot does not respond to a command. | Latency, wrong prefix, or bot crash. | Wait and retry. Check latency with command `!ping`, check the prefix by mentioning the bot. |

1. Check that the bot has all the required permissions in the server (check its role).
2. Check also that it has no denied permission in the channel (maybe the role `@everyone` or another one is removing the needed permission).
3. Kick the bot and re-invite it to your server using the link at the top of this Readme.
4. As a last resort, you can temporary give full admin rights to the bot, it'll fix all permission problems.
4. Contact me for extra support, I'll be glad to help.

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
TOKEN="YourBotTokenAlphanumericChain"
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

You too you can support this project.
<br />Visit the [Stefouch's Patreon page](https://patreon.com/Stefouch) for details.

Paypal: [paypal.me/Stefouch](https://www.paypal.me/stefouch)

=]¦¦¦¬ 
