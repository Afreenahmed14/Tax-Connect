
const router = require('express').Router();

const {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require('./service.controller');

// Public reads for initial API testing.
// Restrict these to authenticated users if required by your policy.
router.get('/', listServices);
router.get('/:id', getService);

// Protect all write operations with your project's real
// authentication and admin/consultant authorization middleware
// before using this in a shared or production environment.
router.post('/', createService);
router.patch('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
