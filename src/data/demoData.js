export const workspaceSummary = {
  branch: 'main',
  environment: 'Codespace',
  lastSynced: '2m ago',
  notifications: 4,
  projectName: 'unihack',
};

export const activityBadges = {
  extensions: '2',
  git: '4',
  search: '9',
};

export const explorerStats = [
  { id: 'files', label: 'Files', value: '14' },
  { id: 'folders', label: 'Folders', value: '4' },
  { id: 'dirty', label: 'Dirty', value: '3' },
];

export const recentFiles = [
  {
    id: 'app',
    title: 'src/App.jsx',
    subtitle: 'Workbench shell and keyboard shortcuts',
    path: 'src/App.jsx',
  },
  {
    id: 'main',
    title: 'src/main.jsx',
    subtitle: 'React bootstrap entrypoint',
    path: 'src/main.jsx',
  },
  {
    id: 'readme',
    title: 'README.md',
    subtitle: 'Project notes and setup',
    path: 'README.md',
  },
];

export const welcomeMetrics = [
  { id: 'active-users', label: 'Live preview sessions', value: '12' },
  { id: 'branch', label: 'Working branch', value: 'main' },
  { id: 'issues', label: 'Queued warnings', value: '3' },
];

export const searchResults = [
  {
    id: 'result-app-grid',
    file: 'src/App.jsx',
    path: 'src/App.jsx',
    line: 122,
    preview: 'PanelGroup className="app-shell__horizontal-group" direction="horizontal"',
    category: 'Layout',
  },
  {
    id: 'result-store-open',
    file: 'src/App.css',
    path: 'src/App.css',
    line: 70,
    preview: '.app-shell { display: grid; grid-template-columns: 48px minmax(0, 1fr); }',
    category: 'Theme',
  },
  {
    id: 'result-terminal-open',
    file: 'src/main.jsx',
    path: 'src/main.jsx',
    line: 9,
    preview: 'root.render(<React.StrictMode><App /></React.StrictMode>);',
    category: 'Panel',
  },
  {
    id: 'result-sidebar-search',
    file: 'package.json',
    path: 'package.json',
    line: 8,
    preview: '"dependencies": { "@monaco-editor/react": "^4.7.0", "lucide-react": "^0.468.0" }',
    category: 'Search',
  },
  {
    id: 'result-readme',
    file: 'README.md',
    path: 'README.md',
    line: 9,
    preview: 'The workspace recreates the VS Code shell with Monaco and resizable panes.',
    category: 'Docs',
  },
];

export const sourceControlData = {
  incoming: 1,
  outgoing: 2,
  staged: [
    { id: 'staged-1', status: 'M', path: 'src/components/Panel/Terminal.jsx', summary: 'terminal state and history' },
    { id: 'staged-2', status: 'A', path: 'src/data/demoData.js', summary: 'shared static workspace content' },
  ],
  changes: [
    { id: 'change-1', status: 'M', path: 'src/components/Sidebar/Sidebar.jsx', summary: 'search and git panel polish' },
    { id: 'change-2', status: 'M', path: 'src/components/Editor/EditorArea.css', summary: 'welcome dashboard cards' },
    { id: 'change-3', status: 'M', path: 'src/components/StatusBar/StatusBar.jsx', summary: 'branch and notification badges' },
    { id: 'change-4', status: 'U', path: 'docs/demo-script.md', summary: 'launch notes for judging demo' },
  ],
};

export const extensionMarketplace = [
  {
    id: 'prettier',
    name: 'Prettier - Code Formatter',
    author: 'Prettier',
    installs: '34.8M',
    rating: '4.7',
    description: 'Format JavaScript, CSS, JSON, and Markdown with opinionated defaults.',
    tag: 'Formatter',
  },
  {
    id: 'eslint',
    name: 'ESLint',
    author: 'Microsoft',
    installs: '51.2M',
    rating: '4.6',
    description: 'Lint open files, surface warnings inline, and navigate rule diagnostics.',
    tag: 'Linting',
  },
  {
    id: 'theme',
    name: 'Tokyo Night Clone',
    author: 'Synth Labs',
    installs: '817K',
    rating: '4.9',
    description: 'A cinematic blue-toned theme pack with tuned syntax contrast.',
    tag: 'Theme',
  },
];

export const outputChannels = [
  { id: 'info-1', kind: 'command', text: '> npm run build' },
  { id: 'info-2', kind: 'info', text: 'vite v5.4.21 building for production...' },
  { id: 'info-3', kind: 'success', text: '✓ 1616 modules transformed.' },
  { id: 'info-4', kind: 'info', text: 'rendering chunks...' },
  { id: 'info-5', kind: 'info', text: 'computing gzip size...' },
  { id: 'info-6', kind: 'file', text: 'dist/index.html                   0.40 kB │ gzip:  0.27 kB' },
  { id: 'info-7', kind: 'file', text: 'dist/assets/index-DUin62ek.css   16.98 kB │ gzip:  3.70 kB' },
  { id: 'info-8', kind: 'file', text: 'dist/assets/index-MYuWpA-e.js   235.11 kB │ gzip: 75.04 kB' },
  { id: 'info-9', kind: 'success', text: '✓ build complete in 972ms' },
];

export const problemItems = [
  {
    id: 'problem-1',
    file: 'src/App.jsx',
    path: 'src/App.jsx',
    line: 77,
    message: 'Command palette should trap focus when opened.',
    severity: 'Warning',
    code: 'a11y/focus-management',
  },
  {
    id: 'problem-2',
    file: 'src/App.css',
    path: 'src/App.css',
    line: 121,
    message: 'Welcome dashboard should collapse to one column on smaller desktop widths.',
    severity: 'Warning',
    code: 'layout/responsive-dashboard',
  },
  {
    id: 'problem-3',
    file: 'README.md',
    path: 'README.md',
    line: 22,
    message: 'Terminal parser handles single-argument paths only.',
    severity: 'Warning',
    code: 'terminal/parser',
  },
];
