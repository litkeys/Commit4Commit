import { AlertTriangle, ChevronDown, CircleAlert, CircleCheckBig } from 'lucide-react';
import { useEditorStore } from '../../state/useEditorStore';
import { outputChannels, problemItems } from '../../data/demoData';
import Terminal from './Terminal';
import './Panel.css';

const panelTabs = [
  { id: 'terminal', label: 'Terminal' },
  { id: 'output', label: 'Output' },
  { id: 'problems', label: 'Problems' },
];

export default function Panel() {
  const { openFileByPath, state, setPanelTab, togglePanel } = useEditorStore();

  return (
    <section className="panel panel-surface">
      <header className="panel__header">
        <div className="panel__tabs" role="tablist" aria-label="Bottom panels">
          {panelTabs.map((tab) => (
            <button
              key={tab.id}
              className={state.activePanel === tab.id ? 'panel__tab panel__tab--active' : 'panel__tab'}
              type="button"
              onClick={() => setPanelTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="panel__header-actions">
          <div className="panel__summary">
            <span className="panel__summary-item">
              <CircleCheckBig size={14} />
              1 task running
            </span>
            <span className="panel__summary-item panel__summary-item--warning">
              <AlertTriangle size={14} />
              {problemItems.length} warnings
            </span>
          </div>
          <button className="panel__toggle" type="button" aria-label="Collapse panel" onClick={togglePanel}>
            <ChevronDown size={16} />
          </button>
        </div>
      </header>

      <div className="panel__body">
        {state.activePanel === 'terminal' && <Terminal />}

        {state.activePanel === 'output' && (
          <div className="panel__output">
            <div className="panel__output-header">
              <span>Build Output</span>
              <span>vite: production</span>
            </div>
            <div className="panel__output-stream">
              {outputChannels.map((line) => (
                <div key={line.id} className={`panel__output-line panel__output-line--${line.kind}`}>
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {state.activePanel === 'problems' && (
          <div className="panel__problems">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Line</th>
                  <th>Message</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {problemItems.map((problem) => (
                  <tr key={problem.id} onClick={() => openFileByPath(problem.path)}>
                    <td>{problem.file}</td>
                    <td>{problem.line}</td>
                    <td>{problem.message}</td>
                    <td>
                      <span className="panel__severity">
                        <CircleAlert size={13} />
                        {problem.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
