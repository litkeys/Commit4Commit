import { Bell, GitBranch, RefreshCw } from 'lucide-react';
import { useEditorStore } from '../../state/useEditorStore';
import { problemItems, sourceControlData, workspaceSummary } from '../../data/demoData';
import { getLanguageLabel } from '../../utils/languageDetect';
import './StatusBar.css';

export default function StatusBar() {
  const { state, activeTab } = useEditorStore();

  return (
    <footer className="status-bar">
      <div className="status-bar__section">
        <span className="status-bar__item">
          <GitBranch size={13} />
          {workspaceSummary.branch}
        </span>
        <button className="status-bar__item status-bar__item--sync" type="button">
          <RefreshCw size={13} />
        </button>
        <span className="status-bar__item">⊗ 0</span>
        <span className="status-bar__item">⚠ {problemItems.length}</span>
        <span className="status-bar__item">↑{sourceControlData.outgoing} ↓{sourceControlData.incoming}</span>
      </div>

      <div className="status-bar__section status-bar__section--right">
        <span className="status-bar__item">
          {getLanguageLabel(activeTab?.language ?? 'plaintext')}
        </span>
        <span className="status-bar__item">
          Ln {state.cursorPosition.line}, Col {state.cursorPosition.col}
        </span>
        <span className="status-bar__item">UTF-8</span>
        <span className="status-bar__item">LF</span>
        <span className="status-bar__item">Spaces: 2</span>
        <span className="status-bar__item">{workspaceSummary.lastSynced}</span>
        <button className="status-bar__item" type="button" aria-label="Notifications">
          <Bell size={13} />
          {workspaceSummary.notifications}
        </button>
      </div>
    </footer>
  );
}
