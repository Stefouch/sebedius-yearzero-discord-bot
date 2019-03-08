const { RollParser, Roll } = require('./RollParser');

module.exports = {
	test: () => {
		const roll = RollParser.parse('6d66+6');
		const roll2 = RollParser.parseString('il fait d6+3+2 beau!');
		console.log(roll2);
		console.log(eval('2+2'));
	},
};