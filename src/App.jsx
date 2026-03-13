import { useEffect, useRef } from 'react';
import { Panel as ResizePanel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ActivityBar from './components/ActivityBar/ActivityBar';
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
  const sidebarPanelRef = useRef(null);
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
    const panel = sidebarPanelRef.current;

    if (!panel) {
      return;
    }

    if (state.sidebarOpen) {
      panel.expand();
      return;
    }

    panel.collapse();
  }, [state.sidebarOpen]);

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

  return (
    <div className="app-shell">
      <ActivityBar />
      <div className="app-shell__main">
        <PanelGroup className="app-shell__horizontal-group" direction="horizontal">
          <ResizePanel
            ref={sidebarPanelRef}
            className="app-shell__sidebar-panel"
            defaultSize={18}
            minSize={12}
            maxSize={30}
            collapsible
            collapsedSize={0}
          >
            <Sidebar />
          </ResizePanel>
          <PanelResizeHandle
            className={state.sidebarOpen ? 'resize-handle resize-handle--vertical' : 'resize-handle resize-handle--hidden'}
          />
          <ResizePanel className="app-shell__workspace-panel" minSize={40}>
            <PanelGroup className="app-shell__vertical-group" direction="vertical">
              <ResizePanel className="app-shell__editor-panel" defaultSize={76} minSize={25}>
                <div className="workspace">
                  <TabBar />
                  <Breadcrumb />
                  <EditorArea />
                </div>
              </ResizePanel>
              <PanelResizeHandle
                className={state.panelOpen ? 'resize-handle resize-handle--horizontal' : 'resize-handle resize-handle--hidden'}
              />
              <ResizePanel
                ref={panelRef}
                className="app-shell__bottom-panel"
                defaultSize={24}
                minSize={18}
                collapsible
                collapsedSize={0}
              >
                <Panel />
              </ResizePanel>
            </PanelGroup>
          </ResizePanel>
        </PanelGroup>
      </div>
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
