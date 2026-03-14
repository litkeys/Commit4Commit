import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useEditorStore } from '../../state/useEditorStore';
import './TabBar.css';

export default function TabBar() {
  const {
    state,
    activeTab,
    closeTab,
    openCommandPalette,
    setActiveTab,
  } = useEditorStore();
  const [renamingTabId, setRenamingTabId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (!renamingTabId) {
      setRenameValue('');
    }
  }, [renamingTabId]);

  const dashboardActive = state.editorView === 'dashboard';

  return (
    <header className="tab-bar">
      <div className="tab-bar__tabs" role="tablist" aria-label="Open files">
        {dashboardActive ? (
          <div
            className="tab-bar__tab tab-bar__tab--active tab-bar__tab--orchestra"
            role="tab"
            aria-selected="true"
            tabIndex={0}
          >
            <span className="tab-bar__tab-content">
              <span className="tab-bar__orchestra-mark" aria-hidden="true">
                ✳
              </span>
              <span className="tab-bar__label">Orchestra Dashboard</span>
            </span>
          </div>
        ) : null}

        {state.openTabs.map((tab) => {
          const isActive = !dashboardActive && activeTab?.id === tab.id;
          const isRenaming = renamingTabId === tab.id;

          return (
            <div
              key={tab.id}
              className={isActive ? 'tab-bar__tab tab-bar__tab--active' : 'tab-bar__tab'}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => setActiveTab(tab.id)}
              onDoubleClick={() => {
                setRenamingTabId(tab.id);
                setRenameValue(tab.name);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveTab(tab.id);
                }
              }}
            >
              {isRenaming ? (
                <input
                  autoFocus
                  className="tab-bar__rename"
                  type="text"
                  value={renameValue}
                  onBlur={() => setRenamingTabId(null)}
                  onChange={(event) => setRenameValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === 'Escape') {
                      setRenamingTabId(null);
                    }
                  }}
                />
              ) : (
                <span className="tab-bar__tab-content">
                  <span className="tab-bar__label">{tab.name}</span>
                </span>
              )}

              {tab.isDirty ? (
                <span className="tab-bar__dirty" aria-hidden="true">
                  ●
                </span>
              ) : (
                <button
                  className={isActive ? 'tab-bar__close tab-bar__close--visible' : 'tab-bar__close'}
                  type="button"
                  aria-label={`Close ${tab.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button className="tab-bar__command-trigger" type="button" onClick={openCommandPalette}>
        <Search size={15} strokeWidth={1.8} />
        <span>Search commands and files</span>
        <kbd>Ctrl+P</kbd>
      </button>
    </header>
  );
}
