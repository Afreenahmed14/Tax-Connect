
const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const taskController = require('../controllers/task.controller');

router.use(auth);

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
