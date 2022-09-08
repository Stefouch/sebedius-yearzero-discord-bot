# Privacy Policy

What we do with your privacy?

## Private Information Collected

> `tl;dr` — Almost none. Information we collect are not used for commercial purposes nor shared with shady commercial companies.

**We collect a few information only for bot errors handling.**

Typing a command will mark the following informations in our log:

- Command typed
- Name of the user and their Discord ID
- Name of the channel and its ID
- Name of the guild (_aka_ server) and its ID
- Roll results

We use the [Papertrail](https://papertrailapp.com/) app to collect our logs. They are searchable for 48 hours and then archived for 7 days. After that time, the logs are wiped.

Logs are **NOT** shared with any other third party.

When a criticial error is thrown by the bot process, its information are sent in the log and in the form of a chat message in our private Discord server.

## Guild Preferences

When inviting the bot to your Discord server, the guild ID is saved in our database with the join date timestamp. When the bot is kicked, a leave date timestamp is added.

With the command `/conf` you can set the default `locale` and `game` for your Discord server. That information is saved in our database.

> **Note:** If you don't use this feature, the bot will use the default locale defined in your server.

## Usage statistics

Typing a command will increment a counter and refresh the last use timestamp in our database. This is the only information that are saved.

The usage statistics are shared with our [Patreon](https://patreon.com/Stefouch) members and [Free League Publishing](https://frialigan.se).

## Questions

If you have any additional questions regarding this document, you can of course reach me on Twitter [@stefouch](https://twitter.com/stefouch) or in the public [Year Zero Worlds](https://discord.gg/RnaydHR) Discord server.
