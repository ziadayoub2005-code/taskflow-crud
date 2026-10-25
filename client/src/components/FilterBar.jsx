import React from 'react';
import { Search, X, LayoutGrid, List, RotateCcw } from 'lucide-react';

export default function FilterBar({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  totalTasks
}) {
  const statusTabs = [
    { key: 'all', label: 'All Tasks' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' }
  ];

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.sortBy !== 'createdAt' ||
    filters.order !== 'DESC';

  return (
    <div className="controls-card">
      <div className="controls-row">
        {/* Search */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title or description..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
          {filters.search && (
            <button
              className="clear-search-btn"
              onClick={() => onFilterChange('search', '')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          className="select-filter"
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Sort by */}
        <select
          className="select-filter"
          value={`${filters.sortBy}-${filters.order}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split('-');
            onFilterChange('sortBy', sortBy);
            onFilterChange('order', order);
          }}
          aria-label="Sort tasks"
        >
          <option value="createdAt-DESC">Newest First</option>
          <option value="createdAt-ASC">Oldest First</option>
          <option value="dueDate-ASC">Due Date (Earliest)</option>
          <option value="priority-DESC">Priority (High to Low)</option>
          <option value="title-ASC">Title (A - Z)</option>
        </select>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            className="btn btn-ghost"
            style={{ fontSize: '0.8125rem', padding: '8px 12px' }}
            onClick={onResetFilters}
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}

        {/* View Mode Toggle */}
        <div className="view-mode-toggle" style={{ marginLeft: 'auto' }}>
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onViewModeChange('table')}
            title="Table View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${filters.status === tab.key ? 'active' : ''}`}
            onClick={() => onFilterChange('status', tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
