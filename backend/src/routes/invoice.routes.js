
// const router = require('express').Router();
// const auth = require('../middleware/auth.middleware');
// const invoiceController = require('../controllers/invoice.controller');

// router.use(auth);

// router.get('/', invoiceController.getInvoices);
// router.get('/:id', invoiceController.getInvoiceById);

// module.exports = router;
const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/invoice.controller');

router.use(auth);

router.get('/', controller.getInvoices);
router.post('/', controller.createInvoice);
router.get('/:id', controller.getInvoiceById);

module.exports = router;
