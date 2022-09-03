class RollError extends Error {
  constructor(message, roll) {
    super(message, { cause: roll });
    this.name = 'RollError';
    this.message += '\nCause: ' + this.cause.toString();
  }
}

module.exports = { RollError };
