/**
 * Simple `Map` where values are numbers.
 * See {@link Abacus.increment}
 * @extends Map
 */
class Abacus extends Map {
  /**
   * @param {Iterable} [entries]
   */
  constructor(entries) {
    if (typeof entries !== 'undefined') {
      entries = [...entries].map(([k, v]) => [k, +v]);
    }
    super(entries);
  }

  /**
   * @type {number}
   * @readonly
   */
  get total() {
    return [...this.values()].reduce((s, v) => s + v, 0);
  }

  /**
   * Modifies the target key with the secified increment.
   * Use a negative number for decrementation.
   * @param {*}       key      Targeted element
   * @param {number} [value=1] Modifier
   * @returns {this}
   */
  increment(key, value = 1) {
    if (this.has(key)) return this.set(key, this.get(key) + value);
    return this.set(key, value);
  }

  /**
   * Maps each item to another value into an array. Identical in behavior to
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map | Array.map()}.
   * 
   * @param {(value: number, key: any, abacus: this) => any} fn
   *   Function that produces an element of the new array, taking three arguments
   * @param {*} [thisArg] Value to use as `this` when executing function
   * 
   * @example abacus.map(num => num * 2);
   */
  map(fn, thisArg) {
    if (typeof fn !== 'function') throw new TypeError(`${fn} Is Not a Function!`);
    if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
    const iter = this.entries();
    return Array.from({ length: this.size }, () => {
      const [key, value] = iter.next().value;
      return fn(value, key, this);
    });
  }

  /**
   * Applies a function to produce a single value. Identical in behavior to
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce | Array.reduce()}.
   *
   * @param {(accumulator: any, value: number, key: any, abacus: this) => any} fn
   *   Function used to reduce, taking four arguments; `accumulator`, `currentValue`, `currentKey` and `collection`
   * @param {any} [initialValue] Starting value for the accumulator
   *
   * @example abacus.reduce((acc, num) => acc + num * 2, 0);
   */
  reduce(fn, initialValue) {
    if (typeof fn !== 'function') throw new TypeError(`${fn} Is Not a Function!`);
    let accumulator;
    if (typeof initialValue !== 'undefined') {
      accumulator = initialValue;
      for (const [key, val] of this) accumulator = fn(accumulator, val, key, this);
      return accumulator;
    }
    let first = true;
    for (const [key, val] of this) {
      if (first) {
        accumulator = val;
        first = false;
      }
      accumulator = fn(accumulator, val, key, this);
    }
    // No items iterated.
    if (first) {
      throw new TypeError('Reduce of empty abacus with no initial value!');
    }
    return accumulator;
  }

  /**
   * @returns {IterableIterator<[any, number]>}
   * @override
   */
  entries() {
    return super.entries();
  }

  /**
   * @param {(value: number, key: any, abacus: Abacus) => void} callbackfn
   * @param {*} [thisArg]
   */
  forEach(callbackfn, thisArg) {
    return super.forEach(callbackfn, thisArg);
  }

  /**
   * @param {*} key
   * @returns {number|undefined}
   * @override
   */
  get(key) {
    return super.get(key);
  }

  /**
   * @param {*}       key
   * @param {number} [value=1]
   * @returns {this}
   * @override
   */
  set(key, value = 1) {
    return super.set(key, +value || 0);
  }
}

module.exports = Abacus;
