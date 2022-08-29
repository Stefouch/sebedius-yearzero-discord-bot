const { describe, it } = require('mocha');
const expect = require('chai').expect;
const fs = require('fs');
const glob = require('glob').glob;
const en = require('../lang/en.json');
const { __ } = require('../lang/locales.js');
const { SUPPORTED_LANGS } = require('../utils/constants.js');
const LANGUAGE_CODES = Object.keys(SUPPORTED_LANGS);

const size = Object.keys(en).length;

describe('Localisation', function() {

	for (const lang of LANGUAGE_CODES) {
		// Skips English as it's the default language.
		if (lang === 'en') continue;

		// Gets the language file.
		let locale;
		try {
			locale = require(`../lang/${lang}.json`);
		}
		catch (error) {
			console.error(`Error | ${lang}.json doesn't exist!`);
			locale = {};
		}

		describe(`# Language: ${lang.toUpperCase()}`, function() {

			it(`Should have a language file "${lang}.json"`, function() {
				expect(locale, `lang/${lang}.json`).to.be.an('object').and.not.empty;
			});

			it(`Should have ${size} translation keys`, function() {
				expect(Object.keys(locale)).to.have.lengthOf(size);
			});

			it('Should have all en.json keys', function() {
				const out = [];
				for (const key in en) if (!(key in locale)) out.push(key);
				expect(out.join(), `Missing keys from ${lang}.json`).to.equal([].join());
				expect(out).to.have.lengthOf(0);
			});

			it('Should not have any unlisted keys', function() {
				const out = [];
				for (const key in locale) if (!(key in en)) out.push(key);
				expect(out.join(), 'Missing keys from en.json').to.equal([].join());
				expect(out).to.have.lengthOf(0);
			});

			it('Should not have any issue to translate', function() {
				for (const key in locale) {
					expect(locale[key]).to.satisfy(function(str) {
						return str === __(key, lang);
					});
				}
			});

			it('Should have array keys with equal or greater length', function() {
				const out = [];
				for (const [key, translation] of Object.entries(locale)) {
					if (!Array.isArray(translation)) continue;
					if (translation.length < en[key].length) out.push(key);
				}
				expect(out.join(), 'Array keys with inexact length').to.equal([].join());
				expect(out).to.have.lengthOf(0);
			});

			it('Every call for translation should return a translated value instead of the key name', function() {
				const allJsFiles = glob.sync('{*.js,!(node_modules)/**/*.js}');
				for (const jsFile of allJsFiles) {
					fs.readFile(jsFile, 'utf8', (error, data) => {
						expect(error, `Loading ${jsFile} failed`).to.be.null;
						if (!error) {
							const regex = /__\(['"](.*?)['"],.*?\)/gm;
							let result;
							while ((result = regex.exec(data)) !== null) {
								expect(
									__(result[1], lang),
									`Translation call that returns it's key. (${result[0]} in ${jsFile})`,
								).to.not.be.equal(result[1]);
							}
						}
					});
				}
			});

		});
	}

});