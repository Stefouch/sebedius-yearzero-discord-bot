const { SlashCommandBuilder, EmbedBuilder, inlineCode, spoiler } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const InitiativeDeck = require('../../yearzero/initiative/initiative-deck');

module.exports = class InitiativeCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: new SlashCommandBuilder()
        .setName('initiative')
        .setDescription('Draw one or more initiative cards')
        // .addSubcommand(sub => sub
        //   .setName('roll')
        //   .setDescription('Roll for initiative'))
        .setDMPermission(false)
        .addSubcommand(sub => sub
          .setName('draw')
          .setDescription('Draw one or more initiative cards')
          .addIntegerOption(opt => opt
            .setName('speed')
            .setDescription('Number of initiative cards to draw')
            .setMinValue(1)
            .setMaxValue(10))
          .addIntegerOption(opt => opt
            .setName('keep')
            .setDescription('Number of initiative cards to keep')
            .setMinValue(1)
            .setMaxValue(10))
          .addUserOption(opt => opt
            .setName('user')
            .setDescription('Choose another user who draws initiative, if not you'))
          .addStringOption(opt => opt
            .setName('alias')
            .setDescription('Choose an alias for user who draws initiative')))
        .addSubcommand(sub => sub
          .setName('reset')
          .setDescription('Reset the initiative deck *(probably needed at the beginning of every new encounter)*')),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const speed = interaction.options.getInteger('speed') || 1;
    const keep = interaction.options.getInteger('keep') || speed;
    const user = interaction.options.getUser('user') || interaction.user;
    const alias = interaction.options.getString('alias') || user.toString();

    /** @type {string[]} */
    const out = [];

    /** @type {InitiativeDeck} */
    let deck;

    const reset = () => {
      deck = new InitiativeDeck();
      out.push(`🔄 ${t('commands:initiative.deckShuffled')}`);
    };

    // Builds the cards stack.
    if (interaction.options.getSubcommand() === 'reset') {
      reset();
      this.saveStack(interaction.guildId, deck._stack); // no await
      return interaction.reply(out.join('\n'));
    }

    out.push(`▶️ ${t('commands:initiative.drawHint', {
      number: inlineCode('' + speed),
      keep: inlineCode('' + keep),
    })}`);

    const cards = await this.getCards(interaction.guildId);

    if (!cards || cards.length <= 0) {
      reset();
    }
    else {
      deck = new InitiativeDeck(cards);
    }


    // Draws the cards
    const sortCardsFn = (a, b) => a - b;
    const drawnCards = [];
    let keptCards;

    for (let i = 0; i < speed; i++) {
      if (i > deck.size || keep > deck.size) {
        out.push(`ℹ ${t('commands:initiative.deckTooSmall')}`);
        reset();
      }
      drawnCards.push(deck.draw());
    }

    if (speed !== keep) {
      drawnCards.sort(sortCardsFn);
      keptCards = drawnCards.splice(0, keep);
      deck.addToBottom(drawnCards).shuffle();
    }
    else {
      keptCards = drawnCards;
    }

    // Builds the embed.
    const embed = new EmbedBuilder()
      .setTitle(t('commands:initiative.drawTitle'))
      .setThumbnail(user.avatarURL())
      .setDescription(this.#createDrawDescription(alias, keptCards, drawnCards, t))
      .addFields({
        name: t('commands:initiative.drawEvents'),
        value: out.join('\n'),
      }, {
        name: t('commands:initiative.remainingCards'),
        value: spoiler(this.printCard(...deck._stack.sort(sortCardsFn))),
      });

    // Sends the message.
    await interaction.reply({
      content: this.printCard(...keptCards),
      embeds: [embed],
    });

    // Saves the updated stack.
    await this.saveStack(interaction.guildId, deck._stack);
  }

  /* ------------------------------------------ */

  #createDrawDescription(userName, kept, drawn, t) {
    if (drawn.length) {
      return t('commands:initiative.lootDescription', {
        name: `**${userName}**`,
        cards: this.printCard(...drawn),
        card: this.printCard(...kept),
      });
    }
    return t('commands:initiative.drawDescription', {
      name: `**${userName}**`,
      card: this.printCard(...kept),
    });
  }

  printCard(...cards) {
    return cards.map(c => this.bot.config.CardsIcons[c]).join('');
  }

  /**
   * Gets the cards stack from the database.
   * @param {string} guildId
   */
  async getCards(guildId) {
    if (!this.bot.database.isReady()) return;

    const c = { cards: InitiativeDeck.INITIATIVE_CARDS };
    const initiativeDoc = await this.bot.database.getInitiative(
      guildId,
      { $setOnInsert: c },
      { lean: true },
    ) || c;

    return initiativeDoc.cards;
  }

  /**
   * Saves the cards stack to the database.
   * @param {string} guilId
   * @param {number[]} stack
   */
  async saveStack(guilId, stack) {
    if (!this.bot.database.isReady()) return;
    return this.bot.database.getInitiative(guilId, { cards: stack });
  }
};
