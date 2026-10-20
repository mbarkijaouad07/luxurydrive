const router = require('express').Router();
const ctrl = require('../controllers/MessageController');
const { protect } = require('../middleware/auth');

router.post('/',    protect, ctrl.sendMessage);
router.get('/my',   protect, ctrl.getMyMessages);

module.exports = router;
