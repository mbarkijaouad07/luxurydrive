const router = require('express').Router();
const ctrl = require('../controllers/FavoriteController');
const { protect } = require('../middleware/auth');

router.post('/toggle',         protect, ctrl.toggleFavorite);
router.get('/my',              protect, ctrl.getMyFavorites);
router.get('/check/:carId',    protect, ctrl.checkFavorite);

module.exports = router;
