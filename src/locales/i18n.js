const i18next = require('i18next');
const i18nextBackend = require('i18next-fs-backend');
const { stringify, parse } = require('yaml');

i18next
  // @ts-ignore
  .use(i18nextBackend)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en'],
    // debug: true,
    // initImmediate: false,
    backend: {
      loadPath: './src/lang/{{lng}}.yml',
      addPath: './src/lang/{{lng}}.missing.yml',
      stringify: data => stringify(data),
      parse: data => parse(data),
    },
  })
  .then(() => console.log('✔ Sebedius is translated!'))
  .catch(err => console.error(err));

module.exports = i18next;
