import { createContext } from 'preact';
import { useContext, useReducer } from 'preact/hooks';
import { TranslationsProvider, useTranslator } from '@eo-locale/preact';

import locales, { defaultLanguage, browserLanguage, supportLanguages, isSupportLanguage, isRtl } from '../lib/locales';

const SET_LOCALES = 'SET_LOCALES';
const SET_LANGUAGE = 'SET_LANGUAGE';

const language = isSupportLanguage(browserLanguage) || defaultLanguage;

const initialState = {
  locales,
  language,
  supportLanguages,
  isRtl: isRtl(language),
};

export const LocalesContext = createContext({
  state: initialState,
  dispatch: () => {},
});

const reducer = (state, action) => {
  switch (action.type) {
    case SET_LOCALES:
      return {
        ...state,
        locales: action.payload,
      };
    case SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
        isRtl: isRtl(action.payload),
      };
    default:
      return state;
  }
};

export function useLocale() {
  const { state, dispatch } = useContext(LocalesContext);
  const { translate } = useTranslator();

  const maybeTranslate = (text) => {
    if (!text?.props) {
      return text;
    }
    if (text.props.children) {
      return []
        .concat(text.props.children)
        .map((child) => maybeTranslate(child))
        .join('');
    }
    return translate(text.props.id, text.props);
  };

  return {
    ...state,

    addLocaleData(data) {
      dispatch({
        type: SET_LOCALES,
        payload: state.locales.map(({ language, messages }) => ({
          language,
          messages: Object.assign(messages, data[language]),
        })),
      });
    },

    setLanguage(language) {
      if (state.language !== language) {
        dispatch({ type: SET_LANGUAGE, payload: language });
      }
    },

    getText(id, defaultMessage, option = {}) {
      if (typeof defaultMessage === 'object') {
        option = defaultMessage;
        defaultMessage = option.defaultMessage;
      }
      return translate(id, {
        ...option,
        defaultMessage,
      });
    },

    maybeLocaleText(text) {
      return maybeTranslate(text);
    },
  };
}

export function LocalesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleError = (err) => {
    if (DEVELOPMENT) {
      console.error(`${err.message}: "${err.id}" in "${err.language}"`);
    }
  };

  return (
    <TranslationsProvider
      language={state.language}
      locales={state.locales}
      onError={handleError}
    >
      <LocalesContext.Provider value={{ state, dispatch }}>{children}</LocalesContext.Provider>
    </TranslationsProvider>
  );
}
