import { useEditorStore } from '../../state/useEditorStore';
import './OrchestraTaskList.css';

const FILTERS = ['ALL', 'HIGH', 'IN PROGRESS', 'BLOCKED'];

function nextStatus(status) {
  return {
    todo: 'inProgress',
    inProgress: 'done',
    done: 'blocked',
    blocked: 'todo',
  }[status];
}

function getFilteredTasks(tasks, filter) {
  if (filter === 'HIGH') {
    return tasks.filter((task) => task.priority === 'HIGH');
  }

  if (filter === 'IN PROGRESS') {
    return tasks.filter((task) => task.status === 'inProgress');
  }

  if (filter === 'BLOCKED') {
    return tasks.filter((task) => task.status === 'blocked');
  }

  return tasks;
}

export default function OrchestraTaskList() {
  const { state, dispatch } = useEditorStore();
  const { expandedTaskId, managerTasks, taskFilter } = state;
  const unfinishedCount = managerTasks.filter((task) => task.status !== 'done').length;
  const doneTasks = managerTasks.filter((task) => task.status === 'done').length;
  const inProgressTasks = managerTasks.filter((task) => task.status === 'inProgress').length;
  const blockedTasks = managerTasks.filter((task) => task.status === 'blocked').length;
  const visibleTasks = getFilteredTasks(managerTasks, taskFilter);

  const toggleExpand = (taskId) => {
    dispatch({ type: 'SET_EXPANDED_TASK', payload: taskId });
  };

  const cycleStatus = (taskId) => {
    dispatch({ type: 'CYCLE_TASK_STATUS', payload: taskId });
  };

  return (
    <div className="orchestra-root orchestra-tasks">
      <header className="otl-header">
        <div className="otl-header-brand">
          <span className="otl-asterisk">✳</span>
          <span className="otl-title">TASK LIST</span>
        </div>
        <span className="otl-count-badge">{unfinishedCount}</span>
      </header>

      <div className="otl-filter-bar">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            className={taskFilter === filter ? 'otl-filter-chip active' : 'otl-filter-chip'}
            type="button"
            onClick={() => dispatch({ type: 'SET_TASK_FILTER', payload: filter })}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="otl-list-scroll">
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            className={`otl-task-card otl-status-${task.status}`}
            onClick={() => toggleExpand(task.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleExpand(task.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="otl-task-top">
              <span className={`otl-status-dot otl-dot-${task.status}`} />
              <span className="otl-task-title">{task.title}</span>
              <span className={`otl-priority-chip otl-p-${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            </div>

            <div className="otl-task-meta">
              <span className="otl-assigned-by">
                <span
                  className={`otl-avatar-tiny otl-avatar-${task.assignedBy.toLowerCase()}`}
                  aria-hidden="true"
                >
                  {task.assignedBy[0]}
                </span>
                {task.assignedBy}
              </span>
              <span className="otl-divider">·</span>
              <span className="otl-sprint">{task.sprint}</span>
              <span className="otl-divider">·</span>
              <span className="otl-due">Due {task.dueDate}</span>
              <span className="otl-divider">·</span>
              <span className="otl-estimate">{task.estimate}</span>
            </div>

            <div className="otl-tags-row">
              {task.tags.map((tag) => (
                <span key={tag} className="otl-tag">
                  {tag}
                </span>
              ))}
            </div>

            {expandedTaskId === task.id ? (
              <div className="otl-task-expanded">
                <p className="otl-task-desc">{task.description}</p>
                {task.blockedBy ? (
                  <div className="otl-blocked-by">
                    <span className="otl-blocked-label">BLOCKED BY</span>
                    <span className="otl-blocked-val">{task.blockedBy}</span>
                  </div>
                ) : null}
                <div className="otl-task-actions">
                  <button
                    className="otl-action-btn"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      cycleStatus(task.id);
                    }}
                  >
                    MARK {nextStatus(task.status).toUpperCase()}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="otl-footer">
        <span className="otl-footer-stat">{doneTasks} DONE</span>
        <span className="otl-footer-dot" />
        <span className="otl-footer-stat">{inProgressTasks} IN PROGRESS</span>
        <span className="otl-footer-dot" />
        <span className="otl-footer-stat otl-footer-blocked">{blockedTasks} BLOCKED</span>
      </div>
    </div>
  );
}
