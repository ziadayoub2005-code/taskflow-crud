const API_BASE = '/api';

/**
 * Helper to handle fetch responses and extract JSON errors
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = (data && data.error) || response.statusText || 'An unexpected error occurred';
    throw new Error(error);
  }

  return data;
}

/**
 * Fetch all tasks with optional filters
 * @param {Object} filters { search, status, priority, sortBy, order }
 */
export async function getTasks(filters = {}) {
  const queryParams = new URLSearchParams();

  if (filters.search && filters.search.trim()) {
    queryParams.append('search', filters.search.trim());
  }
  if (filters.status && filters.status !== 'all') {
    queryParams.append('status', filters.status);
  }
  if (filters.priority && filters.priority !== 'all') {
    queryParams.append('priority', filters.priority);
  }
  if (filters.sortBy) {
    queryParams.append('sortBy', filters.sortBy);
  }
  if (filters.order) {
    queryParams.append('order', filters.order);
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE}/tasks${queryString ? `?${queryString}` : ''}`;
  const res = await fetch(url);
  const json = await handleResponse(res);
  return json.data || [];
}

/**
 * Fetch task statistics
 */
export async function getStats() {
  const res = await fetch(`${API_BASE}/tasks/stats`);
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Fetch single task by ID
 */
export async function getTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`);
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Create a new task
 */
export async function createTask(taskData) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Update an existing task
 */
export async function updateTask(id, taskData) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Delete a task
 */
export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE'
  });
  const json = await handleResponse(res);
  return json.data;
}

/**
 * Check backend health status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const json = await res.json();
    return json.status === 'healthy';
  } catch {
    return false;
  }
}
