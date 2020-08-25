## Initiative Tracker

Initiative tracking commands. Inspired from the [D&D Avrae Discord bot](https://avrae.io/)
<br />To use, first start combat in a channel by saying `!init begin`.
<br />Then, each combatant should add themselves to the combat with `!init add` or `!init join`.
<br />To hide a combatant's HP, add them with `!init add -h`.
<br />Then, you can proceed through combat with `!init next`.
<br />Once combat ends, end combat with `!init end`.
<br />For more help, the `!init help` command shows applicable arguments for each subcommand.

```
![init|i|initiative] <subcommand>
```

- [add](#init-add-name-options) – Adds a generic combatant to the initiative order.
- [attack](#init-attackatk-damage--t-target-names-options) – Inflicts damage to another combatant.
- [begin](#init-begin--name-name--game-game--turnnotif) – Begins combat in the channel the command is invoked.
- [edit](#init-edit-name-options) – Edits the options of a combatant.
- [end](#init-end--force) – Ends combat in the channel.
- [help](#init-help-subcommand) – Gives help for a specific subcommand.
- [hp](#init-hp-name-value--max) – Modifies the HP of a combatant.
- [join](#init-join-options) – Adds the current player to combat.
- [list/summary](#init-listsummary--private) – Lists the combatants.
- [madd](#init-madd-name--n-quantity-options) – Adds a monster to combat.
- [meta](#init-meta) – Changes the settings of the active combat.
- [move/goto](#init-movegoto-target) – Moves to a certain initiative.
- [next](#init-nextn) – Moves to the next turn in initiative order.
- [note](#init-note-name-note) – Attaches a note to a combatant.
- [previous](#init-previousp) – Moves to the previous turn in initiative order.
- [remove](#init-remove-name) – Removes a combatant or group from the combat.
- [skipround](#init-skiproundskip) – Skips one or more rounds of initiative.
- [status](#init-status-name--private) – Adds a generic combatant to the initiative order.

### `!init help <subcommand>`

Gives help for a specific subcommand.

### `!init begin [-name <name>] [-game <game>] [-turnnotif]`

Begins combat in the channel the command is invoked.

* `-name <name>` – Sets a name for the combat instance.
* `-game <game>` – Sets the game. If omitted, use the default set in the server's configuration.
* `-turnnotif` – Toggles the notification of the controller of the next combatant in initiative.

### `!init add <name> [options...]`

Adds a generic combatant to the initiative order.
<br />Generic combatants have 3 life, no armor, and speed 1.
<br />If you are adding monsters to combat, you can use `!init madd` instead.

| Options | Details |
| --- | --- |
| `-p <value1 value2 ...>` | Places combatant at the given initiative, instead of drawing. |
| `-controller <mention>` | Pings a different person on turn. |
| `-group\|-g <name>` | Adds the combatant to a group. |
| `-hp <value>` | Sets starting HP. Default: 3. |
| `-ar <value>` | Sets the combatant's armor. Default: 0.
| `-speed <value>` | Sets the combatant's speed (number of initiative cards to draw). Default: 1. |
| `-haste <value>` | Draws more initiative cards and keeps the best one. The other are shuffled back into the deck before others draw their cards. Use this for special talents like *Lightning Fast*. Default: 1. |
| `-h` | Hides life, AR and anything else. |

### `!init join [options...]`

Same as above, but you don't need to specify a name. The command will use your displayed name on the server. The command will be used in future updates in combination with character sheets.

### `!init madd <name> [-n <quantity>] [options...]`

Adds one or more monster combatant(s). Same as `!init add`, but in addition you can specify a number of combatants with the `-n <quantity>` parameter.

### `!init next|n`

Moves to the next turn in initiative order. It must be your turn or you must be the GM (the person who started combat) to use this command.

### `!init previous|p`

Moves to the previous turn in initiative order.

### `!init move|goto [target]`

Moves to a certain initiative. `target` can be either a number, to go to that initiative, or a name. If not supplied, goes to the first combatant that the user controls.

### `!init skipround|skip`

Skips one or more rounds of initiative.

### `!init meta`

Changes the settings of the active combat. See `!init begin` for the list of parameters to use.

### `!init list|summary [-private]`

Lists the combatants. The parameter `-private` sends the list in a private message.

### `!init note <name> [note]`

Attaches a note to a combatant.

### `!init edit <name> [options...]`

Edits the options of a combatant. This command uses the same options from `!init add` with the following in addition:

| Options | Details |
| --- | --- |
| `-name <name>` | Changes the combatant's name. |
| `-max <value>` | Modifies the combatants' Max HP. Adds if starts with +/- or sets otherwise. |

### `!init status <name> [-private]`

Gets the status of a combatant or group. The parameter `-private` sends a more detailed status in a private message to the controller of the combatant.

### `!init hp <name> [value] [-max]`

Modifies the HP of a combatant. If the value is omitted, instead prints the details of the combatant. Use parameter `-max` if you want to set the Max HP value instead.

### `!init attack|atk <damage> [-t|-target <names...>] [options...]`

Inflicts damage to another combatant.

| Options | Details |
| --- | --- |
| `-t\|-target <names...>` | The target to inflict damage. If omitted, uses the current combattant. You can specify multiple targets by separating them with the `\|` character. *E.g.: `-t Bob\|Will\|Smith`* |
| `-ap [value]` | Armor piercing. Default is halved, rounded up. If a value is specified, instead decrease the Armor Rating by this value. |
| `-ad` | Armor doubled. *(E.g.: for Shotguns in ALIEN rpg.)* |
| `-ab\|-bonus` | Armor bonus (applied after all other modifications). |
| `-x\|-degrade` | Wether the armor should be degraded. If omitted, uses the default from the game set. |
| `-noar\|-noarmor` | Skips the armor roll. |
| `-h|-hidden|-private` | Hides the armor roll. |

### `!init remove <name>`

Removes a combatant or group from the combat.

### `!init end [-force]`

Ends combat in the channel. The parameter `-force` forces an init to end, in case it's erroring.