
const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const controller = require('../controllers/clientService.controller');

router.use(auth);
router.post('/', controller.createClientService);

module.exports = router;
