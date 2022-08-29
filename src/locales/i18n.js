const i18next = require('i18next');
const i18nextBackend = require('i18next-fs-backend');
const { stringify, parse } = require('yaml');

module.exports = async () => {
  await i18next
    // @ts-ignore
    .use(i18nextBackend)
    .init({
      supportedLngs: ['en'],
      fallbackLng: 'en',
      ns: ['commands'],
      defaultNS: 'commands',
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
    .then(() => console.log('✔ Sebedius is translated!'))
    .catch(err => console.error(err));
};
