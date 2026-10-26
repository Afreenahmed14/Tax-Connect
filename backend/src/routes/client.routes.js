// const router = require('express').Router();

// // TODO: define routes

// module.exports = router;

const router = require('express').Router();

const clientController = require('../controllers/client.controller');
const auth = require('../middleware/auth.middleware');

// All client routes require authentication
router.use(auth);

// Get all clients
router.get('/', clientController.getClients);

// Get one client
router.get('/:id', clientController.getClientById);

// Create a client
router.post('/', clientController.createClient);

// Update a client
router.patch('/:id', clientController.updateClient);

// Deactivate a client
router.delete('/:id', clientController.deleteClient);

module.exports = router;
