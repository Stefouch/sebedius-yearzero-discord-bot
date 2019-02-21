Mutant Year Zero Discord Bot
============================

**Sebedius** is a [Discord](https://discordapp.com) bot with command utilities for the [Mutant: Year Zero](http://frialigan.se/en/games/mutant-year-zero/) roleplaying game.

Add the Bot to your Server
--------------------------

https://discordapp.com/api/oauth2/authorize?client_id=543445246143365130&scope=bot&permissions=289856

Available Commands
------------------

Commands are triggered with the prefix `!`. This prefix can be configured for your server.

* `help` : The bot's manual. Read it!
* `roll <dice> [name] [--fullauto]` : Rolls a pool of dice following the rules of MYZ. Click the reaction icon to push the roll. The syntax for `<dice>` is `[Wb][Xs][Yg][Za]`:
  * `[Wb]` : Rolls W base dice (yellow color).
  * `[Xs]` : Rolls X skill dice (green color).
  * `[Yg]` : Rolls Y gear dice (black color).
  * `[Za]` : Rolls an Artifact Die with Z faces, adapted from *Forbidden Lands*.
  * `[--fullauto]` : Allows unlimited pushes.
* `crit [table]` : Rolls for a random critical injury. You may specify a table or a numeric value. The default is the damage table. Other available tables are:
  * `nontypical` or `nt` : Critical injury for non-typical damage.
  * `pushed` or `p` : Critical injury for pushed damage (none).
  * `horror` or `h` : The *Forbidden Lands* Horror traumas, adapted for MYZ.
* `scrap [quantity]` : Gets you a bunch of scrap.
* `setconf prefix [value]` : Changes the bot's prefix to a new value (can be '?' or '>' or anything else).

Permissions
-----------

This is a detailed list of needed permissions:

* `ADD_REACTIONS` : The bot uses a reaction menu for roll pushing.
* `VIEW_CHANNEL` : Mandatory.
* `SEND_MESSAGES` : Mandatory.
* `MANAGE_MESSAGES` : The bot needs this permission to remove pushing reaction emojis.
* `EMBED_LINKS` : The bot uses rich embed to display the dice results.
* `USE_EXTERNAL_EMOJIS` : The bot uses custom dice emojis.

Contact
-------

=]¦¦¦¬ Stefouch#5202 on Discord. Hit me up if you've any question!
