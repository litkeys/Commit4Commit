import {
  Blocks,
  ClipboardList,
  Files,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
} from 'lucide-react';
import { useEditorStore } from '../../state/useEditorStore';
import { activityBadges } from '../../data/demoData';
import './ActivityBar.css';

const coreItems = [
  { id: 'explorer', label: 'Explorer', icon: Files },
  { id: 'search', label: 'Search', icon: Search, badge: activityBadges.search },
  { id: 'git', label: 'Source Control', icon: GitBranch, badge: activityBadges.git },
  { id: 'extensions', label: 'Extensions', icon: Blocks, badge: activityBadges.extensions },
];

const orchestraItems = [
  { id: 'orchestra-chat', label: 'Orchestra Chat', icon: MessageSquare },
  { id: 'orchestra-dashboard', label: 'Orchestra Dashboard', icon: LayoutDashboard },
  { id: 'orchestra-tasks', label: 'Task List', icon: ClipboardList },
];

export default function ActivityBar() {
  const {
    state,
    dispatch,
    openSettingsTab,
    setSidebarView,
    toggleSidebar,
  } = useEditorStore();
  const unfinishedTaskCount = state.managerTasks.filter((task) => task.status !== 'done').length;

  const handleSidebarClick = (view) => {
    if (state.sidebarView === view && state.sidebarOpen) {
      toggleSidebar();
    } else {
      setSidebarView(view);
    }
  };

  const handleOrchestraClick = (id) => {
    if (id === 'orchestra-dashboard') {
      dispatch({
        type: 'SET_EDITOR_VIEW',
        payload: state.editorView === 'dashboard' ? 'monaco' : 'dashboard',
      });
      return;
    }

    if (state.rightPanelOpen && state.rightPanelView === id) {
      dispatch({ type: 'TOGGLE_RIGHT_PANEL' });
      return;
    }

    dispatch({ type: 'SET_RIGHT_PANEL_VIEW', payload: id });
  };

  const isOrchestraActive = (id) => {
    if (id === 'orchestra-dashboard') {
      return state.editorView === 'dashboard';
    }

    return state.rightPanelOpen && state.rightPanelView === id;
  };

  return (
    <aside className="activity-bar">
      <div className="activity-bar__brand" aria-hidden="true">
        <span className="activity-bar__brand-mark" />
      </div>

      <div className="activity-bar__section">
        {coreItems.map((item) => {
          const Icon = item.icon;
          const isActive = state.sidebarOpen && state.sidebarView === item.id;

          return (
            <button
              key={item.id}
              data-id={item.id}
              className={
                isActive
                  ? 'activity-bar__button activity-icon active activity-bar__button--active'
                  : 'activity-bar__button activity-icon'
              }
              title={item.label}
              type="button"
              onClick={() => handleSidebarClick(item.id)}
            >
              <Icon size={20} strokeWidth={1.5} />
              {item.badge ? <span className="activity-bar__badge">{item.badge}</span> : null}
            </button>
          );
        })}

        <div className="activity-bar__orchestra-group">
          {orchestraItems.map((item) => {
            const Icon = item.icon;
            const isActive = isOrchestraActive(item.id);

            return (
              <button
                key={item.id}
                data-id={item.id}
                className={
                  isActive
                    ? 'activity-bar__button activity-icon active activity-bar__button--extension activity-bar__button--extension-active'
                    : 'activity-bar__button activity-icon activity-bar__button--extension'
                }
                title={item.label}
                type="button"
                onClick={() => handleOrchestraClick(item.id)}
              >
                <Icon size={20} strokeWidth={1.5} />
                <span className="activity-bar__orchestra-mark" aria-hidden="true">
                  ✳
                </span>
                {item.id === 'orchestra-tasks' ? (
                  <span className="activity-bar__task-badge">{unfinishedTaskCount}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="activity-bar__section activity-bar__section--bottom">
        <button
          data-id="settings"
          className="activity-bar__button activity-icon"
          title="Open Settings"
          type="button"
          onClick={openSettingsTab}
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
