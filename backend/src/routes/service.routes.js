// const router = require('express').Router();

// // TODO: define routes

// module.exports = router;
// const router = require('express').Router();

// router.get('/', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'Services route is working!'
//   });
// });

// module.exports = router;


const router = require('express').Router();

const {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require('../controllers/service.controller');

router.get('/', listServices);
router.get('/:id', getService);
router.post('/', createService);
router.patch('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
