import React from 'react';
import { Layers, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function StatsBar({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon-wrapper total">
          <Layers size={22} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper in-progress">
          <Clock size={22} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.inProgress || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper completed">
          <CheckCircle size={22} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.completed || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper pending">
          <AlertTriangle size={22} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{stats.highPriority || 0}</div>
          <div className="stat-label">High Priority</div>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="progress-container">
          <div className="progress-label-wrap">
            <span>Overall Progress</span>
            <span>{stats.completionRate}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${stats.completionRate}%` }}
              title={`${stats.completed} of ${stats.total} tasks completed`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
