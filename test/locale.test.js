/* eslint-disable max-nested-callbacks */
const { describe, it } = require('mocha');
const expect = require('chai').expect;
const loadLocales = require('../src/locales/i18n');
const { SlashCommandAssertions } = require('discord.js');
const { SupportedLocales, defaultLocale } = require('../src/config');
const { flattenObject } = require('../src/utils/object-utils');

const locales = SupportedLocales.map(l => l.value);

describe('LOCALIZATIONS', function () {
  /** @type {import('i18next').i18n} */
  let i18n;
  const client = {};

  this.beforeAll(async function () {
    await loadLocales(client);
    i18n = client.i18n;
  });

  it('Should load i18n correctly', function () {
    expect(i18n).to.be.an('Object');
    expect(i18n.t).to.be.a('Function');
    expect(i18n.options.supportedLngs).to.have.lengthOf(locales.length + 1);
    expect(i18n.options.fallbackLng[0]).to.equal(defaultLocale);
    // expect(i18n.options.ns).to.have.lengthOf(2);
    expect(i18n.options.defaultNS).to.equal('commands');
  });

  it('Check all locale files', function () {
    for (const lng of locales) {

      describe(`# ${lng}`, function () {
        it('Should be a valid locale string', function () {
          expect(SlashCommandAssertions.validateLocale.bind(SlashCommandAssertions, lng))
            .to.not.throw();
        });

        // For each language:
        for (const ns of i18n.options.ns) {

          // For each namespace file:
          describe(`❯ ${ns}`, function () {
            const enResource = flattenObject(i18n.getResourceBundle(defaultLocale, ns));
            const size = Object.keys(enResource).length;
            const resource = flattenObject(i18n.getResourceBundle(lng, ns));

            it(`Should have a "${lng}/${ns}.yml" namespace file`, function () {
              expect(resource).to.not.be.undefined.and.not.be.null;
            });

            it('Should successfully translate the keys', function () {
              const t = i18n.getFixedT(lng);
              expect(t.name).to.equal('fixedT');
              expect(t.lng).to.equal(lng);
              for (const key in resource) {
                const str = t(`${ns}:${key}`, { lng });
                expect(str, key).to.equal(resource[key]);
                // expect(str, key).to.not.equal(enResource[key]);
              }
            });

            // These tests are not needed for english:
            if (lng !== defaultLocale) {
              if (process.env.NODE_ENV !== 'production') {
                it(`Should have ${size} translation keys`, function () {
                  expect(Object.keys(resource).length).to.equal(size);
                });

                it('Should have all english keys', function () {
                  const out = [];
                  for (const key in enResource) {
                    if (!(key in resource)) out.push(key);
                  }
                  expect(out.join('\n'), `Missing keys in ${lng}/${ns}.yml`).to.equal([].join());
                  expect(out).to.have.lengthOf(0);
                });
              }

              it('Should not have any unlisted keys', function () {
                const out = [];
                for (const key in resource) {
                  if (!(key in enResource)) out.push(key);
                }
                expect(out.join('\n'), 'Missing keys in english').to.equal([].join());
                expect(out).to.have.lengthOf(0);
              });
            }

            // Tests all command names & descriptions.
            if (ns === 'commands') {
              it('Should validate all command names & descriptions', function () {
                for (const key in resource) {
                  if (key.endsWith('name')) {
                    expect(SlashCommandAssertions.validateName.bind(SlashCommandAssertions, resource[key]), key)
                      .to.not.throw();
                  }
                  else if (key.endsWith('description')) {
                    expect(SlashCommandAssertions.validateDescription.bind(SlashCommandAssertions, resource[key]), key)
                      .to.not.throw();
                  }
                }
              });
            }

          });
        }
      });
    }
  });
});
