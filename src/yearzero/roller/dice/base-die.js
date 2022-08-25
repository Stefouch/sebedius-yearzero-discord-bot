const YearZeroDie = require('./die');
const { YearZeroDieTypes } = require('./dice-constants');

class BaseDie extends YearZeroDie {
  constructor(data) {
    super(data);
    this.type = YearZeroDieTypes.BASE;
  }
};
