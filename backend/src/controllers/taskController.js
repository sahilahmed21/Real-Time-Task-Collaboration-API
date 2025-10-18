const db = require('../utils/database');


exports.createTask = async (req, res) => {
    const { teamId } = req.params;
    const { title, description, status, priority, due_date, assigned_to } = req.body;
    const createdBy = req.user.id;
    if (!title || !status || !priority) {
        return res.status(400).json({ message: 'Title, status, and priority are required.' });
    }
    try {
        const { rows } = await db.query(
            `INSERT INTO tasks (title, description, status, priority, due_date, team_id, assigned_to, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [title, description, status, priority, due_date, teamId, assigned_to, created_by]
        );
        const newTask = rows[0];
        const io = req.app.get('socketio');
        io.to(`team:${teamId}`).emit('task:created', newTask);
        return res.status(201).json({ task: newTask });

    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority, due_date, assigned_to } = req.body;

    try {
        const { rows } = await db.query(
            `UPDATE tasks SET 
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                status = COALESCE($3, status),
                priority = COALESCE($4, priority),
                due_date = COALESCE($5, due_date),
                assigned_to = COALESCE($6, assigned_to),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 RETURNING *`,
            [title, description, status, priority, due_date, assigned_to, taskId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        const updatedTask = rows[0];

        const io = req.app.get('socketio');
        io.to(`team:${updatedTask.team_id}`).emit('task:updated', updatedTask);

        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error updating task.' });
    }
};