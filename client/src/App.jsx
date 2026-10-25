import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Plus,
  RefreshCw,
  FolderOpen,
  FilterX
} from 'lucide-react';

import {
  getTasks,
  getStats,
  createTask,
  updateTask,
  deleteTask,
  checkBackendHealth
} from './api';

import StatsBar from './components/StatsBar';
import FilterBar from './components/FilterBar';
import TaskCard from './components/TaskCard';
import TaskTable from './components/TaskTable';
import TaskModal from './components/TaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Toast from './components/Toast';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendHealthy, setBackendHealthy] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    order: 'DESC'
  });

  const [viewMode, setViewMode] = useState('grid');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Async action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch tasks and stats
  const loadData = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      const [tasksData, statsData, isHealthy] = await Promise.all([
        getTasks(filters),
        getStats(),
        checkBackendHealth()
      ]);

      setTasks(tasksData);
      setStats(statsData);
      setBackendHealthy(isHealthy);
    } catch (err) {
      console.error('Error fetching data:', err);
      setBackendHealthy(false);
      addToast(err.message || 'Failed to connect to backend server', 'error');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  }, [filters, addToast]);

  // Initial load & when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      sortBy: 'createdAt',
      order: 'DESC'
    });
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        // Update
        const updated = await updateTask(editingTask.id, formData);
        addToast(`Task "${updated.title}" updated successfully!`, 'success');
        if (viewingTask && viewingTask.id === updated.id) {
          setViewingTask(updated);
        }
      } else {
        // Create
        const created = await createTask(formData);
        addToast(`Task "${created.title}" created successfully!`, 'success');
      }

      setIsModalOpen(false);
      setEditingTask(null);
      await loadData(false);
    } catch (err) {
      addToast(err.message || 'Failed to save task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Task
  const handleConfirmDelete = async (taskId) => {
    setIsDeleting(true);
    try {
      await deleteTask(taskId);
      addToast('Task deleted successfully', 'success');
      setDeletingTask(null);
      if (viewingTask && viewingTask.id === taskId) {
        setViewingTask(null);
      }
      await loadData(false);
    } catch (err) {
      addToast(err.message || 'Failed to delete task', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Toggle Status (e.g. checkbox click)
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await updateTask(task.id, { status: newStatus });
      addToast(
        newStatus === 'completed'
          ? `Marked "${task.title}" as completed!`
          : `Reopened "${task.title}" as pending`,
        'info'
      );
      if (viewingTask && viewingTask.id === task.id) {
        setViewingTask(updated);
      }
      await loadData(false);
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  return (
    <>
      <div className="ambient-bg" />

      <div className="app-wrapper">
        {/* App Header */}
        <header className="app-header">
          <div className="brand-section">
            <div className="brand-logo-icon">
              <CheckSquare size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="brand-title">
                TaskFlow <span className="brand-badge">CRUD</span>
              </h1>
              <p className="brand-subtitle">
                RESTful Task Management System • SQLite & Express Backend
              </p>
            </div>
          </div>

          <div className="header-actions">
            <div className="health-indicator">
              <span
                className={`health-dot ${backendHealthy ? '' : 'offline'}`}
              />
              <span>{backendHealthy ? 'API Connected' : 'API Disconnected'}</span>
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => loadData(true)}
              title="Refresh data"
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} strokeWidth={2.5} />
              Add New Task
            </button>
          </div>
        </header>

        {/* Dashboard Statistics Bar */}
        <StatsBar stats={stats} />

        {/* Filters and Controls */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
          totalTasks={tasks.length}
        />

        {/* Content Area */}
        <main>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div
                className="spinner spinner-dark"
                style={{
                  width: '36px',
                  height: '36px',
                  margin: '0 auto 16px',
                  borderWidth: '3px'
                }}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Loading tasks from database...
              </p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-circle">
                {filters.search || filters.status !== 'all' || filters.priority !== 'all' ? (
                  <FilterX size={28} />
                ) : (
                  <FolderOpen size={28} />
                )}
              </div>
              <h3 className="empty-title">
                {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                  ? 'No matching tasks found'
                  : 'No tasks yet'}
              </h3>
              <p className="empty-subtitle">
                {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                  ? 'Try adjusting your search criteria or resetting the filters.'
                  : 'Get started by creating your first task in the database.'}
              </p>
              {filters.search || filters.status !== 'all' || filters.priority !== 'all' ? (
                <button className="btn btn-secondary" onClick={handleResetFilters}>
                  Clear Filters
                </button>
              ) : (
                <button className="btn btn-primary" onClick={openCreateModal}>
                  <Plus size={16} />
                  Create Your First Task
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="tasks-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onView={setViewingTask}
                  onEdit={openEditModal}
                  onDelete={setDeletingTask}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          ) : (
            <TaskTable
              tasks={tasks}
              onView={setViewingTask}
              onEdit={openEditModal}
              onDelete={setDeletingTask}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </main>
      </div>

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Task Details Modal */}
      <TaskDetailModal
        isOpen={Boolean(viewingTask)}
        onClose={() => setViewingTask(null)}
        task={viewingTask}
        onEdit={openEditModal}
        onDelete={setDeletingTask}
        onToggleStatus={handleToggleStatus}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        task={deletingTask}
        isDeleting={isDeleting}
      />

      {/* Toast Alert Feedback */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
