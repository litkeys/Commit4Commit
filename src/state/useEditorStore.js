import { createContext, createElement, useContext, useReducer } from 'react';
import { fileContents as seedFileContents } from '../data/fileContents';
import { fileTree as seedFileTree } from '../data/fileTree';
import { detectLanguage } from '../utils/languageDetect';

const EditorStoreContext = createContext(null);

const SETTINGS_FILE_PATH = 'User/settings.json';

function decorateTree(nodes, parentPath = '') {
  return nodes.map((node) => {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;

    if (node.type === 'folder') {
      return {
        ...node,
        path,
        children: decorateTree(node.children ?? [], path),
      };
    }

    return {
      ...node,
      path,
    };
  });
}

function toggleFolder(nodes, folderId) {
  return nodes.map((node) => {
    if (node.id === folderId && node.type === 'folder') {
      return {
        ...node,
        isOpen: !node.isOpen,
      };
    }

    if (node.type === 'folder') {
      return {
        ...node,
        children: toggleFolder(node.children ?? [], folderId),
      };
    }

    return node;
  });
}

function findNodeByPath(nodes, path) {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }

    if (node.type === 'folder') {
      const match = findNodeByPath(node.children ?? [], path);

      if (match) {
        return match;
      }
    }
  }

  return null;
}

function createVirtualFile(path) {
  if (path === SETTINGS_FILE_PATH) {
    return {
      id: path,
      name: 'settings.json',
      path,
      type: 'file',
      language: 'json',
    };
  }

  return {
    id: path,
    name: path.split('/').pop() ?? path,
    path,
    type: 'file',
    language: detectLanguage(path),
  };
}

function resolveFile(path, fileTree) {
  return findNodeByPath(fileTree, path) ?? createVirtualFile(path);
}

function createTab(file) {
  return {
    id: file.path,
    name: file.name,
    path: file.path,
    language: file.language ?? detectLanguage(file.name),
    isDirty: false,
  };
}

function nextActiveTab(openTabs, closedIndex) {
  if (!openTabs.length) {
    return null;
  }

  const fallbackIndex = closedIndex >= openTabs.length ? openTabs.length - 1 : closedIndex;
  return openTabs[fallbackIndex]?.id ?? null;
}

const initialState = {
  openTabs: [],
  activeTabId: null,
  fileContents: { ...seedFileContents },
  sidebarView: 'explorer',
  sidebarOpen: true,
  panelOpen: true,
  activePanel: 'terminal',
  fileTree: decorateTree(seedFileTree),
  cursorPosition: { line: 1, col: 1 },
  theme: 'dark',
  commandPaletteOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN_FILE': {
      const existingTab = state.openTabs.find((tab) => tab.path === action.payload.path);

      if (existingTab) {
        return {
          ...state,
          activeTabId: existingTab.id,
          cursorPosition: { line: 1, col: 1 },
        };
      }

      const tab = createTab(action.payload);

      return {
        ...state,
        openTabs: [...state.openTabs, tab],
        activeTabId: tab.id,
        cursorPosition: { line: 1, col: 1 },
      };
    }

    case 'CLOSE_TAB': {
      if (!action.payload) {
        return state;
      }

      const closedIndex = state.openTabs.findIndex((tab) => tab.id === action.payload);

      if (closedIndex === -1) {
        return state;
      }

      const remainingTabs = state.openTabs.filter((tab) => tab.id !== action.payload);

      return {
        ...state,
        openTabs: remainingTabs,
        activeTabId:
          state.activeTabId === action.payload
            ? nextActiveTab(remainingTabs, closedIndex)
            : state.activeTabId,
        cursorPosition: { line: 1, col: 1 },
      };
    }

    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTabId: action.payload,
        cursorPosition: { line: 1, col: 1 },
      };

    case 'UPDATE_CONTENT': {
      const nextContents = {
        ...state.fileContents,
        [action.payload.path]: action.payload.value,
      };

      const nextTabs = state.openTabs.map((tab) => {
        if (tab.path !== action.payload.path) {
          return tab;
        }

        const originalValue = seedFileContents[action.payload.path] ?? '';

        return {
          ...tab,
          isDirty: action.payload.value !== originalValue,
        };
      });

      return {
        ...state,
        fileContents: nextContents,
        openTabs: nextTabs,
      };
    }

    case 'TOGGLE_FOLDER':
      return {
        ...state,
        fileTree: toggleFolder(state.fileTree, action.payload),
      };

    case 'SET_SIDEBAR_VIEW':
      return {
        ...state,
        sidebarView: action.payload,
        sidebarOpen: true,
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case 'TOGGLE_PANEL':
      return {
        ...state,
        panelOpen: !state.panelOpen,
      };

    case 'SET_PANEL_TAB':
      return {
        ...state,
        activePanel: action.payload,
        panelOpen: true,
      };

    case 'SET_CURSOR_POSITION':
      return {
        ...state,
        cursorPosition: action.payload,
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'OPEN_COMMAND_PALETTE':
      return {
        ...state,
        commandPaletteOpen: true,
      };

    case 'CLOSE_COMMAND_PALETTE':
      return {
        ...state,
        commandPaletteOpen: false,
      };

    case 'CYCLE_TABS': {
      if (state.openTabs.length < 2) {
        return state;
      }

      const currentIndex = state.openTabs.findIndex((tab) => tab.id === state.activeTabId);
      const baseIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex =
        (baseIndex + action.payload + state.openTabs.length) % state.openTabs.length;

      return {
        ...state,
        activeTabId: state.openTabs[nextIndex].id,
        cursorPosition: { line: 1, col: 1 },
      };
    }

    default:
      return state;
  }
}

export function EditorProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const openFile = (file) => {
    dispatch({ type: 'OPEN_FILE', payload: file });
  };

  const openFileByPath = (path) => {
    const file = resolveFile(path, state.fileTree);

    if (!file || file.type !== 'file') {
      return;
    }

    openFile(file);
  };

  const value = {
    state,
    activeTab: state.openTabs.find((tab) => tab.id === state.activeTabId) ?? null,
    openFile,
    openFileByPath,
    openSettingsTab: () => openFileByPath(SETTINGS_FILE_PATH),
    closeTab: (tabId) => dispatch({ type: 'CLOSE_TAB', payload: tabId }),
    closeActiveTab: () => dispatch({ type: 'CLOSE_TAB', payload: state.activeTabId }),
    cycleTabs: (direction) => dispatch({ type: 'CYCLE_TABS', payload: direction }),
    setActiveTab: (tabId) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId }),
    updateFileContent: (path, value) =>
      dispatch({ type: 'UPDATE_CONTENT', payload: { path, value } }),
    toggleFolder: (folderId) => dispatch({ type: 'TOGGLE_FOLDER', payload: folderId }),
    setSidebarView: (view) => dispatch({ type: 'SET_SIDEBAR_VIEW', payload: view }),
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    togglePanel: () => dispatch({ type: 'TOGGLE_PANEL' }),
    setPanelTab: (panel) => dispatch({ type: 'SET_PANEL_TAB', payload: panel }),
    setCursorPosition: (line, col) =>
      dispatch({ type: 'SET_CURSOR_POSITION', payload: { line, col } }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    toggleTheme: () =>
      dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' }),
    openCommandPalette: () => dispatch({ type: 'OPEN_COMMAND_PALETTE' }),
    closeCommandPalette: () => dispatch({ type: 'CLOSE_COMMAND_PALETTE' }),
  };

  return createElement(EditorStoreContext.Provider, { value }, children);
}

export function useEditorStore() {
  const context = useContext(EditorStoreContext);

  if (!context) {
    throw new Error('useEditorStore must be used within an EditorProvider');
  }

  return context;
}
