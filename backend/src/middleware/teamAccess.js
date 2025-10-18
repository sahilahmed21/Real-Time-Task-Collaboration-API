const db = require('../utils/database');

const checkTeamAccess = async (req, res, next) => {
    return async (req, res, next) => {
        try {
            const { teamId } = req.params;
            const userId = req.user.id;
            if (!teamId) {
                return res.status(400).json({ message: 'Team ID is required' });
            }
            const { rows } = await db.query(
                'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
                [teamId, userId]
            );

            if (rows.length === 0) {
                return res.status(403).json({ message: 'Access denied' });
            }
            const userRole = rows[0].role;
            if (requiredRole === 'admin' && userRole !== 'admin') {
                return res.status(403).json({ error: "Forbidden: Admin access required." });
            }
            next();
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};
module.exports = checkTeamAccess;