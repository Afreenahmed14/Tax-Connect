const router = require('express').Router();

// router.use('/auth', require('./auth.routes'));
// router.use('/users', require('./user.routes'));
// router.use('/clients', require('./client.routes'));
// router.use('/services', require('./service.routes'));
// router.use('/documents', require('./document.routes'));
// router.use('/tasks', require('./task.routes'));
// router.use('/deadlines', require('./deadline.routes'));
// router.use('/payments', require('./payment.routes'));
// router.use('/invoices', require('./invoice.routes'));
// router.use('/dashboard', require('./dashboard.routes'));
// router.use('/chat', require('./chat.routes'));
// router.use('/notifications', require('./notification.routes'));
// router.use('/reports', require('./report.routes'));
// router.use('/audit', require('./audit.routes'));

// module.exports = router;


// const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/clients', require('./client.routes'));
router.use('/services', require('./service.routes'));
router.use('/documents', require('./document.routes'));
router.use('/tasks', require('./task.routes'));
router.use('/deadlines', require('./deadline.routes'));
router.use('/client-services', require('./clientService.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/invoices', require('./invoice.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/reports', require('./report.routes'));
router.use('/audit', require('./audit.routes'));

module.exports = router;

