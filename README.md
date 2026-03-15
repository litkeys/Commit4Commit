# VS Code Clone + Orchestra

A pixel-faithful VS Code clone built in React, extended with **Orchestra** — an AI coding assistant and engineering dashboard embedded directly into the editor shell.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react) ![Monaco](https://img.shields.io/badge/Monaco_Editor-0.55-007ACC?style=flat) ![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-orange?style=flat) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)

---

## What is this?

This project recreates the VS Code workbench shell as a React SPA and embeds three Orchestra panels into the activity bar:

- **Orchestra Chat** — an AI pair programmer powered by Groq. Ask it to explain, refactor, debug, test, or optimize the file you have open. It sends the active file content as context with every message and renders structured responses with syntax-highlighted code blocks and one-click apply actions.
- **Orchestra Dashboard** — a developer dashboard showing sprint progress, task breakdown, commit heatmap, active file stats, and blocker tracking. All data responds to the real Monaco editor (active file, line count, language).
- **Orchestra Task List** — a manager-facing task board with status cycling, priority filters, blocked-by tracking, and expandable task detail cards.

Everything else — the file explorer, resizable panels, Monaco editor, terminal, breadcrumb, tab bar, command palette, status bar, and theme switcher — faithfully recreates the VS Code shell experience.

---

## Features

### Editor Shell
- **Monaco Editor** with dark/light theme toggle, font ligatures, minimap, smooth cursor, and syntax highlighting for JS, TS, JSX, CSS, JSON, Markdown, HTML, and YAML
- **Resizable panels** via `react-resizable-panels` — drag between editor and terminal
- **File explorer** with expandable folder tree, open editors list, dirty indicators, and right-click context menu
- **Tab bar** with close, dirty state, double-click rename, and keyboard cycling (`Ctrl+Tab`)
- **Breadcrumb** navigation showing the active file path
- **Terminal** with real command parsing: `ls`, `cd`, `cat`, `tree`, `open`, `pwd`, `echo`, `git status`, `git log`, `clear`, and command history via arrow keys
- **Output panel** with mock build output
- **Problems panel** showing warnings linked to files
- **Status bar** with branch, sync button, cursor position, language, encoding, and notifications
- **Command palette** (`Ctrl+P`) with keyboard navigation for files and commands
- **Light/dark theme** — full CSS variable token system for both modes

### Orchestra AI
- **Context-aware chat** — automatically includes the active file's content (up to 2,000 chars) with every message
- **Quick actions** — one-click prompts: Explain, Refactor, Write tests, Fix bug, Optimize, Add types, Document, Find leaks
- **Structured responses** — prose, bullet lists, and syntax-highlighted code blocks in a single reply
- **Apply / Insert actions** — agent responses with code include a one-click action button
- **Copy to clipboard** on all code blocks
- **Chat history** — seeded with realistic multi-turn examples to demonstrate the full message format on load
- **Dev Dashboard** — sprint timeline, task ring chart, commit heatmap, active file analysis, and blocker cards
- **Task List** — filterable (ALL / HIGH / IN PROGRESS / BLOCKED), status cycling, expand-for-detail

### State Management
- Single `useReducer`-based store (`EditorStoreContext`) shared across the entire app — no external state library
- File contents tracked per-path with dirty state detection against seed content
- All editor actions (open, close, tab cycle, sidebar toggle, panel toggle, cursor position) dispatched through a single reducer

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI Framework | React | 18 |
| Build Tool | Vite | 5 |
| Code Editor | `@monaco-editor/react` | 4.7 |
| Panel Layout | `react-resizable-panels` | 2.1 |
| Icons | `lucide-react` | 0.468 |
| AI Backend | Groq (`llama-3.3-70b-versatile`) | — |
| Fonts | Fira Code, Segoe UI | — |

---

## Getting Started

### Prerequisites

- Node.js `>=18`
- A [Groq API key](https://console.groq.com) (free tier is sufficient)

### Install

```bash
git clone https://github.com/your-org/vscode-clone.git
cd vscode-clone
npm install
```

### Environment

Create a `.env` file in the project root:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

> The API key is accessed via `import.meta.env.VITE_GROQ_API_KEY` and goes directly from the browser to Groq's API. No backend server required.

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
vscode-clone/
├── src/
│   ├── App.jsx                          # Root layout grid, keyboard shortcuts, panel refs
│   ├── App.css                          # CSS variable token system (dark + light themes)
│   ├── main.jsx                         # React entry point
│   ├── components/
│   │   ├── ActivityBar/                 # Left icon rail with Orchestra extension group
│   │   ├── Breadcrumb/                  # Active file path display
│   │   ├── CommandPalette/              # Ctrl+P overlay with keyboard nav
│   │   ├── Editor/
│   │   │   └── EditorArea.jsx           # Monaco wrapper + welcome screen
│   │   ├── OrchestraChat/               # AI chat panel (right rail)
│   │   ├── OrchestraDashboard/          # Dev metrics dashboard (main editor area)
│   │   ├── OrchestraTaskList/           # Manager task board (right rail)
│   │   ├── Panel/
│   │   │   ├── Panel.jsx                # Bottom panel tabs (Terminal, Output, Problems)
│   │   │   └── Terminal.jsx             # Functional terminal with real command parsing
│   │   ├── Sidebar/
│   │   │   ├── FileTree.jsx             # Recursive file explorer with context menu
│   │   │   └── Sidebar.jsx
│   │   ├── StatusBar/                   # Footer with branch, cursor, language info
│   │   └── Tabs/
│   │       └── TabBar.jsx               # Tab strip with dirty state and rename
│   ├── data/
│   │   ├── demoData.js                  # Static workspace data (git, problems, output)
│   │   ├── fileContents.js              # Seed file content for the mock project
│   │   └── fileTree.js                  # Mock folder/file tree structure
│   ├── state/
│   │   └── useEditorStore.js            # Single useReducer store + EditorProvider
│   └── utils/
│       ├── languageDetect.js            # Extension to Monaco language mapping
│       ├── orchestraApi.js              # Groq API client with system prompt
│       └── parseOrchestralResponse.js   # Prose + code block parser for AI responses
├── public/
│   └── vscode-logo.png                  # Welcome screen logo
├── index.html
├── vite.config.js
└── package.json
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+P` / `Cmd+P` | Open Command Palette |
| `Ctrl+B` / `Cmd+B` | Toggle Sidebar |
| `` Ctrl+` `` | Toggle Terminal Panel |
| `Ctrl+W` / `Cmd+W` | Close Active Tab |
| `Ctrl+Tab` | Cycle Tabs Forward |
| `Ctrl+Shift+Tab` | Cycle Tabs Backward |
| `Escape` | Close Command Palette |
| `ArrowUp` / `ArrowDown` | Terminal command history |
| `Ctrl+L` | Clear Terminal |

---

## Orchestra Chat — System Prompt

The AI is instructed to behave as a focused coding assistant:

- Context-aware: knows the active file and its content
- No preamble ("Great question!", "Sure!") — just signal
- Max 3 bullet points when listing — no noise
- Always specifies language on code blocks
- Redirects off-topic questions back to the codebase

The system prompt and API call live in `src/utils/orchestraApi.js` and can be customized freely.

---

## Mock Workspace

The editor ships with a complete mock project pre-loaded — a fictional "Northstar Ops Dashboard" — so the app is immediately explorable without needing real files:

- `src/App.jsx`, `src/App.css`, `src/main.jsx`
- `src/components/Button.jsx`, `src/components/Modal.jsx`
- `src/utils/helpers.js`, `src/utils/api.js`
- `index.html`, `package.json`, `vite.config.js`, `README.md`
- `User/settings.json` (VS Code settings file)

All files are editable in Monaco, with dirty state detection and per-path content tracking.

---

## Deployment

The app is a pure client-side SPA. Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages). Set `VITE_GROQ_API_KEY` as an environment variable in your hosting dashboard.

```bash
npm run build
# Upload dist/ to your host
```

---

## License

MIT
