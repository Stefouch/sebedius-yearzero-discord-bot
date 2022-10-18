const { SlashCommandBuilder, EmbedBuilder, inlineCode, spoiler } = require('discord.js');
const SebediusCommand = require('../../structures/command');
const InitiativeDeck = require('../../yearzero/initiative/initiative-deck');

module.exports = class InitiativeCommand extends SebediusCommand {
  constructor(client) {
    super(client, {
      category: SebediusCommand.CategoryFlagsBits.ROLL,
      data: new SlashCommandBuilder()
        .setName('initiative')
        .setDescription('Draw initiative')
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
          .addBooleanOption(opt => opt
            .setName('unlucky')
            .setDescription('Whether to keep the worst result'))
          .addUserOption(opt => opt
            .setName('user')
            .setDescription('Choose another user who draws initiative, if not you'))
          .addStringOption(opt => opt
            .setName('alias')
            .setDescription('Choose an alias for the user who draws initiative')))
        .addSubcommand(sub => sub
          .setName('reset')
          .setDescription('Reset the initiative deck *(probably needed at the beginning of every new encounter)*')),
    });
  }
  /** @type {SebediusCommand.SebediusCommandRunFunction} */
  async run(interaction, t) {
    const speed = interaction.options.getInteger('speed') || 1;
    const keep = interaction.options.getInteger('keep') || speed;
    const unlucky = interaction.options.getBoolean('unlucky');
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

    if (cards?.length < 1) {
      reset();
    }
    else {
      deck = new InitiativeDeck(cards);
    }


    // Draws the cards
    const sortCardsFn = (a, b) => unlucky ? b - a : a - b; // Ordre croissant par défaut
    let drawnCards = [];
    let selectedCards;

    for (let i = 0; i < speed; i++) {
      if (deck.size < 1) {
        out.push(`ℹ ${t('commands:initiative.deckTooSmall')}`);
        reset();
      }
      drawnCards.push(deck.draw());
    }

    if (speed !== keep) {
      drawnCards.sort(sortCardsFn);
      selectedCards = drawnCards.splice(0, keep);
      deck.addToBottom(drawnCards);
    }
    else {
      selectedCards = drawnCards;
      drawnCards = [];
    }

    // Builds the embed.
    const embed = new EmbedBuilder()
      .setTitle(t('commands:initiative.drawTitle'))
      .setThumbnail(user.avatarURL())
      .setDescription(this.#createDrawDescription(alias, selectedCards, drawnCards, t))
      .setColor(this.bot.config.Commands.init.colorGradient[Math.min(...selectedCards)])
      .addFields({
        name: t('commands:initiative.drawEvents'),
        value: out.join('\n'),
      });

    if (deck.size > 0) {
      embed.addFields({
        name: t('commands:initiative.remainingCards'),
        value: this.#createRemainingCardsDescription(deck._stack),
      });
    }

    if (!this.bot.database.isReady()) {
      embed.setFooter({
        text: `${this.bot.config.Emojis.warning} ${t('commands:initiative.noDatabaseConnection')}`,
      });
    }

    // Sends the message.
    await interaction.reply({
      content: this.emojifyCards(...selectedCards),
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
        cards: this.emojifyCards(...drawn, ...kept),
        card: this.emojifyCards(...kept),
      });
    }
    return t('commands:initiative.drawDescription', {
      name: `**${userName}**`,
      card: this.emojifyCards(...kept),
    });
  }

  #createRemainingCardsDescription(cards) {
    return spoiler(InitiativeDeck.INITIATIVE_CARDS
      .map(c => cards.includes(c) ? this.emojifyCards(c) : '⬛')
      .join(''),
    );
  }

  /**
   * Turns the card's numbers into emojis.
   * @param {...number} cards List of card's numbers
   * @returns {string}
   */
  emojifyCards(...cards) {
    return cards.map(c => this.bot.config.CardsIcons[c]).join('');
  }

  /* ------------------------------------------ */

  /**
   * Gets the cards stack from the database.
   * @param {string} guildId
   */
  async getCards(guildId) {
    if (!this.bot.database.isReady()) return;

    const c = { cards: InitiativeDeck.INITIATIVE_CARDS };
    const initiativeDoc = await this.bot.database.grabInitiative(
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
    return this.bot.database.grabInitiative(guilId, { cards: stack });
  }
};
