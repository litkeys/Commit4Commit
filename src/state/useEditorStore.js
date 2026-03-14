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

function nextManagerTaskStatus(status) {
  return {
    todo: 'inProgress',
    inProgress: 'done',
    done: 'blocked',
    blocked: 'todo',
  }[status];
}

const initialFileTree = decorateTree(seedFileTree);
const initialOpenTabs = ['src/App.jsx', 'src/App.css', 'src/main.jsx'].map((path) =>
  createTab(resolveFile(path, initialFileTree))
);

const initialState = {
  openTabs: initialOpenTabs,
  activeTabId: initialOpenTabs[0]?.id ?? null,
  fileContents: { ...seedFileContents },
  sidebarView: 'explorer',
  sidebarOpen: true,
  rightPanelOpen: false,
  rightPanelView: 'orchestra-chat',
  editorView: 'monaco',
  panelOpen: true,
  activePanel: 'terminal',
  fileTree: initialFileTree,
  cursorPosition: { line: 1, col: 1 },
  theme: 'dark',
  commandPaletteOpen: false,
  // Chat
  chatMessages: [
    {
      id: 1,
      role: 'user',
      content: 'explain what this component does',
      file: 'App.jsx',
      time: '10:42 AM',
    },
    {
      id: 2,
      role: 'agent',
      content:
        'App.jsx is your root layout component. It sets up the CSS Grid shell that positions the activity bar, sidebar, editor area, bottom panel, and status bar. It wraps the entire tree in EditorStoreProvider so all children share state.',
      hasCode: false,
      bullets: null,
      action: null,
      time: '10:42 AM',
    },
    {
      id: 3,
      role: 'user',
      content: 'refactor the sidebar toggle to use useCallback',
      file: 'Sidebar.jsx',
      time: '10:44 AM',
    },
    {
      id: 4,
      role: 'agent',
      content:
        'Wrap the toggle handler in useCallback. Only include dispatch in the dependency array since it is stable from useReducer.',
      hasCode: true,
      codeBlock: `const handleToggle = useCallback(() => {\n  dispatch({ type: 'TOGGLE_SIDEBAR' });\n}, [dispatch]);`,
      language: 'jsx',
      action: 'APPLY TO FILE',
      bullets: null,
      time: '10:44 AM',
    },
    {
      id: 5,
      role: 'user',
      content: 'why is EditorArea re-rendering every keystroke',
      file: 'EditorArea.jsx',
      time: '10:47 AM',
    },
    {
      id: 6,
      role: 'agent',
      content:
        'Two causes. The options object passed to Monaco is recreated on every render triggering a full editor remount. The onChange handler is also unstable.',
      hasCode: false,
      bullets: [
        'Move options object outside component or memoize with useMemo',
        'Wrap onChange in useCallback - add activeTabId to its dep array',
        'Pass value as undefined if you want Monaco to be uncontrolled',
      ],
      action: null,
      time: '10:47 AM',
    },
    {
      id: 7,
      role: 'user',
      content: 'write a full test suite for useEditorStore',
      file: 'useEditorStore.js',
      time: '10:51 AM',
    },
    {
      id: 8,
      role: 'agent',
      content:
        'Here is a complete test suite covering open tab, close tab, toggle sidebar, and cursor position actions.',
      hasCode: true,
      codeBlock: `import { renderHook, act } from '@testing-library/react';\nimport { useEditorStore } from './useEditorStore';\n\ndescribe('useEditorStore', () => {\n  it('opens a new tab', () => {\n    const { result } = renderHook(() => useEditorStore());\n    act(() => result.current.dispatch({ type: 'OPEN_FILE', payload: { id: 'f1', name: 'App.jsx' } }));\n    expect(result.current.state.openTabs).toHaveLength(1);\n  });\n\n  it('closes the active tab', () => {\n    const { result } = renderHook(() => useEditorStore());\n    act(() => result.current.dispatch({ type: 'OPEN_FILE', payload: { id: 'f1', name: 'App.jsx' } }));\n    act(() => result.current.dispatch({ type: 'CLOSE_TAB', payload: 'f1' }));\n    expect(result.current.state.openTabs).toHaveLength(0);\n  });\n\n  it('toggles sidebar', () => {\n    const { result } = renderHook(() => useEditorStore());\n    act(() => result.current.dispatch({ type: 'TOGGLE_SIDEBAR' }));\n    expect(result.current.state.sidebarOpen).toBe(false);\n  });\n});`,
      language: 'js',
      action: 'INSERT AT CURSOR',
      bullets: null,
      time: '10:51 AM',
    },
    {
      id: 9,
      role: 'user',
      content: 'find all memory leaks in the terminal component',
      file: 'Terminal.jsx',
      time: '11:02 AM',
    },
    {
      id: 10,
      role: 'agent',
      content: 'Found two likely leak sources in Terminal.jsx.',
      hasCode: true,
      codeBlock: `// LEAK 1: event listener never removed\nuseEffect(() => {\n  window.addEventListener('keydown', handler);\n  return () => window.removeEventListener('keydown', handler); // add this\n}, []);\n\n// LEAK 2: setInterval without cleanup\nuseEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id); // add this\n}, []);`,
      language: 'jsx',
      action: 'APPLY TO FILE',
      bullets: null,
      time: '11:02 AM',
    },
  ],
  chatInput: '',
  chatIsTyping: false,
  // Dev Dashboard
  devTasks: [
    {
      id: 't1',
      name: 'Refactor auth hook to remove Redux dependency',
      status: 'inProgress',
      priority: 'HIGH',
      blockedBy: null,
      estimate: '2d',
    },
    {
      id: 't2',
      name: 'Write session persistence tests',
      status: 'todo',
      priority: 'MED',
      blockedBy: null,
      estimate: '1d',
    },
    {
      id: 't3',
      name: 'Fix token refresh race condition',
      status: 'blocked',
      priority: 'HIGH',
      blockedBy: 'API contract review',
      estimate: '3d',
    },
    {
      id: 't4',
      name: 'API contract review with backend team',
      status: 'done',
      priority: 'MED',
      blockedBy: null,
      estimate: '4h',
    },
    {
      id: 't5',
      name: 'Update README with auth flow diagrams',
      status: 'todo',
      priority: 'LOW',
      blockedBy: null,
      estimate: '2h',
    },
    {
      id: 't6',
      name: 'Migrate useAuth to Context API',
      status: 'inProgress',
      priority: 'HIGH',
      blockedBy: null,
      estimate: '1d',
    },
    {
      id: 't7',
      name: 'Add loading skeleton to dashboard route',
      status: 'todo',
      priority: 'MED',
      blockedBy: null,
      estimate: '3h',
    },
    {
      id: 't8',
      name: "Code review: Sam's payment module PR",
      status: 'done',
      priority: 'MED',
      blockedBy: null,
      estimate: '1h',
    },
  ],
  managerTasks: [
    {
      id: 'mt1',
      title: 'Implement JWT refresh token rotation',
      description:
        'Replace static tokens with rotating refresh token pairs. See RFC 6749 section 6.',
      priority: 'HIGH',
      status: 'inProgress',
      assignedBy: 'Sam',
      assignedByColor: '#059669',
      sprint: 'Sprint 2',
      dueDate: 'Apr 12',
      estimate: '2d',
      tags: ['auth', 'security'],
    },
    {
      id: 'mt2',
      title: 'Refactor useAuth hook - remove Redux',
      description: 'Migrate to Context API. Redux adds 40KB to bundle for no benefit here.',
      priority: 'HIGH',
      status: 'inProgress',
      assignedBy: 'Sam',
      assignedByColor: '#059669',
      sprint: 'Sprint 2',
      dueDate: 'Apr 13',
      estimate: '1d',
      tags: ['refactor', 'auth'],
    },
    {
      id: 'mt3',
      title: 'Fix token refresh race condition',
      description:
        'Two concurrent requests both trigger refresh. Use a mutex or request queue.',
      priority: 'HIGH',
      status: 'blocked',
      assignedBy: 'Sam',
      assignedByColor: '#059669',
      sprint: 'Sprint 2',
      dueDate: 'Apr 14',
      estimate: '3d',
      blockedBy: 'API contract review',
      tags: ['bug', 'auth'],
    },
    {
      id: 'mt4',
      title: 'Write test suite for session persistence',
      description:
        'Cover: login, logout, token expiry, refresh, and network failure scenarios.',
      priority: 'MED',
      status: 'todo',
      assignedBy: 'Jordan',
      assignedByColor: '#2563eb',
      sprint: 'Sprint 2',
      dueDate: 'Apr 15',
      estimate: '1d',
      tags: ['testing'],
    },
    {
      id: 'mt5',
      title: 'API contract review with backend',
      description:
        'Align on request/response shapes for /auth/refresh and /auth/logout endpoints.',
      priority: 'MED',
      status: 'done',
      assignedBy: 'Jordan',
      assignedByColor: '#2563eb',
      sprint: 'Sprint 2',
      dueDate: 'Apr 10',
      estimate: '4h',
      tags: ['api', 'review'],
    },
    {
      id: 'mt6',
      title: 'Add loading skeleton to dashboard route',
      description:
        'Replace blank flash on navigation with skeleton screen matching final layout.',
      priority: 'MED',
      status: 'todo',
      assignedBy: 'Sam',
      assignedByColor: '#059669',
      sprint: 'Sprint 2',
      dueDate: 'Apr 15',
      estimate: '3h',
      tags: ['ui'],
    },
    {
      id: 'mt7',
      title: 'Migrate useAuth to Context API',
      description:
        'Follow the pattern established in useWorkspace. Share context via AuthProvider.',
      priority: 'HIGH',
      status: 'inProgress',
      assignedBy: 'Sam',
      assignedByColor: '#059669',
      sprint: 'Sprint 2',
      dueDate: 'Apr 13',
      estimate: '1d',
      tags: ['refactor'],
    },
    {
      id: 'mt8',
      title: 'Document auth flow with sequence diagram',
      description:
        'Add Mermaid diagram to README covering login -> token issue -> refresh -> logout.',
      priority: 'LOW',
      status: 'todo',
      assignedBy: 'Jordan',
      assignedByColor: '#2563eb',
      sprint: 'Sprint 3',
      dueDate: 'May 2',
      estimate: '2h',
      tags: ['docs'],
    },
    {
      id: 'mt9',
      title: "Code review: Sam's payment module PR #84",
      description: 'Focus on error handling paths and PCI compliance surface area.',
      priority: 'MED',
      status: 'done',
      assignedBy: 'Jordan',
      assignedByColor: '#2563eb',
      sprint: 'Sprint 2',
      dueDate: 'Apr 11',
      estimate: '1h',
      tags: ['review'],
    },
    {
      id: 'mt10',
      title: 'Set up E2E test pipeline with Playwright',
      description:
        'Cover critical auth and checkout paths. Run on every PR targeting main.',
      priority: 'MED',
      status: 'todo',
      assignedBy: 'Sam',
      assignedByColor: '#059669',
      sprint: 'Sprint 3',
      dueDate: 'May 5',
      estimate: '2d',
      tags: ['testing', 'ci'],
    },
    {
      id: 'mt11',
      title: 'Resolve CSP violations in production logs',
      description:
        '14 CSP errors per session from inline scripts in third-party widgets. Audit and fix.',
      priority: 'HIGH',
      status: 'blocked',
      assignedBy: 'Sam',
      assignedByColor: '#059669',
      sprint: 'Sprint 2',
      dueDate: 'Apr 14',
      estimate: '1d',
      blockedBy: 'Security audit sign-off',
      tags: ['security', 'bug'],
    },
    {
      id: 'mt12',
      title: 'Optimize bundle - target sub-200KB gzipped',
      description:
        'Current: 340KB. Remove moment.js, lazy-load chart lib, tree-shake lodash.',
      priority: 'MED',
      status: 'todo',
      assignedBy: 'Jordan',
      assignedByColor: '#2563eb',
      sprint: 'Sprint 3',
      dueDate: 'May 8',
      estimate: '2d',
      tags: ['performance'],
    },
  ],
  expandedTaskId: null,
  taskFilter: 'ALL',
};

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN_FILE': {
      const existingTab = state.openTabs.find((tab) => tab.path === action.payload.path);

      if (existingTab) {
        return {
          ...state,
          activeTabId: existingTab.id,
          editorView: 'monaco',
          cursorPosition: { line: 1, col: 1 },
        };
      }

      const tab = createTab(action.payload);

      return {
        ...state,
        openTabs: [...state.openTabs, tab],
        activeTabId: tab.id,
        editorView: 'monaco',
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
        editorView: 'monaco',
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

    case 'TOGGLE_RIGHT_PANEL':
      return {
        ...state,
        rightPanelOpen: !state.rightPanelOpen,
      };

    case 'SET_RIGHT_PANEL_VIEW':
      return {
        ...state,
        rightPanelView: action.payload,
        rightPanelOpen: true,
      };

    case 'SET_EDITOR_VIEW':
      return {
        ...state,
        editorView: action.payload,
      };

    case 'SEND_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
        chatIsTyping: true,
      };

    case 'RECEIVE_CHAT_RESPONSE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
        chatIsTyping: false,
      };

    case 'SET_CHAT_TYPING':
      return {
        ...state,
        chatIsTyping: action.payload,
      };

    case 'SET_CHAT_INPUT':
      return {
        ...state,
        chatInput: action.payload,
      };

    case 'CLEAR_CHAT':
      return {
        ...state,
        chatMessages: [],
        chatInput: '',
        chatIsTyping: false,
      };

    case 'UPDATE_DEV_TASK':
      return {
        ...state,
        devTasks: state.devTasks.map((task) =>
          task.id === action.payload.id ? { ...task, status: action.payload.status } : task
        ),
      };

    case 'CYCLE_TASK_STATUS':
      return {
        ...state,
        managerTasks: state.managerTasks.map((task) =>
          task.id === action.payload
            ? { ...task, status: nextManagerTaskStatus(task.status) }
            : task
        ),
      };

    case 'SET_TASK_FILTER':
      return {
        ...state,
        taskFilter: action.payload,
      };

    case 'SET_EXPANDED_TASK':
      return {
        ...state,
        expandedTaskId: state.expandedTaskId === action.payload ? null : action.payload,
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
        editorView: 'monaco',
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
    dispatch,
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
    toggleRightPanel: () => dispatch({ type: 'TOGGLE_RIGHT_PANEL' }),
    setRightPanelView: (view) => dispatch({ type: 'SET_RIGHT_PANEL_VIEW', payload: view }),
    setEditorView: (view) => dispatch({ type: 'SET_EDITOR_VIEW', payload: view }),
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
