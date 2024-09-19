import localForage from 'localforage';
import { createContext } from 'preact';
import { useContext, useReducer } from 'preact/hooks';
import { saveFile, openFile } from '../lib/project-file';

const CLOSE_PROJECT = 'CLOSE_PROJECT';
const OPEN_PROJECT = 'OPEN_PROJECT';
const SET_PROJECT_NAME = 'SET_PROJECT_NAME';
const ADD_FILE = 'ADD_FILE';
const OPEN_FILE = 'OPEN_FILE';
const DELETE_FILE = 'DELETE_FILE';
const MODIFY_FILE = 'MODIFY_FILE';
const ADD_ASSET = 'ADD_ASSET';
const DELETE_ASSET = 'DELETE_ASSET';
const MODIFY_ASSET = 'MODIFY_ASSET';
const CONNECT_DEVICE = 'CONNECT_DEVICE';
const CONFIG_EDITOR = 'CONFIG_EDITOR';
const SAVE_DATA = 'SAVE_DATA';

localForage.config({
  name: 'blockcode-store',
});

const initialState = {
  key: null,
  name: '',
  editor: null,
  assetList: [],
  fileList: [],
  selectedFileId: null,
  device: null,
  modified: false,
};

export const EditorContext = createContext({
  state: Object.assign({}, initialState),
  dispatch: () => {},
});

const reducer = (state, action) => {
  switch (action.type) {
    case CLOSE_PROJECT:
      return Object.assign({}, initialState);
    case OPEN_PROJECT:
      if (!action.payload.editor) {
        action.payload.editor = state.editor;
      }
      if (!action.payload.key) {
        action.payload.key = Date.now().toString(36);
      }
      return Object.assign({}, initialState, action.payload);
    case SET_PROJECT_NAME:
      return {
        ...state,
        name: action.payload,
        modified: true,
      };
    case ADD_FILE:
      return {
        ...state,
        fileList: state.fileList.concat(action.payload),
        selectedFileId: action.payload.id,
        modified: true,
      };
    case OPEN_FILE:
      return {
        ...state,
        selectedFileId: action.payload,
      };
    case DELETE_FILE:
      let index = state.fileList.findIndex((file) => file.id === action.payload);
      if (index === -1) return state;
      const fileList = state.fileList.filter((file) => file.id !== action.payload);
      if (index >= fileList.length) {
        index = fileList.length - 1;
      }
      return {
        ...state,
        fileList,
        selectedFileId: fileList[index].id,
        modified: true,
      };
    case MODIFY_FILE:
      return {
        ...state,
        fileList: state.fileList.map((file) => {
          if (action.payload.id ? file.id === action.payload.id : file.id === state.selectedFileId) {
            return {
              ...file,
              ...action.payload,
            };
          }
          return file;
        }),
        modified: true,
      };
    case ADD_ASSET:
      return {
        ...state,
        assetList: state.assetList.concat(action.payload),
        modified: true,
      };
    case DELETE_ASSET:
      return {
        ...state,
        assetList: state.assetList.filter((asset) => !action.payload.includes(asset.id)),
        modified: true,
      };
    case MODIFY_ASSET:
      return {
        ...state,
        assetList: state.assetList.map((asset) => {
          if (asset.id === action.payload.id) {
            return {
              ...asset,
              ...action.payload,
            };
          }
          return asset;
        }),
        modified: true,
      };
    case CONNECT_DEVICE:
      return {
        ...state,
        device: action.payload,
      };
    case CONFIG_EDITOR:
      return {
        ...state,
        editor: Object.assign(state.editor || {}, action.payload),
        modified: true,
      };
    case SAVE_DATA:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

const autoRename = (items, name) => {
  name = name.trim();
  if (items.find((file) => file.name === name)) {
    const nameStr = name.replace(/\d+$/, '');
    const nameRe = new RegExp(`${nameStr}(\\d+)$`);
    let nameNum = 0;
    for (const data of items) {
      const result = nameRe.exec(data.name);
      if (result) {
        const num = parseInt(result[1]);
        if (num > nameNum) {
          nameNum = num;
        }
      }
    }
    name = `${nameStr}${nameNum + 1}`;
  }
  return name;
};

export function useEditor() {
  const { state, dispatch } = useContext(EditorContext);

  return {
    ...state,

    closeProject() {
      dispatch({ type: CLOSE_PROJECT });
    },

    async openProject(data) {
      if (typeof data === 'stirng') {
        data = await localForage.getItem(key);
      }
      if (data) {
        dispatch({ type: OPEN_PROJECT, payload: data });
      } else {
        throw new Error(`${key} does not exist.`);
      }
    },

    setProjectName(name) {
      dispatch({ type: SET_PROJECT_NAME, payload: name });
    },

    addFile(data) {
      if (state.fileList.find((file) => file.id === data.id)) {
        throw Error('File already exists');
      }
      if (data.name) {
        data.name = autoRename(state.fileList, data.name);
      }
      dispatch({ type: ADD_FILE, payload: data });
    },

    openFile(id) {
      if (state.fileList.findIndex((file) => file.id === id) === -1) {
        throw Error('File does not exist');
      }
      dispatch({ type: OPEN_FILE, payload: id });
    },

    deleteFile(id) {
      dispatch({ type: DELETE_FILE, payload: id });
    },

    modifyFile(data) {
      if (state.fileList.find((file) => (data.id ? file.id === data.id : file.id === state.selectedFileId))) {
        if (data.name) {
          data.name = autoRename(state.fileList, data.name);
        }
        dispatch({ type: MODIFY_FILE, payload: data });
      } else {
        throw Error('File does not exists');
      }
    },

    addAsset(data) {
      if (state.assetList.find((asset) => asset.id === data.id)) {
        throw Error('Asset already exists');
      } else {
        if (data.name) {
          data.name = autoRename(state.assetList, data.name);
        }
        dispatch({ type: ADD_ASSET, payload: data });
      }
    },

    deleteAsset(...assetIds) {
      if (Array.isArray(assetIds[0])) {
        assetIds = assetIds[0];
      }
      dispatch({ type: DELETE_ASSET, payload: assetIds });
    },

    modifyAsset(data) {
      if (state.assetList.find((asset) => asset.id === data.id)) {
        if (data.name) {
          data.name = autoRename(state.assetList, data.name);
        }
        dispatch({ type: MODIFY_ASSET, payload: data });
      } else {
        throw Error('Asset does not exists');
      }
    },

    setDevice(device) {
      dispatch({ type: CONNECT_DEVICE, payload: device });
    },

    setEditor(config) {
      dispatch({ type: CONFIG_EDITOR, payload: config });
    },

    async saveNow(onSave) {
      const modifiedDate = Date.now();
      const key = state.key || modifiedDate.toString(36);
      const { name, editor, assetList, fileList } = state;
      const result = await localForage.setItem(
        key,
        onSave({
          key,
          name,
          assetList,
          fileList,
          modifiedDate,
          editor: {
            package: editor.package,
          },
        }),
      );
      dispatch({ type: SAVE_DATA, payload: { key, modified: false } });
      return result;
    },

    async saveToComputer(onSave) {
      const modifiedDate = Date.now();
      const key = state.key || modifiedDate.toString(36);
      const { name, editor, assetList, fileList } = state;
      const { thumb, ...project } = onSave({
        name,
        assetList,
        fileList,
        editor: {
          package: editor.package,
        },
      });
      await localForage.setItem(key, { key, thumb, modifiedDate, ...project });
      dispatch({ type: SAVE_DATA, payload: { key, modified: false } });
      return await saveFile(project);
    },

    async openFromComputer(onOpen) {
      onOpen(await openFile(), state.editor?.package);
    },

    setModified(modified) {
      dispatch({ type: SAVE_DATA, payload: { modified } });
    },

    async listProjects() {
      const result = [];
      await localForage.iterate((value, key) => {
        result.push({
          key,
          name: value.name,
          thumb: value.thumb,
          editor: value.editor,
          modifiedDate: value.modifiedDate,
        });
      });
      return result;
    },

    getProject(key) {
      return localForage.getItem(key);
    },

    async renameProject(key, name) {
      const project = await localForage.getItem(key);
      project.name = name;
      await localForage.setItem(project.key, project);
    },

    async duplicateProject(key) {
      const project = await localForage.getItem(key);
      project.modifiedDate = Date.now();
      project.key = project.modifiedDate.toString(36);
      await localForage.setItem(project.key, project);
    },

    async deleteProject(key) {
      await localForage.removeItem(key);
    },
  };
}

export function EditorProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>;
}
