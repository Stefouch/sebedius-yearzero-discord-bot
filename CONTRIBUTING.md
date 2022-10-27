<img src="" alt="Logo" style="max-width:100%;" />
<p align="center">Thank you for wanting to contribute to this project!</p>
<br>

# Contributing to Sebedius Discord Bot

This project depends on the Free League community. That is why we try to accept all contributions no matter how small, or how new you are to programming or Discord. The below are mostly guidelines on how to contribute to the project.

### But I just have a question!

> **Note:** [Please don't file an issue to ask a question.](/../../issues) You'll get better help by using the resources below.

If you have usage questions the best place to get help is in the [#digital-tools channel on the Year Zero Worlds Discord](https://discord.gg/RnaydHR). _(I'm always lurking there.)_ You can also test the bot in the #dice-rolling channel before deciding to invite it in your own Discord server.

### Table of contents

1. [Localization](#globe_with_meridians-Localization)

2. [Get Started](#rocket-get-started)

3. [What's in the Box?](#package-whats-in-the-box)

4. [How do I Contribute?](#hammer_and_wrench-how-do-i-contribute)

5. [Pull Requests](#dart-pull-requests)

## :globe_with_meridians: Localization

We are grateful for any and all localization support we can get. To localize the system you do not need to download or set up the system. To make it easier to help with localization we are using GitLocalize. All you need is a GitHub account. Then you can [head over to our GitLocalize page](https://gitlocalize.com/repo/7923) and start translating.

There are small restrictions imposed for the translations of commands:

- Command's names can only have letters and must have between 3 and 32 characters.
- Command's descriptions cannot have more than 100 characters.

Once you are done, click the yellow button that says "Create Review Request" and GitLocalize will handle the rest on your behalf.

### But I don't see my language in the list!

> Don't worry!

Click the "Add Language" button and get started. :+1:

## :rocket: Get Started

> **Important!** You need to [have node.js LTS-version installed](https://nodejs.org/en/) with npm available.

**Fork** or [Clone](https://github.com/Stefouch/sebedius-yearzero-discord-bot.git) the project and open the project folder in your terminal:

### 0. Get a Discord developer account

It's easy and simple: Take a visit to the [Discord's Developers Portal](https://discord.com/developers/applications), create a new application and generate a token.

### 1. Install dependencies

```sh
# Install the dependencies.
❯ npm install

# And Husky
❯ npm run husky:install
```

### 2. Create the environment variables

Create a secret `.env` file at the root that will store your sensitive data, like the discord token. See the `.env.example` file for an example.

### 3. Register the slash commands (optional)

Slash commands must be registered to the Discord server, which might take time before the refresh take effect.

However, if you specify the `BOT_GUILD_ID` environment variable in the `.env` file with the ID of your test guild, the commands will be immediately registered for that guild. Useful in a develop environment.

```sh
# Register the commands.
❯ npm run register
```

### 4. Launch the bot

```sh
# Start the bot.
❯ node bot.js
```

> To stop the process, hit CTRL+C.

> **It's not working!** If somewhere along the line something failed, do not stress! Please reach out to us in either Discord or the Issues page here. See [But I just have a question!](#but-i-just-have-a-question)

### 5. .Husky

This project uses the [git hooks automator: Husky](https://typicode.github.io/husky/#/). Husky helps improve the workflow of the project by controlling commit messages for semver compatibility, and automates building, linting and formatting. For your own ease of use it is important you make sure that Husky is functioning correctly.

To do so make a test branch in the project and commit a new file using a commit message that will fail. E.g.

```sh
❯ git checkout -b test-branch
❯ touch test.file
❯ git commit -am "feat: test commit"
```

You should now see Husky running. And if it works correctly the commit should pass and an emoji should be added to the commit message lke so `feat: ✨ test commit`.

If you have permission issues with Husky on Linux or macOS. Run the below commands to set the right executable permissions for Husky and git hooks.

```bash
❯ chmod ug+x .husky/*
❯ chmod ug+x .git/hooks/*
```

## :package: What's in the Box?

Following are some of the files and folders that you may be interested in editing, and some you shouldn't edit:

```
.
├── 📁 .github
├── 📁 .husky
├── 📁 .vscode
├── 📁 archives
├── 📁 node_modules*
├── 📁 src
│   ├── 📁 commands
│   │   └── 📁 ...
│   ├── 📁 events
│   ├── 📁 locales
│   ├── 📁 structures
│   │   ├── 📁 database
│   │   └── 📁 handlers
│   ├── 📁 utils
│   ├── 📁 yearzero
│   │   └── 📁 roller
│   │   │   └── 📁 dice
│   ├── _template.command.js
│   ├── config.js
│   └── constants.js
├── 📁 tools
├── .editorconfig
├── .env*
├── .env.example
├── .eslintignore
├── .eslintrc
├── .gitattributes
├── .gitignore
├── .prettierignore
├── .prettierrc
├── bot.js
├── CHANGELOG.md
├── CONTRIBUTING.md
├── gulpfile.js
├── jsconfig.json
├── LICENSE
├── package.json
├── package-lock.json
├── Procfile
├── README.md
├── register.js
└── SUPPORTERS.md
```

0. `.github/`: This directory contains Github Actions CI files and Github Issue Templates.
1. `.husky/`: This is a git hooks enhancment tool. See [.Husky](#5._.husky)
2. `node_modules/` \*_Generated_: A directory generated when running the `npm install` command. It contains all the dependencies of the project.
3. `src/`: This is the directory you want to focus most of your attention on. It contains the following files and subdirectories:
   - `commands/`: Bot commands, sorted in subfolders. You can use the `_template.command.js` as a starting point when developing your own commands.
   - `events/`: Bot events. The most important one is the `interactionCreate` event.
   - `structures/`: Core structures for the bot. The subfolder `database/` contains the schemas and models for the database. In `/handlers` you'll find the methods that imports and loads the commands and events.
   - `utils/`: Collection of utilitary methods used by the bot.
   - `yearzero/`: Contains the gamedata and all methods dedicated to the games.
     - `roller/`, `dice/`: The YZ roll engine and the defined dice.
   - `config.js`: Configuration values for the bot.
   - `constants.js`: Constant values for the bot.
4. `static/`: The static directory contains assets. It rarely sees changes and contains the following subdirectories:
   - `assets/`: Pictures, icons, and other assets.
   - `fonts/`: Typography files.
5. `tools/`: Other utilities not used by the game system.
6. `.env`, `.env.example`: Your secret tokens and IDs are stored here.
7. `.eslintignore`, `.gitignore`, `.prettierignore`: These are ignore files configured to ignore certain directories that do not require linting or configuring.
8. `.editorconfig`, `.eslintrc`, `.gitattributes`, `.prettierrc`: These files achieve the same goal. They lint and format the code to comply with the style guide.
9. `bot.js`: Where it all begins. This is the entry point for the bot code.
10. `CHANGELOG.md`: This file contains changes made up until the latest release. It is automatically generated when one of the admins bumps the version of the system.
11. `CONTRIBUTING.md`: You are reading it.
12. `.jsconfig.json` and `gulpfile.js`: These files contains the configuration for the scripts used by the admins.
13. `LICENSE`: The License file for the project.
14. `package-lock.json` and `package.json`: These files are used by `npm` to configure the project, and track dependencies.
15. `README.md`: The Readme and project page.
16. `register.js`: The script for registered commands to Discord.
17. `SUPPORTERS.md`: List of Patreon supporters which helped this project with their donations. We are grateful to them.

## :hammer_and_wrench: How do I contribute?

> Glad you asked!

### Open issues

At any time the project has [a few open issues](/../../issues). If there is anything in there you think you would want to cut your teeth on, please do! Check [open pull requests](/../../pulls) first to see if there are anyone working on the issue. If you decide to tackle an issue, assign yourself to it, or comment on it, to indicate that you intend to work on it.

### Project page

Our [project page](https://github.com/users/Stefouch/projects/2) contains a list of features and bugs that are suggested improvements to the system. Maybe there is something in there you would like to tackle.

### TODO tags

Also, there are `TODO` tags a bit everywhere in the code that could hints to remaining tasks to complete.

### Raise an issue

Maybe you have found a bug, or maybe you have a feature in mind that you would like to see implemented. Head over to the [issue tracker](/../../issues) first, and see if it is already listed there. If it is not, go ahead and open an issue, if it is feel free to bump it or comment on it.

If you want to work on a bug or a feature yourself, please raise an issue first then assign yourself to it or indicate that you will be working on it. This way we don't end up with two people working on the same thing :bulb:

### Localization

Check the instructions for [localization with GitLocalize](#globe_with_meridians-Localization), as this helps you help us with localization.

### Spread the word

We are always looking for someone who can help with the project or one of the other projects in our organization. If you do not feel like you can contribute yourself, maybe you know someone who can :vulcan_salute:

## :dart: Pull Requests

When you are ready to submit a pull request, make sure you do a few things to help speed up the process.

1. Keep it tidy. Fewer commits with changes logically grouped together makes it easier to review them.
2. Make sure [Husky](#.husky) has done its job. E.g. check your commit messages to confirm that they follow [Conventional Commits Standards](https://www.conventionalcommits.org/en/v1.0.0-beta.2/).
3. Now you are ready to submit a Pull Request. The project contains two branches: `master`, and `localization`. When submitting a Pull Request make sure to point it to the `master` branch. Unless, you are pushing a **localization** change, then point to `localization` instead.
4. When creating the Pull Request consider prefacing the title with [an emoji that indicates the type of pull request](https://gitmoji.dev/).
5. Briefly describe the pull request and whether you have made any deletions or modifications that may be breaking.
6. That's it! Thank you so much for your help with improving this project :purple_heart:
