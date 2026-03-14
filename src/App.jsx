import { useEffect, useRef } from 'react';
import { Panel as ResizePanel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ActivityBar from './components/ActivityBar/ActivityBar';
import OrchestraChat from './components/OrchestraChat/OrchestraChat';
import OrchestraDashboard from './components/OrchestraDashboard/OrchestraDashboard';
import OrchestraTaskList from './components/OrchestraTaskList/OrchestraTaskList';
import Sidebar from './components/Sidebar/Sidebar';
import TabBar from './components/Tabs/TabBar';
import Breadcrumb from './components/Breadcrumb/Breadcrumb';
import EditorArea from './components/Editor/EditorArea';
import Panel from './components/Panel/Panel';
import StatusBar from './components/StatusBar/StatusBar';
import CommandPalette from './components/CommandPalette/CommandPalette';
import { EditorProvider, useEditorStore } from './state/useEditorStore';
import './App.css';

function Workspace() {
  const panelRef = useRef(null);
  const {
    state,
    closeActiveTab,
    closeCommandPalette,
    cycleTabs,
    openCommandPalette,
    togglePanel,
    toggleSidebar,
  } = useEditorStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    if (state.panelOpen) {
      panel.expand();
      return;
    }

    panel.collapse();
  }, [state.panelOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const modifier = event.ctrlKey || event.metaKey;

      if (event.key === 'Escape' && state.commandPaletteOpen) {
        event.preventDefault();
        closeCommandPalette();
        return;
      }

      if (!modifier) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'b') {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      if (event.code === 'Backquote') {
        event.preventDefault();
        togglePanel();
        return;
      }

      if (key === 'w') {
        event.preventDefault();
        closeActiveTab();
        return;
      }

      if (key === 'p') {
        event.preventDefault();
        openCommandPalette();
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        cycleTabs(event.shiftKey ? -1 : 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    closeActiveTab,
    closeCommandPalette,
    cycleTabs,
    openCommandPalette,
    state.commandPaletteOpen,
    togglePanel,
    toggleSidebar,
  ]);

  const appClassName = [
    'app',
    state.sidebarOpen ? '' : 'app--sidebar-collapsed',
    state.rightPanelOpen ? 'app--right-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={appClassName}>
      <ActivityBar />

      <div className="left-sidebar">
        <Sidebar />
      </div>

      <div className="editor-column">
        <TabBar />

        <div className="editor-column__body">
          <PanelGroup className="editor-column__panels" direction="vertical">
            <ResizePanel className="editor-column__top-panel" defaultSize={76} minSize={25}>
              {state.editorView === 'dashboard' ? (
                <OrchestraDashboard />
              ) : (
                <div className="editor-workspace">
                  <Breadcrumb />
                  <EditorArea />
                </div>
              )}
            </ResizePanel>

            <PanelResizeHandle
              className={state.panelOpen ? 'resize-handle resize-handle--horizontal' : 'resize-handle resize-handle--hidden'}
            />

            <ResizePanel
              ref={panelRef}
              className="editor-column__bottom-panel"
              defaultSize={24}
              minSize={18}
              collapsible
              collapsedSize={0}
            >
              <Panel />
            </ResizePanel>
          </PanelGroup>
        </div>
      </div>

      <aside className={state.rightPanelOpen ? 'right-panel right-panel--open' : 'right-panel'}>
        <div className="right-panel__inner">
          {state.rightPanelView === 'orchestra-chat' ? <OrchestraChat /> : null}
          {state.rightPanelView === 'orchestra-tasks' ? <OrchestraTaskList /> : null}
        </div>
      </aside>

      <StatusBar />
      <CommandPalette />
    </div>
  );
}

export default function App() {
  return (
    <EditorProvider>
      <Workspace />
    </EditorProvider>
  );
}
