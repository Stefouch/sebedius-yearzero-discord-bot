class Abacus extends Map {
  constructor(entries) {
    super(entries);
  }

  /** @override */
  set(key, value) {
    return super.set(key, +value);
  }

  /**
   * @param {*}       key
   * @param {number} [value=1] 
   */
  increment(key, value = 1) {
    return this.set(this.get(key) + value);
  }
}

module.exports = Abacus;
