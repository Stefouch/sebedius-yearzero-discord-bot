const Deck = require('card-deck');

/**
 * A Year Zero deck of cards.
 * Useful for initiative cards.
 * @extends {Deck} from module `card-deck`
 */
class InitiativeDeck extends Deck {
  /**
   * @param {Array.<any>} [arr=YZInitDeck.INITIATIVE_CARDS] An array of objects, default are initiative cards
   */
  constructor(arr) {
    if (arr) super(arr);
    else super([...InitiativeDeck.INITIATIVE_CARDS]);
    this.shuffle();
  }

  /**
   * The size of the deck.
   * @type {number}
   * @readonly
   */
  get size() {
    return this._stack.length;
  }

  /**
   * Loot cards: draw then discard.
   * @param {number}    numDraw    Number of cards to draw
   * @param {number}   [numKeep=1] Number of cards to keep
   * @param {Function?} fn         Callback function to sort the best cards to keep
   * @param {'top'|'bottom'|'random'|'shuffle'} [rest] Where to put the remaining cards.
   *   If omitted, they are discarded.
   *   - `top`: At the top of the deck
   *   - `bottom`: At the bottom of the deck
   *   - `random`: At random positions into the deck
   *   - `shuffle`: At the bottom, then shuffle the whole deck
   * @returns {{ selected: number[], rejected: number[] }} An object with:
   *   - `selected`: An array of selected (keeped) cards
   *   - `rejected`: An array of rejected (discarded) cards
   */
  loot(numDraw, numKeep = 1, fn = null, rest) {
    // Draws the cards.
    let cards = this.draw(numDraw);
    if (!Array.isArray(cards)) cards = [cards];

    // Sorts the cards.
    cards.sort(fn);

    // Keeps the cards.
    const selected = cards.splice(0, numKeep);

    // Shuffle the cards back if required.
    if (cards.length > 0) {
      switch (rest) {
        case 'top': this.addToTop(cards); break;
        case 'bottom': this.addToBottom(cards); break;
        case 'random': this.addRandom(cards); break;
        case 'shuffle': this.addToBottom(cards).shuffle(); break;
      }
    }
    // Returns the kept cards.
    return { selected, rejected: cards };
  }
}

/**
 * The default list of the initiative cards' values.
 * @type {number[]}
 * @constant
 */
InitiativeDeck.INITIATIVE_CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

module.exports = InitiativeDeck;
