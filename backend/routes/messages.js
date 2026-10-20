const express = require('express');
const router = express.Router();
const messageController = require('../controllers/MessageController');
const { protect } = require('../middleware/auth');

router.post('/', protect, messageController.sendMessage);
router.get('/my', protect, messageController.getMyMessages);

module.exports = router;
