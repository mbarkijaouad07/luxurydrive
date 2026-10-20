const router = require('express').Router();
const ctrl = require('../controllers/BookingController');
const { protect } = require('../middleware/auth');

router.post('/',                   protect, ctrl.createBooking);
router.get('/my',                  protect, ctrl.getMyBookings);
router.get('/availability',        ctrl.checkAvailability);
router.get('/:id',                 protect, ctrl.getBookingById);
router.get('/:id/receipt',         protect, ctrl.downloadReceipt);
router.put('/:id/cancel',          protect, ctrl.cancelBooking);

module.exports = router;
