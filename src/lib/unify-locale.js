const unifiedLocales = {
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  'zh-HK': 'zh-Hant',
  'zh-MO': 'zh-Hant',
};

export default function unifyLocale(language) {
  if (unifiedLocales[language]) {
    return unifiedLocales[language];
  }
  return language;
}
