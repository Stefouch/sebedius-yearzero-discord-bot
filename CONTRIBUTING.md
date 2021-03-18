# Contributing

> Contributions, issues and feature requests are welcome!<br />Feel free to check the [issues page](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues).

You can help expanding Sebedius's knowledge on the following topics:

* New commands *(Discord.JS API)*
* Translations *(French, Swedish, etc.)*
  * Strings that should be translated are in the `lang/` and `gamedata/` directories.
  * Translate `.json` and `.yml` files at https://gitlocalize.com/repo/5925.
  * Translate critical injuries' `.csv` files in the `gamedata/crits/` directory.
* Gamedata
  * Critical Injuries tables (missing T2K)

## How to Contribute

Fork this repo and create a new branch with your modifications. When you are finished, create a pull request by following this guide, "[A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/)".

Accepted changes are then merged into the `develop` branch by the bot owner, until this branch is also merged into `master` when a stable release is ready.

## How to Run Sebedius Locally

Install [Node.JS](https://nodejs.org/en/download/)

Install the required packages with the command:
```
npm install
```

Create a secret `.env` file at the root with the following parameter:
```env
TOKEN="YourBotTokenAlphanumericChain"
```

Start the bot with the command:
```
npm start
```

And enjoy!


### Notes

The bot uses a PostgreSQL database. You can connect Sebedius to your own database by passing the authentification URI. To do so, add the following line to your `.env` file:
```env
DATABASE_URL="postgres://<user>:<password>@<server|localhost>:<port>/<name>"
```

PS: At the moment there is a known bug with the database integration not working with Node 14 ([#40](https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues/40)). If you want to use the PostgreSQL database, you must use Node 12 or 13 instead.
