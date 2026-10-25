const { getDb } = require('../db');

// Valid status & priority enums
const VALID_STATUSES = ['pending', 'in_progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// GET /api/tasks
exports.getAllTasks = (req, res, next) => {
  try {
    const db = getDb();
    const { status, priority, search, sortBy = 'createdAt', order = 'DESC' } = req.query;

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (status && VALID_STATUSES.includes(status)) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority && VALID_PRIORITIES.includes(priority)) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (search && search.trim() !== '') {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    // Safe sort column mapping
    const sortColumns = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      dueDate: 'dueDate',
      title: 'title',
      priority: `CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END`
    };

    const sortColumn = sortColumns[sortBy] || 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const tasks = db.all(query, params);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/stats
exports.getStats = (req, res, next) => {
  try {
    const db = getDb();

    const total = db.get('SELECT COUNT(*) as count FROM tasks')?.count || 0;
    const pending = db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'")?.count || 0;
    const inProgress = db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress'")?.count || 0;
    const completed = db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'")?.count || 0;
    const highPriority = db.get("SELECT COUNT(*) as count FROM tasks WHERE priority = 'high'")?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        completed,
        highPriority,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
exports.getTaskById = (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const task = db.get('SELECT * FROM tasks WHERE id = ?', [id]);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with id ${id} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
exports.createTask = (req, res, next) => {
  try {
    const db = getDb();
    const { title, description = '', status = 'pending', priority = 'medium', dueDate = null } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Task title is required and cannot be empty'
      });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`
      });
    }

    const now = new Date().toISOString();
    const cleanTitle = title.trim();
    const cleanDescription = (description || '').trim();
    const cleanDueDate = dueDate ? dueDate.trim() : null;

    const result = db.run(
      `INSERT INTO tasks (title, description, status, priority, dueDate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cleanTitle, cleanDescription, status, priority, cleanDueDate, now, now]
    );

    const newTask = db.get('SELECT * FROM tasks WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
exports.updateTask = (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const existingTask = db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: `Task with id ${id} not found`
      });
    }

    const {
      title = existingTask.title,
      description = existingTask.description,
      status = existingTask.status,
      priority = existingTask.priority,
      dueDate = existingTask.dueDate
    } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({
        success: false,
        error: 'Task title cannot be empty'
      });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`
      });
    }

    const now = new Date().toISOString();
    const cleanTitle = title.trim();
    const cleanDescription = typeof description === 'string' ? description.trim() : '';
    const cleanDueDate = dueDate ? dueDate.toString().trim() : null;

    db.run(
      `UPDATE tasks
       SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, updatedAt = ?
       WHERE id = ?`,
      [cleanTitle, cleanDescription, status, priority, cleanDueDate, now, id]
    );

    const updatedTask = db.get('SELECT * FROM tasks WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const existingTask = db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: `Task with id ${id} not found`
      });
    }

    db.run('DELETE FROM tasks WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: existingTask
    });
  } catch (err) {
    next(err);
  }
};
