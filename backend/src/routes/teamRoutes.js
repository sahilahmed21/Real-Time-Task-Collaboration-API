const express = require('express');
const taskRoutes = require('./routes');
const auth = require('../middleware/auth');
const router = express.Router({ mergeParams: true });

router.get('/', auth, (req, res) => {
    res.send('list of teams the user is in ');
});


router.use('/:teamId/tasks', taskRoutes);


module.exports = router;