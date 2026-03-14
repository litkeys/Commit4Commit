import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../state/useEditorStore';
import { detectLanguage } from '../../utils/languageDetect';
import './EditorArea.css';

function LoadingSkeleton() {
  return (
    <div className="empty-state">
      <div className="editor-skeleton">
        <div className="editor-skeleton__line editor-skeleton__line--long" />
        <div className="editor-skeleton__line editor-skeleton__line--medium" />
        <div className="editor-skeleton__line editor-skeleton__line--long" />
        <div className="editor-skeleton__line editor-skeleton__line--short" />
        <div className="editor-skeleton__line editor-skeleton__line--medium" />
      </div>
    </div>
  );
}

const recentFiles = [
  { name: 'App.jsx', path: 'src/App.jsx', language: 'javascript' },
  { name: 'useAuth.js', path: 'src/hooks/useAuth.js', language: 'javascript' },
  { name: 'App.css', path: 'src/App.css', language: 'css' },
  { name: 'helpers.js', path: 'src/utils/helpers.js', language: 'javascript' },
  { name: 'package.json', path: 'package.json', language: 'json' },
];

export default function EditorArea() {
  const editorRef = useRef(null);
  const monaco = useMonaco();
  const {
    state,
    activeTab,
    openCommandPalette,
    openFile,
    setCursorPosition,
    updateFileContent,
  } = useEditorStore();

  useEffect(() => {
    if (!monaco) {
      return;
    }

    monaco.editor.setTheme(state.theme === 'dark' ? 'vs-dark' : 'vs');
  }, [monaco, state.theme]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.setPosition({ lineNumber: 1, column: 1 });
    editorRef.current.revealPositionInCenter({ lineNumber: 1, column: 1 });
  }, [activeTab?.id]);

  if (!activeTab) {
    return (
      <section className="editor-area editor-area--welcome">
        <div className="editor-area__welcome">
          <img src="/vscode-logo.png" alt="VS Code" className="welcome-logo" />

          <p className="welcome-eyebrow">VISUAL STUDIO CODE</p>
          <h1 className="welcome-title">Welcome</h1>

          <p className="welcome-section-label">Recent</p>
          <div className="welcome-recent-list">
            {recentFiles.map((file) => (
              <div
                key={file.path}
                className="welcome-recent-item"
                onClick={() =>
                  openFile({
                    id: file.path,
                    name: file.name,
                    path: file.path,
                    type: 'file',
                    language: file.language,
                  })
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openFile({
                      id: file.path,
                      name: file.name,
                      path: file.path,
                      type: 'file',
                      language: file.language,
                    });
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <span className="welcome-recent-name">{file.name}</span>
                <span className="welcome-recent-path">{file.path}</span>
              </div>
            ))}
          </div>

          <div className="welcome-links">
            <span
              className="welcome-link"
              onClick={openCommandPalette}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openCommandPalette();
                }
              }}
              role="button"
              tabIndex={0}
            >
              ⌘ Command Palette
            </span>
            <span className="welcome-link">New File</span>
            <span className="welcome-link">Open Folder</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="editor-area">
      <Editor
        path={activeTab.path}
        theme={state.theme === 'dark' ? 'vs-dark' : 'vs'}
        language={detectLanguage(activeTab.name)}
        value={state.fileContents[activeTab.path] ?? ''}
        loading={<LoadingSkeleton />}
        onChange={(value = '') => updateFileContent(activeTab.path, value)}
        onMount={(editor) => {
          editorRef.current = editor;
          editor.focus();
          editor.onDidChangeCursorPosition((event) => {
            setCursorPosition(event.position.lineNumber, event.position.column);
          });
        }}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: true,
          smoothScrolling: true,
          tabSize: 2,
          wordWrap: 'off',
          automaticLayout: true,
        }}
      />
    </section>
  );
}
