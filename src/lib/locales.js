import unifyLocale from './unify-locale';

/* default english */
export const defaultLanguage = 'en';
export const browserLanguage = navigator.language;

const { DisplayNames, Locale } = window.Intl;
const defaultLN = new DisplayNames([defaultLanguage], { type: 'language' });
const browserLN = new DisplayNames([browserLanguage], { type: 'language' });

export const supportLanguages = new Map();

export const isSupportLanguage = (lang) => (lang = unifyLocale(lang)) && supportLanguages.has(lang) && lang;

export const isRtl = (lang) => {
  const locale = new Locale(lang);
  const textInfo = locale.textInfo || locale.getTextInfo();
  return textInfo && textInfo.direction === 'rtl';
};

const createLocale = (language, messages = {}) => {
  const ln = new DisplayNames([language], { type: 'language' });
  supportLanguages.set(language, {
    language: ln.of(language),
    languageInDefault: defaultLN.of(language),
    languageInBrowser: browserLN.of(language),
  });
  return { language, messages };
};

export default [createLocale('en'), createLocale('zh-Hans')];
