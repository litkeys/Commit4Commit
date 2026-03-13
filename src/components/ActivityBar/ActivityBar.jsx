import { Blocks, Files, GitBranch, Search, Settings, SunMoon } from 'lucide-react';
import { useEditorStore } from '../../state/useEditorStore';
import { activityBadges } from '../../data/demoData';
import './ActivityBar.css';

const activityItems = [
  { id: 'explorer', label: 'Explorer', icon: Files },
  { id: 'search', label: 'Search', icon: Search, badge: activityBadges.search },
  { id: 'git', label: 'Source Control', icon: GitBranch, badge: activityBadges.git },
  { id: 'extensions', label: 'Extensions', icon: Blocks, badge: activityBadges.extensions },
];

export default function ActivityBar() {
  const { state, openSettingsTab, setSidebarView, toggleSidebar, toggleTheme } = useEditorStore();

  const handleSidebarClick = (view) => {
    if (state.sidebarView === view && state.sidebarOpen) {
      toggleSidebar();
      return;
    }

    setSidebarView(view);
  };

  return (
    <aside className="activity-bar">
      <div className="activity-bar__brand" aria-hidden="true">
        <span className="activity-bar__brand-mark" />
      </div>

      <div className="activity-bar__section">
        {activityItems.map((item) => {
          const Icon = item.icon;
          const isActive = state.sidebarOpen && state.sidebarView === item.id;

          return (
            <button
              key={item.id}
              className={isActive ? 'activity-bar__button activity-bar__button--active' : 'activity-bar__button'}
              title={item.label}
              type="button"
              onClick={() => handleSidebarClick(item.id)}
            >
              <Icon size={22} strokeWidth={1.8} />
              {item.badge ? <span className="activity-bar__badge">{item.badge}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="activity-bar__section activity-bar__section--bottom">
        <button
          className="activity-bar__button"
          title={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} theme`}
          type="button"
          onClick={toggleTheme}
        >
          <SunMoon size={20} strokeWidth={1.8} />
        </button>

        <button
          className="activity-bar__button"
          title="Open Settings"
          type="button"
          onClick={openSettingsTab}
        >
          <Settings size={20} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
