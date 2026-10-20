const router = require('express').Router();
const ctrl = require('../controllers/ReviewController');
const { protect } = require('../middleware/auth');

router.post('/',                protect, ctrl.createReview);
router.get('/pending',          protect, ctrl.getPendingReview);
router.get('/car/:carId',       ctrl.getCarReviews);
router.put('/:id',              protect, ctrl.updateReview);
router.delete('/:id',           protect, ctrl.deleteReview);

module.exports = router;
