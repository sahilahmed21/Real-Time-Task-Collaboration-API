const express = require('express');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const checkTeamAccess = require('../middleware/teamAccess');
const router = express.Router({ mergeParams: true });

router.use(auth, checkTeamAccess);
router.route('/')
    .post(taskController.createTask)
    .get(taskController.getTasksForTeam);

router.route('/:taskId')
    .put(taskController.updateTask);


module.exports = router;