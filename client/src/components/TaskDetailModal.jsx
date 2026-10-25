import React, { useEffect } from 'react';
import { X, Calendar, Clock, Pencil, Trash2, CheckCircle2 } from 'lucide-react';

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onToggleStatus
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const isCompleted = task.status === 'completed';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge badge-priority-${task.priority}`}>
              {task.priority.toUpperCase()}
            </span>
            <span className={`badge badge-status-${task.status}`}>
              <span className="badge-dot" />
              {task.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <button
            className="btn-icon"
            onClick={onClose}
            title="Close dialog"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <h2
            id="detail-title"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '12px'
            }}
          >
            {task.title}
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}
            >
              Description
            </h4>
            <p
              style={{
                fontSize: '0.925rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}
            >
              {task.description || 'No description provided.'}
            </p>
          </div>

          <div className="detail-meta-grid">
            <div>
              <div className="meta-item-label">Due Date</div>
              <div
                className="meta-item-value"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Calendar size={14} color="#64748b" />
                {task.dueDate || 'No deadline'}
              </div>
            </div>

            <div>
              <div className="meta-item-label">Task Identifier</div>
              <div className="meta-item-value">ID #{task.id}</div>
            </div>

            <div>
              <div className="meta-item-label">Created At</div>
              <div
                className="meta-item-value"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem'
                }}
              >
                <Clock size={14} color="#64748b" />
                {formatDate(task.createdAt)}
              </div>
            </div>

            <div>
              <div className="meta-item-label">Last Updated</div>
              <div
                className="meta-item-value"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem'
                }}
              >
                <Clock size={14} color="#64748b" />
                {formatDate(task.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        <div
          className="modal-footer"
          style={{ justifyContent: 'space-between' }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onToggleStatus(task)}
          >
            <CheckCircle2 size={16} />
            {isCompleted ? 'Mark Pending' : 'Mark Completed'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
            >
              <Pencil size={15} />
              Edit
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                onClose();
                onDelete(task);
              }}
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
