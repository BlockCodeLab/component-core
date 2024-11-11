import { createContext } from 'preact';
import { useContext, useReducer } from 'preact/hooks';
import { clearHotkeys } from '../lib/hotkey';

const SET_SPLASH = 'SET_SPLASH';
const CREATE_ALERT = 'CREATE_ALERT';
const REMOVE_ALERT = 'REMOVE_ALERT';
const CREATE_PROMPT = 'CREATE_PROMPT';
const CLEAR_LAYOUT = 'CLEAR_LAYOUT';
const CREATE_LAYOUT = 'CREATE_LAYOUT';
const SELECT_TAB = 'SELECT_TAB';
const ADD_TABS = 'ADD_TABS';
const SHOW_STORE_LIBRARY = 'SHOW_STORE_LIBRARY';
const MACOS_MENUBAR_STYLE = 'MACOS_MENUBAR_STYLE';

const isMac = /Mac/i.test(navigator.platform || navigator.userAgent);

const initialState = {
  splash: false,
  alerts: [],
  prompt: null,
  mainMenu: null,
  tabs: [],
  sidebars: [],
  pane: false,
  tutorials: false,
  selectedTabIndex: -1,
  canEditProjectName: false,
  storeLibrary: false,
  macosMenubarStyle: isMac && window.electron,
};

export const LayoutContext = createContext({
  state: Object.assign({}, initialState),
  dispatch: () => {},
});

const reducer = (state, action) => {
  switch (action.type) {
    case CREATE_LAYOUT:
      return Object.assign(
        {},
        initialState,
        {
          splash: state.splash,
          macosMenubarStyle: state.macosMenubarStyle,
        },
        action.payload,
      );
    case CLEAR_LAYOUT:
      return Object.assign({}, initialState, {
        macosMenubarStyle: state.macosMenubarStyle,
      });
    case SET_SPLASH:
      return {
        ...state,
        splash: action.payload,
      };
    case CREATE_ALERT:
      if (state.alerts.find((alert) => alert.id === action.payload.id)) {
        return {
          ...state,
          alerts: state.alerts.map((alert) => {
            if (alert.id === action.payload.id) {
              return {
                ...alert,
                ...action.payload,
              };
            }
            return alert;
          }),
        };
      }
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      };
    case REMOVE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };
    case CREATE_PROMPT:
      return {
        ...state,
        prompt: action.payload,
      };
    case SELECT_TAB:
      return {
        ...state,
        selectedTabIndex: action.payload,
      };
    case ADD_TABS:
      return {
        ...state,
        tabs: [...state.tabs, ...action.payload],
      };
    case SHOW_STORE_LIBRARY:
      return {
        ...state,
        storeLibrary: action.payload,
      };
    case MACOS_MENUBAR_STYLE:
      return {
        ...state,
        macosMenubarStyle: action.payload,
      };
    default:
      return state;
  }
};

export function useLayout() {
  const { alerts, state, dispatch } = useContext(LayoutContext);

  return {
    ...state,

    setSplash(splash) {
      dispatch({ type: SET_SPLASH, payload: splash });
    },

    createAlert(...args) {
      let name, alert;
      let timeout = 0;
      for (const arg of args) {
        if (typeof arg === 'string') name = arg;
        if (typeof arg === 'object') alert = arg;
        if (typeof arg === 'number') timeout = arg;
      }
      if (name && alerts[name]) {
        alert = alert ? Object.assign(alerts[name], alert) : alerts[name];
      }
      if (!alert) return;

      if (!alert.id) {
        alert.id = Date.now().toString(36);
      }
      dispatch({ type: CREATE_ALERT, payload: alert });

      if (timeout > 0) {
        setTimeout(() => {
          dispatch({ type: REMOVE_ALERT, payload: alert.id });
        }, timeout);
      }
    },

    removeAlert(id) {
      dispatch({ type: REMOVE_ALERT, payload: id });
    },

    createPrompt(prompt) {
      dispatch({ type: CREATE_PROMPT, payload: prompt });
    },

    createLayout(layout) {
      dispatch({ type: CREATE_LAYOUT, payload: layout });
    },

    clearLayout() {
      clearHotkeys();
      dispatch({ type: CLEAR_LAYOUT });
    },

    selectTab(index) {
      dispatch({ type: SELECT_TAB, payload: index });
    },

    addTabs(tabs) {
      dispatch({ type: ADD_TABS, payload: tabs });
    },

    setStoreLibrary(display) {
      dispatch({ type: SHOW_STORE_LIBRARY, payload: display });
    },

    setMacosMenubarStyle(value) {
      console.log(value);
      dispatch({ type: MACOS_MENUBAR_STYLE, payload: value });
    },
  };
}

export function LayoutProvider({ alerts, children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <LayoutContext.Provider value={{ alerts, state, dispatch }}>{children}</LayoutContext.Provider>;
}
