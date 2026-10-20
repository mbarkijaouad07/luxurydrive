const router = require('express').Router();
const ctrl = require('../controllers/CarController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/',           ctrl.getCars);
router.get('/locations',  ctrl.getLocations);
router.get('/brands',     ctrl.getBrands);
router.get('/:id',        ctrl.getCarById);
router.post('/',          protect, adminOnly, upload.array('images', 10), ctrl.createCar);
router.put('/:id',        protect, adminOnly, upload.array('images', 10), ctrl.updateCar);
router.delete('/:id',     protect, adminOnly, ctrl.deleteCar);

module.exports = router;
