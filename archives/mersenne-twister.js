/**
 * A standalone, pure JavaScript implementation of the Mersenne Twister pseudo random number generator.
 *
 * @author Raphael Pigulla <pigulla@four66.com>
 * @version 0.2.3
 * @license
 * Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * 3. The names of its contributors may not be used to endorse or promote
 * products derived from this software without specific prior written
 * permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
class MersenneTwister {
  /**
   * Instantiates a new Mersenne Twister.
   * @param {number} [seed]   The initial seed value, if not provided the current timestamp will be used.
   * @constructor
   */
  constructor(seed) {

    // Initial values
    this.MAX_INT = 4294967296.0;
    this.N = 624;
    this.M = 397;
    this.UPPER_MASK = 0x80000000;
    this.LOWER_MASK = 0x7fffffff;
    this.MATRIX_A = 0x9908b0df;

    // Initialize sequences
    this.mt = new Array(this.N);
    this.mti = this.N + 1;
    this.SEED = this.seed(seed ?? new Date().getTime());
  };

  /**
   * Initializes the state vector by using one unsigned 32-bit integer "seed", which may be zero.
   *
   * @since 0.1.0
   * @param {number} seed The seed value.
   */
  seed(seed) {
    this.SEED = seed;
    let s;
    this.mt[0] = seed >>> 0;

    for (this.mti = 1; this.mti < this.N; this.mti++) {
      s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
      this.mt[this.mti] =
        (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
      this.mt[this.mti] >>>= 0;
    }
    return seed;
  };

  /**
   * Initializes the state vector by using an array key[] of unsigned 32-bit integers of the specified length. If
   * length is smaller than 624, then each array of 32-bit integers gives distinct initial state vector. This is
   * useful if you want a larger seed space than 32-bit word.
   *
   * @since 0.1.0
   * @param {array} vector The seed vector.
   */
  seedArray(vector) {
    let i = 1, j = 0, k = this.N > vector.length ? this.N : vector.length, s;
    this.seed(19650218);
    for (; k > 0; k--) {
      s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);

      this.mt[i] = (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) +
        vector[j] + j;
      this.mt[i] >>>= 0;
      i++;
      j++;
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        i = 1;
      }
      if (j >= vector.length) {
        j = 0;
      }
    }

    for (k = this.N - 1; k; k--) {
      s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] =
        (this.mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i;
      this.mt[i] >>>= 0;
      i++;
      if (i >= this.N) {
        this.mt[0] = this.mt[this.N - 1];
        i = 1;
      }
    }
    this.mt[0] = 0x80000000;
  };

  /**
   * Generates a random unsigned 32-bit integer.
   *
   * @since 0.1.0
   * @returns {number}
   */
  int() {
    let y, kk, mag01 = [0, this.MATRIX_A];

    if (this.mti >= this.N) {
      if (this.mti === this.N + 1) {
        this.seed(5489);
      }

      for (kk = 0; kk < this.N - this.M; kk++) {
        y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
        this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 1];
      }

      for (; kk < this.N - 1; kk++) {
        y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
        this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 1];
      }

      y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
      this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 1];
      this.mti = 0;
    }

    y = this.mt[this.mti++];

    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);

    return y >>> 0;
  };

  /**
   * Generates a random unsigned 31-bit integer.
   *
   * @since 0.1.0
   * @returns {number}
   */
  int31() {
    return this.int() >>> 1;
  };

  /**
   * Generates a random real in the interval [0;1] with 32-bit resolution.
   *
   * @since 0.1.0
   * @returns {number}
   */
  real() {
    return this.int() * (1.0 / (this.MAX_INT - 1));
  };

  /**
   * Generates a random real in the interval ]0;1[ with 32-bit resolution.
   *
   * @since 0.1.0
   * @returns {number}
   */
  realx() {
    return (this.int() + 0.5) * (1.0 / this.MAX_INT);
  };

  /**
   * Generates a random real in the interval [0;1[ with 32-bit resolution.
   *
   * @since 0.1.0
   * @returns {number}
   */
  rnd() {
    return this.int() * (1.0 / this.MAX_INT);
  };

  /**
   * Generates a random real in the interval [0;1[ with 32-bit resolution.
   *
   * Same as .rnd() method - for consistency with Math.random() interface.
   *
   * @since 0.2.0
   * @returns {number}
   */
  random() {
    return this.rnd();
  };

  /**
   * Generates a random real in the interval [0;1[ with 53-bit resolution.
   *
   * @since 0.1.0
   * @returns {number}
   */
  rndHiRes() {
    const a = this.int() >>> 5;
    const b = this.int() >>> 6;
    return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
  };

  /**
   * A pseudo-normal distribution using the Box-Muller transform.
   * @param {number} mu     The normal distribution mean
   * @param {number} sigma  The normal distribution standard deviation
   * @returns {number}
   */
  normal(mu, sigma) {
    let u = 0;
    while(u === 0) u = this.random(); // Converting [0,1) to (0,1)
    let v = 0;
    while(v === 0) v = this.random(); // Converting [0,1) to (0,1)
    const n = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return (n * sigma) + mu;
  }

  /**
   * A factory method for generating random uniform rolls
   * @return {number}
   */
  static random() {
    return twist.random();
  }

  /**
   * A factory method for generating random normal rolls
   * @return {number}
   */
  static normal(...args) {
    return twist.normal(...args);
  }
}

// Global singleton
const twist = new MersenneTwister(Date.now());
