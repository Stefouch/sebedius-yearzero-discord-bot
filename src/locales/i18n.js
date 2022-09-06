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
      supportedLngs: SupportedLocales.map(l => l.value),
      fallbackLng: defaultLocale,
      ns: ['commons', 'commands'],
      defaultNS: 'commands',
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
    .then(() => Logger.client(`${Emojis.locale} Sebedius is translated!`))
    .catch(err => Logger.error(err));

  client.i18n = i18next;
};
