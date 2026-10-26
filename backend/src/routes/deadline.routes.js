
const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const deadlineController = require('../controllers/deadline.controller');

router.use(auth);

router.get('/', deadlineController.getDeadlines);
router.get('/:id', deadlineController.getDeadlineById);
router.post('/', deadlineController.createDeadline);
router.patch('/:id', deadlineController.updateDeadline);

module.exports = router;
