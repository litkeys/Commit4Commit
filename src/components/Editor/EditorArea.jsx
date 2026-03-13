import Editor, { useMonaco } from '@monaco-editor/react';
import { ArrowRight, Command, FolderOpenDot, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../state/useEditorStore';
import { recentFiles, welcomeMetrics, workspaceSummary } from '../../data/demoData';
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

function WelcomeLogo() {
  return (
    <svg
      className="editor-area__welcome-logo"
      viewBox="0 0 256 256"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M181.6 20.5 66.1 73.4v109.2l115.5 52.9 46.9-19.2V39.7z" />
      <path d="m181.6 20.5-115.5 52.9 60.8 54.6 54.7-48.2z" />
      <path d="m181.6 235.5-115.5-52.9 60.8-54.6 54.7 48.2z" />
      <path d="M66.1 73.4 20.5 53.8v148.4l45.6-19.6z" />
    </svg>
  );
}

export default function EditorArea() {
  const editorRef = useRef(null);
  const monaco = useMonaco();
  const {
    state,
    activeTab,
    openFileByPath,
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
          <WelcomeLogo />
          <div className="editor-area__welcome-copy">
            <span className="editor-area__welcome-label">Visual Studio Code</span>
            <h1>VS Code Clone</h1>
            <p>
              Explore a polished demo workspace with Monaco, quick actions, and realistic static project data.
            </p>
          </div>

          <div className="editor-area__welcome-grid">
            <section className="editor-area__welcome-card editor-area__welcome-card--hero">
              <div className="editor-area__welcome-chip">
                <Sparkles size={14} />
                {workspaceSummary.projectName}
              </div>
              <h2>Continue where you left off</h2>
              <p>Open recent files, explore the sidebar views, or hit the command palette to steer the shell.</p>
              <div className="editor-area__welcome-actions">
                <button type="button" onClick={() => openFileByPath('src/App.jsx')}>
                  <FolderOpenDot size={15} />
                  Open Explorer
                </button>
                <button type="button" onClick={() => openFileByPath('User/settings.json')}>
                  <Command size={15} />
                  Open Settings
                </button>
              </div>
            </section>

            <section className="editor-area__welcome-card">
              <div className="editor-area__section-heading">Recent files</div>
              <div className="editor-area__recent">
                {recentFiles.map((file) => (
                  <button key={file.id} type="button" onClick={() => openFileByPath(file.path)}>
                    <div>
                      <strong>{file.title}</strong>
                      <span>{file.subtitle}</span>
                    </div>
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>
            </section>

            <section className="editor-area__welcome-card">
              <div className="editor-area__section-heading">Workspace metrics</div>
              <div className="editor-area__metrics">
                {welcomeMetrics.map((metric) => (
                  <article key={metric.id} className="editor-area__metric">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </article>
                ))}
              </div>
            </section>
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
