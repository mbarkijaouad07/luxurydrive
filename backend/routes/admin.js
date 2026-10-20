const router = require('express').Router();
const ctrl = require('../controllers/AdminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.getAllUsers);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/bookings', ctrl.getAllBookings);
router.put('/bookings/:id/status', ctrl.updateBookingStatus);
router.get('/messages', ctrl.getAllMessages);
router.put('/messages/:id/acknowledge', ctrl.acknowledgeMessage);
router.put('/messages/:id/reply', ctrl.replyMessage);

module.exports = router;
