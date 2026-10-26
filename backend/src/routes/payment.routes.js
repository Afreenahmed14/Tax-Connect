
const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');

router.use(auth);

router.get('/', paymentController.getPayments);
router.get('/invoice/:invoiceId', paymentController.getPaymentsByInvoice);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);

module.exports = router;
