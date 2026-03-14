import { useEditorStore } from '../../state/useEditorStore';
import './OrchestraDashboard.css';

const SPRINTS = [
  { id: 1, name: 'Sprint 1', pct: 100, status: 'complete', deadline: 'Apr 1', isCurrent: false },
  { id: 2, name: 'Sprint 2', pct: 68, status: 'inprogress', deadline: 'Apr 15', isCurrent: true },
  { id: 3, name: 'Sprint 3', pct: 0, status: 'upcoming', deadline: 'May 1', isCurrent: false },
  { id: 4, name: 'Sprint 4', pct: 0, status: 'upcoming', deadline: 'May 15', isCurrent: false },
  { id: 5, name: 'Sprint 5', pct: 0, status: 'upcoming', deadline: 'Jun 1', isCurrent: false },
  { id: 6, name: 'Sprint 6', pct: 0, status: 'upcoming', deadline: 'Jun 15', isCurrent: false },
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const SESSIONS = ['AM', 'PM', 'EVE'];
const HEATMAP_DATA = [
  [1, 3, 2],
  [0, 2, 3],
  [2, 3, 2],
  [3, 3, 1],
  [2, 1, 0],
  [0, 0, 1],
  [0, 0, 0],
];

const STATUS_ORDER = ['todo', 'inProgress', 'done', 'blocked'];
const CIRCUMFERENCE = 2 * Math.PI * 54;

function sprintColor(status) {
  return {
    complete: '#059669',
    inprogress: '#2563eb',
    upcoming: '#1a1a1a',
  }[status];
}

function cellBg(level) {
  return ['#0a0a0a', 'rgba(37,99,235,0.2)', 'rgba(37,99,235,0.5)', '#2563eb'][level];
}

function getFunctionCount(language, content) {
  if (!['javascript', 'typescript', 'jsx', 'tsx', 'js', 'ts'].includes(language)) {
    return 0;
  }

  return (content.match(/\bfunction\b|=>/g) ?? []).length;
}

export default function OrchestraDashboard() {
  const { state, dispatch } = useEditorStore();
  const { activeTabId, devTasks, fileContents, openTabs } = state;
  const activeTab = openTabs.find((tab) => tab.id === activeTabId) ?? null;
  const activeContent = activeTab ? fileContents[activeTab.path] ?? '' : '';
  const lineCount = activeContent ? activeContent.split('\n').length : 0;
  const functionCount = activeTab ? getFunctionCount(activeTab.language, activeContent) : 0;
  const blockedTasks = devTasks.filter((task) => task.status === 'blocked');
  const inProgressCount = devTasks.filter((task) => task.status === 'inProgress').length;
  const todoCount = devTasks.filter((task) => task.status === 'todo').length;
  const doneCount = devTasks.filter((task) => task.status === 'done').length;
  const blockedCount = blockedTasks.length;
  const taskCounts = {
    inProgress: inProgressCount,
    todo: todoCount,
    done: doneCount,
    blocked: blockedCount,
  };
  const totalTasks = devTasks.length || 1;
  const activeHeroCount = inProgressCount + blockedCount;
  const tasksLeft = inProgressCount + todoCount;

  const ringSegments = [
    { label: 'In Progress', key: 'inProgress', color: '#2563eb' },
    { label: 'Todo', key: 'todo', color: '#2a2a2a' },
    { label: 'Done', key: 'done', color: '#059669' },
    { label: 'Blocked', key: 'blocked', color: '#dc2626' },
  ].map((segment) => ({
    ...segment,
    count: taskCounts[segment.key],
    pct: taskCounts[segment.key] / totalTasks,
  }));

  let offset = 0;
  const arcs = ringSegments.map((segment) => {
    const dash = segment.pct * CIRCUMFERENCE;
    const arc = {
      ...segment,
      dash,
      dashOffset: CIRCUMFERENCE - offset,
      labelPct: `${Math.round(segment.pct * 100)}%`,
    };

    offset += dash;
    return arc;
  });

  const cycleStatus = (taskId) => {
    const task = devTasks.find((entry) => entry.id === taskId);

    if (!task) {
      return;
    }

    const currentIndex = STATUS_ORDER.indexOf(task.status);
    const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];

    dispatch({
      type: 'UPDATE_DEV_TASK',
      payload: {
        id: taskId,
        status: nextStatus,
      },
    });
  };

  return (
    <div className="orchestra-root orchestra-dashboard">
      <div className="orch-dashboard-scanlines" />
      <div className="orch-dashboard-grain" />
      <div className="orch-orb" />

      <div className="orch-dash-content">
        <div className="orch-dash-hero">
          <div className="orch-dash-hero-left">
            <span className="orch-dash-breadcrumb">ORCHESTRA · DEV DASHBOARD</span>
            <h1 className="orch-dash-name">Alex Chen</h1>
            <p className="orch-dash-tagline">Sprint 2 · Auth &amp; API Layer · 4 days remaining</p>
          </div>

          <div className="orch-dash-hero-right">
            <div className="orch-avatar-large">AC</div>
            <div className="orch-hero-stats">
              <div className="orch-hero-stat">
                <span className="orch-hero-stat-val">68%</span>
                <span className="orch-hero-stat-label">SPRINT</span>
              </div>
              <div className="orch-hero-stat">
                <span className="orch-hero-stat-val">{activeHeroCount}</span>
                <span className="orch-hero-stat-label">ACTIVE</span>
              </div>
              <div className="orch-hero-stat">
                <span className="orch-hero-stat-val">{blockedCount}</span>
                <span className="orch-hero-stat-label">BLOCKED</span>
              </div>
              <div className="orch-hero-stat">
                <span className="orch-hero-stat-val">47</span>
                <span className="orch-hero-stat-label">COMMITS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="orch-dash-grid">
          <div className="orch-dash-block orch-span-full">
            <span className="orch-block-label">CURRENT SPRINT</span>
            <div className="orch-sprint-header">
              <span className="orch-sprint-name">Sprint 2 - Auth &amp; API Layer</span>
              <span className="orch-sprint-deadline">Due Apr 15 · 4 days left</span>
            </div>

            {SPRINTS.map((sprint) => (
              <div key={sprint.id} className="orch-sprint-row">
                <span className="orch-sprint-label">{sprint.name}</span>
                <div className="orch-sprint-track">
                  <div
                    className="orch-sprint-fill"
                    style={{ width: `${sprint.pct}%`, background: sprintColor(sprint.status) }}
                  />
                  {sprint.isCurrent ? <span className="orch-sprint-today">TODAY</span> : null}
                </div>
                <span className="orch-sprint-pct">{sprint.pct}%</span>
                <span className={`orch-sprint-chip orch-chip-${sprint.status}`}>
                  {sprint.status.toUpperCase()}
                </span>
                <span className="orch-sprint-date">{sprint.deadline}</span>
              </div>
            ))}
          </div>

          <div className="orch-dash-block">
            <span className="orch-block-label">MY TASKS</span>
            <div className="orch-task-list">
              {devTasks.map((task) => (
                <button
                  key={task.id}
                  className={`orch-task-row orch-task-row--${task.status}`}
                  type="button"
                  onClick={() => cycleStatus(task.id)}
                >
                  <span className={`orch-task-dot orch-task-dot--${task.status}`} />
                  <span className="orch-task-copy">
                    <span className="orch-task-name">{task.name}</span>
                    {task.status === 'blocked' && task.blockedBy ? (
                      <span className="orch-task-blocked-by">BLOCKED BY: {task.blockedBy}</span>
                    ) : null}
                  </span>
                  <span className="orch-task-estimate">{task.estimate}</span>
                  <span className={`orch-task-chip orch-task-chip--${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="orch-dash-block">
            <span className="orch-block-label">WORKLOAD</span>
            <div className="orch-ring-wrap">
              <svg className="orch-ring-svg" width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
                <circle className="orch-ring-track" cx="70" cy="70" r="54" fill="none" stroke="#111" strokeWidth="12" />
                {arcs.map((arc) => (
                  <circle
                    key={arc.label}
                    className="orch-ring-segment"
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke={arc.color}
                    strokeWidth="12"
                    strokeDasharray={`${arc.dash} ${CIRCUMFERENCE - arc.dash}`}
                    strokeDashoffset={arc.dashOffset}
                  />
                ))}
                <text x="70" y="64" textAnchor="middle" className="orch-ring-center-number">
                  {tasksLeft}
                </text>
                <text x="70" y="80" textAnchor="middle" className="orch-ring-center-label">
                  tasks left
                </text>
              </svg>

              <div className="orch-ring-legend">
                {ringSegments.map((segment) => (
                  <div key={segment.key} className="orch-ring-legend-item">
                    <span className="orch-ring-dot" style={{ background: segment.color }} />
                    <span className="orch-ring-leg-label">{segment.label}</span>
                    <span className="orch-ring-leg-count">{segment.count}</span>
                    <span className="orch-ring-leg-pct">{Math.round(segment.pct * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="orch-dash-block orch-span-full">
            <span className="orch-block-label">CODE ACTIVITY</span>
            <div className="orch-heatmap">
              {HEATMAP_DATA.map((daySessions, dayIndex) => (
                <div key={DAYS[dayIndex]} className="orch-heatmap-col">
                  {daySessions.map((level, sessionIndex) => (
                    <div
                      key={`${DAYS[dayIndex]}-${SESSIONS[sessionIndex]}`}
                      className="orch-heatmap-cell"
                      style={{ background: cellBg(level) }}
                      title={`${DAYS[dayIndex]} ${SESSIONS[sessionIndex]} · ${level * 4} commits`}
                    />
                  ))}
                  <span className="orch-heatmap-day">{DAYS[dayIndex]}</span>
                </div>
              ))}
            </div>

            <div className="orch-activity-stats">
              <div className="orch-activity-stat">
                <span className="orch-activity-value">47</span>
                <span className="orch-activity-label">COMMITS</span>
                <span className="orch-activity-sub">THIS WEEK</span>
              </div>
              <div className="orch-activity-stat">
                <span className="orch-activity-value">1,240</span>
                <span className="orch-activity-label">LINES CHANGED</span>
                <span className="orch-activity-sub">THIS WEEK</span>
              </div>
            </div>
          </div>

          <div className="orch-dash-block">
            <span className="orch-block-label">FOCUSED ON</span>
            <div className="orch-active-card">
              <div className="orch-active-row">
                <span className="orch-active-name">{activeTab?.name ?? '—'}</span>
                <span className="orch-active-chip">{activeTab?.language?.toUpperCase() ?? '—'}</span>
              </div>
              <p className="orch-active-path">{activeTab ? activeTab.path : 'No file open'}</p>
              <div className="orch-active-meta">
                <span>Active 24 min</span>
                <span>·</span>
                <span>{lineCount || 186} lines</span>
                <span>·</span>
                <span>{functionCount || 3} functions</span>
                <span>·</span>
                <span>↑ 12 ↓ 4 changes</span>
              </div>
            </div>
          </div>

          {blockedTasks.length ? (
            <div className="orch-dash-block">
              <span className="orch-block-label orch-label-danger">BLOCKERS - {blockedTasks.length}</span>
              {blockedTasks.map((task) => (
                <div key={task.id} className="orch-blocker-card">
                  <span className="orch-blocker-name">{task.name}</span>
                  {task.blockedBy ? (
                    <span className="orch-blocker-by">↳ Blocked by: {task.blockedBy}</span>
                  ) : null}
                  <div className="orch-blocker-footer">
                    <span className="orch-blocker-since">Since 2 days ago</span>
                    <span className="orch-blocker-est">Est: {task.estimate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
