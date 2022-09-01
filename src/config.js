const { YearZeroGames } = require('./constants');
const { YearZeroDieTypes } = require('./yearzero/roller/dice/dice-constants');
const { SkillDie, StressDie } = require('./yearzero/roller/dice');

const SebediusConfig = {};

SebediusConfig.botId = '543445246143365130';
SebediusConfig.betaBotId = '549319447240769542';
SebediusConfig.botGuildId = '585361465641271296',
SebediusConfig.botLogChannelId = '752170706522865664',

SebediusConfig.favoriteColor = 0x1AA29B;
SebediusConfig.activityLoopDelay = 600;

SebediusConfig.readmeURL = 'https://github.com/Stefouch/sebedius-yearzero-discord-bot/blob/master/README.md';
SebediusConfig.wikiURL = 'https://github.com/Stefouch/sebedius-yearzero-discord-bot/wiki';
SebediusConfig.issueURL = 'https://github.com/Stefouch/sebedius-yearzero-discord-bot/issues';

/* ------------------------------------------ */
/*  Locales Config                            */
/* ------------------------------------------ */

/** @type {{ name: string, value: string }[]} */
SebediusConfig.SupportedLocales = [
  { name: 'English', value: 'en' },
];

SebediusConfig.defaultLocale = 'en-US';

/* ------------------------------------------ */
/*  Commands Config                           */
/* ------------------------------------------ */

/** @enum {Object} */
SebediusConfig.Commands = {};
SebediusConfig.Commands.scrap = { max: 20 };
SebediusConfig.Commands.stats = { start: '2020-12-05' };
SebediusConfig.Commands.roll = {
  max: 42,
  pushIcon: '🔄',
  cancelIcon: '✅',
  pushCooldown: 120000,
};

/**
 * @typedef {Object} DiceRenderOptions
 * @property {YearZeroGames}          [template]           Force rendering with another game template
 * @property {string}                 [successIcon]        Default icon for successes
 * @property {boolean}                [hasBlankDice=false] Whether the dice have blank faces
 * @property {boolean}                [trauma=false]       Whether to display the trauma result
 * @property {boolean}                [gearDamage=false]   Whether to display the gear damage quantity
 * @property {boolean}                [panic=false]        Whether the roll can trigger panic check
 * @property {boolean}                [mishap=false]       Whether to display mishap
 * @property {boolean}                [detailed=false]     Whether to display additional details for the roll
 * @property {(typeof import('./yearzero/roller/dice/yzdie'))[]} [extraPushDice=[]]
 *   Additional dice rolled when pushed
 * @property {{ icon: string, extraPushDice: (typeof import('./yearzero/roller/dice/yzdie'))[] }[]} [reactionMenu]
 *   Non-conventional reaction menu
//  * @property {Object.<YearZeroDieTypes, YearZeroDieTypes>}     [aliases]
 */

SebediusConfig.Commands.roll.options = {
  /** @type {DiceRenderOptions} */
  [YearZeroGames.BLANK]: {
    successIcon: '❇',
    aliases: {
      [YearZeroDieTypes.BASE]: YearZeroDieTypes.SKILL,
      [YearZeroDieTypes.GEAR]: YearZeroDieTypes.SKILL,
      [YearZeroDieTypes.NEG]: null,
      [YearZeroDieTypes.STRESS]: null,
    },
  },
  /** @type {DiceRenderOptions} */
  [YearZeroGames.MUTANT_YEAR_ZERO]: {
    successIcon: '<:b6:543422751428575238>',
    trauma: true,
    gearDamage: true,
  },
  /** @type {DiceRenderOptions} */
  [YearZeroGames.FORBIDDEN_LANDS]: {
    successIcon: '<:fblb6:585368712010399744>',
    trauma: true,
    gearDamage: true,
  },
  /** @type {DiceRenderOptions} */
  [YearZeroGames.TALES_FROM_THE_LOOP]: {
    successIcon: '<:talesb6:746306489668468737>',
    hasBlankDice: true,
    detailed: true,
  },
  /** @type {DiceRenderOptions} */
  [YearZeroGames.CORIOLIS]: {
    successIcon: '<:coriolisb6:746306927524577280>',
    hasBlankDice: true,
    detailed: true,
    reactionMenu: [
      {
        icon: '🙏',
        extraPushDice: [SkillDie],
      },
      {
        icon: '🕌',
        extraPushDice: [SkillDie, SkillDie],
      },
    ],
  },
  /** @type {DiceRenderOptions} */
  [YearZeroGames.ALIEN_RPG]: {
    successIcon: '<:alienb6:746320623436955691>',
    extraPushDice: [StressDie],
    panic: true,
  },
  /** @type {DiceRenderOptions} */
  [YearZeroGames.VAESEN]: {
    successIcon: '<:vaesenb6:721624875688787978>',
    hasBlankDice: true,
    detailed: true,
  },
  /** @type {DiceRenderOptions} */
  [YearZeroGames.TWILIGHT_2K]: {
    successIcon: '🎯',
    hasBlankDice: true,
    detailed: true,
    mishap: true,
  },
  /** @type {DiceRenderOptions} */
  [YearZeroGames.BLADE_RUNNER]: {
    template: YearZeroGames.TWILIGHT_2K,
    successIcon: '🦄',
    hasBlankDice: true,
    detailed: true,
  },
};

/* ------------------------------------------ */
/*  Icons                                     */
/* ------------------------------------------ */

/** @enum {string} */
SebediusConfig.Emojis = {
  boom: '💥',
  ban: '⛔',
  die: '🎲',
  error: '❌',
  locale: '🌐',
  ok: '✅',
  shrug: '🤷',
  stop: '🛑',
  warning: '⚠',
};

SebediusConfig.CardsIcons = [
  '0️⃣',
  ':one:',
  ':two:',
  ':three:',
  ':four:',
  ':five:',
  ':six:',
  ':seven:',
  ':eight:',
  ':nine:',
  '🔟',
];

/** @enum {Object.<YearZeroDieTypes, string[]>} */
SebediusConfig.DiceIcons = {};
SebediusConfig.DiceIcons[YearZeroGames.BLANK] = {
  [YearZeroDieTypes.SKILL]: [
    '0',
    '1️⃣',
    '2️⃣',
    '3️⃣',
    '4️⃣',
    '5️⃣',
    '6️⃣',
    '7️⃣',
    '8️⃣',
    '9️⃣',
    '🔟',
  ],
};
SebediusConfig.DiceIcons[YearZeroGames.MUTANT_YEAR_ZERO] = {
  [YearZeroDieTypes.BASE]: [
    '0',
    '<:b1:543422717857366016>',
    '<:b2:543422724316332032>',
    '<:b3:543422731530534912>',
    '<:b4:543422737172004895>',
    '<:b5:543422745027805211>',
    '<:b6:543422751428575238>',
  ],
  [YearZeroDieTypes.SKILL]: [
    '0',
    '<:s1:543422653399040010>',
    '<:s2:543422668393938945>',
    '<:s3:543422678644686849>',
    '<:s4:543422694088114186>',
    '<:s5:543422700807258122>',
    '<:s6:543422708554137601>',
  ],
  [YearZeroDieTypes.GEAR]: [
    '0',
    '<:g1:543422540824182844>',
    '<:g2:543422593638727690>',
    '<:g3:543422606674624513>',
    '<:g4:543422617424494604>',
    '<:g5:543422630942867466>',
    '<:g6:543422639788785664>',
  ],
  [YearZeroDieTypes.NEG]: [
    '0',
    '<:neg1:548467996360966160>',
    '<:neg2:548468005764595722>',
    '<:neg3:548468013809139713>',
    '<:neg4:548468021354692621>',
    '<:neg5:548468031311839237>',
    '<:neg6:548468039759167523>',
  ],
};
SebediusConfig.DiceIcons[YearZeroGames.FORBIDDEN_LANDS] = {
  [YearZeroDieTypes.BASE]: [
    '0',
    '<:fblb1:585362696774352897>',
    '<:fblb2:585368627348373514>',
    '<:fblb3:585368656335339550>',
    '<:fblb4:585368656498655273>',
    '<:fblb5:585368684726321170>',
    '<:fblb6:585368712010399744>',
  ],
  [YearZeroDieTypes.SKILL]: [
    '0',
    '<:fbls1:585368858857177088>',
    '<:fbls2:585368877798522891>',
    '<:fbls3:585368904310718474>',
    '<:fbls4:585368916222672897>',
    '<:fbls5:585368925643079690>',
    '<:fbls6:585368937500508170>',
  ],
  [YearZeroDieTypes.GEAR]: [
    '0',
    '<:fblg1:585369118849630208>',
    '<:fblg2:585369135882698763>',
    '<:fblg3:585369147471298570>',
    '<:fblg4:585369161832595466>',
    '<:fblg5:585369176936546305>',
    '<:fblg6:585369195970166786>',
  ],
  [YearZeroDieTypes.NEG]: [
    '0',
    '<:fbls1:585368858857177088>',
    '<:fbls2:585368877798522891>',
    '<:fbls3:585368904310718474>',
    '<:fbls4:585368916222672897>',
    '<:fbls5:585368925643079690>',
    '<:fbls6:585368937500508170>',
  ],
  [YearZeroDieTypes.ARTO]: [
    '0',
    '<:fblarto1:585376923065253898>',
    '<:fblarto2:585376930866528277>',
    '<:fblarto3:585376938261086219>',
    '<:fblarto4:585376944456073227>',
    '<:fblarto5:585376952744149013>',
    '<:fblarto6:585376965993955328>',
    '<:fblarto7:585377014400155659>',
    '<:fblarto8:585377023971557379>',
    '<:fblarto9:585377031970226178>',
    '<:fblarto10:585377044012204082>',
    '<:fblarto11:585377055169052675>',
    '<:fblarto12:585377072772284426>',
  ],
};
SebediusConfig.DiceIcons[YearZeroGames.TALES_FROM_THE_LOOP] = {
  [YearZeroDieTypes.SKILL]: [
    '0',
    '<:talesb0:746306489488113704>',
    '<:talesb0:746306489488113704>',
    '<:talesb0:746306489488113704>',
    '<:talesb0:746306489488113704>',
    '<:talesb0:746306489488113704>',
    '<:talesb6:746306489668468737>',
  ],
};
SebediusConfig.DiceIcons[YearZeroGames.CORIOLIS] = {
  [YearZeroDieTypes.SKILL]: [
    '0',
    '<:coriolisb0:746306926836711486>',
    '<:coriolisb0:746306926836711486>',
    '<:coriolisb0:746306926836711486>',
    '<:coriolisb0:746306926836711486>',
    '<:coriolisb0:746306926836711486>',
    '<:coriolisb6:746306927524577280>',
  ],
};
SebediusConfig.DiceIcons[YearZeroGames.ALIEN_RPG] = {
  [YearZeroDieTypes.SKILL]: [
    '0',
    '<:alienb1:746320572593471500>',
    '<:alienb2:746320583091814462>',
    '<:alienb3:746320593132978256>',
    '<:alienb4:746320603186855947>',
    '<:alienb5:746320612850532403>',
    '<:alienb6:746320623436955691>',
  ],
  [YearZeroDieTypes.STRESS]: [
    '0',
    '<:aliens1:746320638465146961>',
    '<:aliens2:746320648757837894>',
    '<:aliens3:746320657620533299>',
    '<:aliens4:746320667040940055>',
    '<:aliens5:746320675777544215>',
    '<:aliens6:746320686791917618>',
  ],
};
SebediusConfig.DiceIcons[YearZeroGames.VAESEN] = {
  [YearZeroDieTypes.SKILL]: [
    '0',
    '<:vaesenb0:721625417567436860>',
    '<:vaesenb0:721625417567436860>',
    '<:vaesenb0:721625417567436860>',
    '<:vaesenb0:721625417567436860>',
    '<:vaesenb0:721625417567436860>',
    '<:vaesenb6:721624875688787978>',
  ],
};
SebediusConfig.DiceIcons[YearZeroGames.TWILIGHT_2K] = {
  d12: [
    '0',
    '<:t2ka1:784779990285811712>',
    '<:t2ka0:784779989005893653>',
    '<:t2ka0:784779989005893653>',
    '<:t2ka0:784779989005893653>',
    '<:t2ka0:784779989005893653>',
    '<:t2ka6:784779989911863307>',
    '<:t2ka6:784779989911863307>',
    '<:t2ka6:784779989911863307>',
    '<:t2ka6:784779989911863307>',
    '<:t2ka10:784779990159720448>',
    '<:t2ka10:784779990159720448>',
    '<:t2ka10:784779990159720448>',
  ],
  d10: [
    '0',
    '<:t2kb1:784779990142681108>',
    '<:t2kb0:784779989866381372>',
    '<:t2kb0:784779989866381372>',
    '<:t2kb0:784779989866381372>',
    '<:t2kb0:784779989866381372>',
    '<:t2kb6:784779990352527411>',
    '<:t2kb6:784779990352527411>',
    '<:t2kb6:784779990352527411>',
    '<:t2kb6:784779990352527411>',
    '<:t2kb10:784779990419505152>',
  ],
  d8: [
    '0',
    '<:t2kc1:784779990779691040>',
    '<:t2kc0:784779990469181460>',
    '<:t2kc0:784779990469181460>',
    '<:t2kc0:784779990469181460>',
    '<:t2kc0:784779990469181460>',
    '<:t2kc6:784779990213722143>',
    '<:t2kc6:784779990213722143>',
    '<:t2kc6:784779990213722143>',
  ],
  [YearZeroDieTypes.BASE]: [
    '0',
    '<:t2kd1:784779989525987328>',
    '<:t2kd0:784779989178515457>',
    '<:t2kd0:784779989178515457>',
    '<:t2kd0:784779989178515457>',
    '<:t2kd0:784779989178515457>',
    '<:t2kd6:784779989324529674>',
  ],
  [YearZeroDieTypes.AMMO]: [
    '0',
    '<:t2kg1:784779357164011550>',
    '<:t2kg0:784779356849176576>',
    '<:t2kg0:784779356849176576>',
    '<:t2kg0:784779356849176576>',
    '<:t2kg0:784779356849176576>',
    '<:t2kg6:784779357344235550>',
  ],
};

module.exports = SebediusConfig;
