const { ShardingManager } = require('discord.js');
const Logger = require('./src/utils/logger');
// const PRODUCTION = process.env.NODE_ENV === 'production';

// First, loads the ENV variables (e.g. bot's token).
// if not in production mode.
// if (!PRODUCTION) {
//   require('dotenv').config();
// }

const manager = new ShardingManager('./bot.js', {
  totalShards: 2,
  // token: PRODUCTION ? process.env.DISCORD_TOKEN : process.env.BETA_DISCORD_TOKEN,
  // execArgv: ['--trace-warnings'],
  // shardArgs: ['--ansi', '--color'],
});

manager.on('shardCreate', shard => Logger.client(`Launched shard ${shard.id}`));

manager.spawn();
