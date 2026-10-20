const router = require('express').Router();
const ctrl = require('../controllers/AuthController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.post('/register', ctrl.registerValidation, validate, ctrl.register);
router.post('/login',    ctrl.loginValidation, validate, ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', protect, ctrl.getMe);
router.put('/profile', protect, upload.single('avatar'), ctrl.updateProfile);
router.put('/change-password', protect, ctrl.changePassword);

module.exports = router;
