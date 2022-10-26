/* eslint-disable max-nested-callbacks */
const { existsSync } = require('node:fs');
const { describe, it } = require('mocha');
const expect = require('chai').expect;
const RollTable = require('../src/utils/RollTable');
const { SupportedLocales, defaultLocale } = require('../src/config');
const { YearZeroRollTables } = require ('../src/constants');
const { parseGamedata } = require('../src/yearzero/gamedata/gamedata-parser');

describe('TABLES', function () {
  // For each table
  for (const tableName of Object.values(YearZeroRollTables)) {

    describe(`❯ ${tableName}`, function () {
      // For each language
      for (const { value: lang } of Object.values(SupportedLocales)) {
        const tablePath = `./src/yearzero/gamedata/${lang}/${tableName}.yml`;

        // Loads the table.
        if (existsSync(tablePath)) {
          describe(`• ${lang}`, function () {
            const table = parseGamedata(lang, tableName);

            it('Should parse correctly', function () {
              expect(table).to.exist;
            });

            // For crit & panic tables
            if (tableName.includes('crit') || tableName.includes('panic')) {
              it('Sould be a RollTable with a name', function () {
                expect(table).to.be.an.instanceOf(RollTable);
                expect(table.name).to.be.a('string');
              });

              // Iterates over each value of the table.
              it('Should have all the necessary values', function () {
                for (let i = 0; i < table.max; i++) {
                  const r = table.get(i);

                  // Checks name.
                  expect(r.name, `${lang}/${tableName}: name of ${i}`)
                    .to.be.a('string');
                  expect(r.name, `${lang}/${tableName}: title case name of ${i}`)
                    .to.match(/^(?:[A-ZÖ][^\s]*\s?\(?)+$/);

                  // Checks effect.
                  expect(r.effect, `${lang}/${tableName}: effect of ${i}`)
                    .to.be.a('string');
                  expect(r.effect, `${lang}/${tableName}: punctuation end of effect of ${i}`)
                    .to.match(/\.\)?\*?$/gm);

                  if (tableName.includes('panic')) {
                    expect(r.icon.length, `${lang}/${tableName}: icon of ${i}`)
                      .to.greaterThan(0)
                      .and.below(3);
                  }
                }
              });
            }
          });
        }
        // If the table does not exist in english, we should warn about it:
        else if (lang === defaultLocale) {
          it(`The ${defaultLocale} table does not exist`, function () {
            expect(false).to.be.true;
          });
        }
      }
    });
  }
});
