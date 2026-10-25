import React from 'react';
import { Calendar, Eye, Pencil, Trash2, Check } from 'lucide-react';

export default function TaskTable({
  tasks,
  onView,
  onEdit,
  onDelete,
  onToggleStatus
}) {
  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  };

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed'
  };

  return (
    <div className="table-container">
      <table className="tasks-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}></th>
            <th>Task Details</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due Date</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            let isOverdue = false;
            if (task.dueDate && !isCompleted) {
              const today = new Date().toISOString().split('T')[0];
              isOverdue = task.dueDate < today;
            }

            return (
              <tr key={task.id}>
                <td>
                  <button
                    type="button"
                    className={`completion-checkbox ${isCompleted ? 'checked' : ''}`}
                    onClick={() => onToggleStatus(task)}
                    title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {isCompleted && <Check size={12} strokeWidth={3} />}
                  </button>
                </td>
                <td>
                  <div
                    className={`table-title-cell ${isCompleted ? 'completed-text' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onView(task)}
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="table-desc-cell">{task.description}</div>
                  )}
                </td>
                <td>
                  <span className={`badge badge-priority-${task.priority}`}>
                    {priorityLabels[task.priority] || task.priority}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-status-${task.status}`}>
                    <span className="badge-dot" />
                    {statusLabels[task.status] || task.status}
                  </span>
                </td>
                <td>
                  {task.dueDate ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: isOverdue ? '#ef4444' : 'inherit',
                        fontWeight: isOverdue ? 600 : 400
                      }}
                    >
                      <Calendar size={13} />
                      {task.dueDate}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '4px' }}>
                    <button
                      className="btn-icon"
                      onClick={() => onView(task)}
                      title="View details"
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
