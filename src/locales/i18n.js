const i18next = require('i18next');
const i18nextBackend = require('i18next-fs-backend');
const { stringify, parse } = require('yaml');
const { SupportedLocales, defaultLocale, Emojis } = require('../config');
const Logger = require('../utils/logger');

module.exports = async client => {
  await i18next
    // @ts-ignore
    .use(i18nextBackend)
    .init({
      ns: ['commons', 'commands'],
      defaultNS: 'commands',
      supportedLngs: SupportedLocales.map(l => l.value),
      preload: SupportedLocales.map(l => l.value),
      fallbackLng: defaultLocale,
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
      // debug: true,
      // initImmediate: false,
      backend: {
        loadPath: './src/locales/{{lng}}/{{ns}}.yml',
        addPath: './src/locales/{{lng}}/{{ns}}.missing.yml',
        stringify: data => stringify(data),
        parse: data => parse(data),
      },
    })
    .then(() => Logger.client(`${Emojis.globe} Sebedius is translated!`))
    .catch(err => Logger.error(err));

  client.i18n = i18next;
};
