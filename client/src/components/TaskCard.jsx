import React from 'react';
import { Calendar, Eye, Pencil, Trash2, Check } from 'lucide-react';

export default function TaskCard({
  task,
  onView,
  onEdit,
  onDelete,
  onToggleStatus
}) {
  const isCompleted = task.status === 'completed';

  // Check if task is overdue
  let isOverdue = false;
  if (task.dueDate && !isCompleted) {
    const today = new Date().toISOString().split('T')[0];
    isOverdue = task.dueDate < today;
  }

  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High Priority'
  };

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed'
  };

  return (
    <div className={`task-card ${isCompleted ? 'is-completed' : ''}`}>
      <div>
        <div className="card-top-row">
          <div className="card-badges">
            <span className={`badge badge-priority-${task.priority}`}>
              {priorityLabels[task.priority] || task.priority}
            </span>
            <span className={`badge badge-status-${task.status}`}>
              <span className="badge-dot" />
              {statusLabels[task.status] || task.status}
            </span>
          </div>

          <div className="card-actions">
            <button
              className="btn-icon"
              onClick={() => onView(task)}
              title="View task details"
            >
              <Eye size={15} />
            </button>
            <button
              className="btn-icon"
              onClick={() => onEdit(task)}
              title="Edit task"
            >
              <Pencil size={15} />
            </button>
            <button
              className="btn-icon"
              style={{ color: '#ef4444' }}
              onClick={() => onDelete(task)}
              title="Delete task"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="card-title-group">
          <button
            type="button"
            className={`completion-checkbox ${isCompleted ? 'checked' : ''}`}
            onClick={() => onToggleStatus(task)}
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
          >
            {isCompleted && <Check size={12} strokeWidth={3} />}
          </button>
          <h3
            className={`card-title ${isCompleted ? 'completed-text' : ''}`}
            onClick={() => onView(task)}
          >
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="card-description">{task.description}</p>
        )}
      </div>

      <div className="card-footer">
        <div className="card-meta">
          {task.dueDate ? (
            <span className={`card-due-date ${isOverdue ? 'overdue' : ''}`}>
              <Calendar size={13} />
              {task.dueDate} {isOverdue && '(Overdue)'}
            </span>
          ) : (
            <span>No due date</span>
          )}
        </div>
        <div>
          <span>ID #{task.id}</span>
        </div>
      </div>
    </div>
  );
}
