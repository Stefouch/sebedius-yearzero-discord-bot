<h1 align="center">Year Zero Discord Bot<br/>🎲 <i>Sebedius</i> 🎲</h1>
<p align="center">
  <a href="https://discordbots.org/bot/543445246143365130" target="_blank">
    <img alt="Status" src="https://top.gg/api/widget/status/543445246143365130.svg"/>
  </a>
  <img alt="Version" src="https://img.shields.io/badge/dynamic/json?color=blue&label=version&query=version&url=https%3A%2F%2Fraw.githubusercontent.com%2FStefouch%2Fsebedius-yearzero-discord-bot%2Fmaster%2Fpackage.json&cacheSeconds=2592000"/>
  <a href="https://discord.js.org/" target="_blank">
    <img alt="Discord.js" src="https://img.shields.io/badge/Discord.JS-v14-informational?logo=discord"/>
  </a>
  <a href="https://github.com/Stefouch/sebedius-yearzero-discord-bot/wiki" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg"/>
  </a>
  <a href="https://github.com/Stefouch/sebedius-yearzero-discord-bot/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg"/>
  </a>
  <a href="https://github.com/Stefouch/sebedius-yearzero-discord-bot/blob/master/LICENSE" target="_blank">
    <img alt="License: GPL-3.0-or-later" src="https://img.shields.io/github/license/Stefouch/sebedius-yearzero-discord-bot"/>
  </a>
  <a href="https://www.patreon.com/Stefouch">
    <img src="https://img.shields.io/badge/donate-patreon-F96854.svg" alt="Patreon">
  </a>
  <a href="https://twitter.com/stefouch" target="_blank">
    <img alt="Twitter: stefouch" src="https://img.shields.io/twitter/follow/stefouch.svg?style=social"/>
  </a>
</p>

> :warning: **Important Changes!** :warning:<br/>
> As of September 1st 2022, due to Discord policies change over bots, Sebedius cannot read the content of messages anymore.<br/>
> The is the end of *prefixed* `!commands`. All Sebedius commands have therefore been disabled.<br/>
> But Sebedius will come back very soon with *Slash* `/commands`. See [Issues](../../issues) for more information.

> **Sebedius** is a [Discord](https://discordapp.com) bot with command utilities for the **Year Zero** roleplaying games by _Free League Publishing (Fria Ligan)_.

The supported games are:

- [Mutant: Year Zero](http://frialigan.se/en/games/mutant-year-zero/) & extensions
- [Forbidden Lands](https://frialigan.se/en/games/forbidden-lands/)
- [ALIEN – The Roleplaying Game](https://alien-rpg.com/)
- [Tales From The Loop](https://frialigan.se/en/games/tales-from-the-loop/) & Things From the Flood
- [Coriolis – The Third Horizon](https://frialigan.se/en/games/coriolis-2/)
- [Vaesen](https://frialigan.se/en/games/vaesen/)
- [Twilight 2000 4E](https://frialigan.se/en/games/twilight-2000/)
- [Blade Runner – The Roleplaying Game](https://www.bladerunner-rpg.com/)

# How to Use

1. [Add the bot to your server](xxxxx)<br/>
   The link will prompt you to authorize the bot on a server. Once the bot is authorized, you'll see it in the Member List.

2. [Read the Wiki](https://github.com/Stefouch/sebedius-yearzero-discord-bot/wiki#list-of-commands)<br/>
   Commands are triggered by the `/` slash character.<br/>_Example:_ `/help`

3. [Roll the dice](https://github.com/Stefouch/sebedius-yearzero-discord-bot/wiki/%21roll)<br/>
   _Example:_ `/roll alien dice:7` _or_ `/roll fbl base:5 skill:3 gear:2`

# Supported Languages

By default, Sebedius will use the locale defined in your server, if it is supported.

With the command `/conf locale:[language_code]` you can translate Sebedius into another language. Supported localisations are:

- `en` – English (default)

Your language isn't supported yet? See _Contributing_ below!

# Author

<p align="center">
  <a href="https://stefouch.be" target="_blank">
    <img src="https://stefouch.be/wp-content/uploads/2021/03/BSL-D6_bannerlogo_H150.png" alt="Stefouch"/>
  </a>
</p>

### 👤 Stefouch

- **Twitter:** [@stefouch](https://twitter.com/stefouch)
- **Github:** [@Stefouch](https://github.com/Stefouch)
- **Discord:** Stefouch#5202 on [Year Zero Worlds](https://discord.gg/RnaydHR)

# 🤝 Contributing

Contributions, translations, issues and feature requests are welcome!<br/>Feel free to check [issues page](../../issues). You can also take a look at the [contributing guide](../../CONTRIBUTING.md).

### Top Contributors

- @mprangenberg

# ❤️ Sponsoring

Give a ⭐️ if this project helped you!

<a href="https://www.patreon.com/Stefouch">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

Let's thank **Joe Guilmette, Narcomed and all my other patrons** and generous donators who are supporting this project and are making it possible! _May the bot be merciful with their rolls._

# List of Changes

See the [changelog](https://github.com/Stefouch/sebedius-yearzero-discord-bot/blob/master/CHANGELOG.md#changelog) for a complete list of changes applied to the Bot since 2019.

# Permissions

This is a detailed list of needed permissions for the bot:

- `ADD_REACTIONS` : The bot uses a reaction menu for roll pushing.
- `VIEW_CHANNEL` : Mandatory.
- `SEND_MESSAGES` : Mandatory.
- `MANAGE_MESSAGES` : The bot needs this permission to remove pushing reaction emojis.
- `EMBED_LINKS` : The bot uses rich embed to display the dice results.
- `READ_MESSAGE_HISTORY` : The bot cannot react to its own message without this permission.
- `USE_EXTERNAL_EMOJIS` : The bot uses custom dice emojis.

# 📝 License

> The literal and graphical information presented with this bot about _Mutant: Year Zero_, _Forbidden Lands_, _Alien RPG_, _Blade Runner RPH_, _Twiligh 2000_, _Coriolis_, _Tales From the Loop_ and _Vaesen_, including the textures (if any), is copyright _Free League Publishing (Fria Ligan)_. This bot is not produced by, endorsed by, supported by, or affiliated with _Fria Ligan_.

The dice images are courtery of the following people.<br/>
All credit goes to them!

- _Forbidden Lands_ dice by **Hilton Perantunes**.
- _Coriolis_ & _Tales_ dice by **Jonathan Pay**.
- _Alien RPG_ dice by **Radomir Balint**.
- _Vaesen_ dice by **Matt Kay**.

Copyright © 2019-2022 [Stefouch](https://github.com/Stefouch).<br/>
This project JavaScript code is [GPL-3.0-or-later](https://github.com/Stefouch/sebedius-yearzero-discord-bot/blob/master/LICENSE) licensed.

---

<small>_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_</small>
