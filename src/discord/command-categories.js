const { BitField } = require('discord.js');

class CommandCategoriesBitfield extends BitField {
  /** @enum {number} */
  static Flags = {
    ADMIN: 1 << 0,
    UTILS: 1 << 1,
  };
}

module.exports = CommandCategoriesBitfield;
