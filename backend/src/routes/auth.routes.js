const router = require('express').Router();
const c = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const v = require('../validators/auth.validator');
const auth = require('../middleware/auth.middleware');
const { otpLimiter, loginLimiter } = require('../middleware/rateLimiter.middleware');

// router.post('/register', otpLimiter, validate(v.register), c.register);
// router.post('/verify-otp', validate(v.verifyOtp), c.verifyOtp);


router.post('/register', otpLimiter, validate(v.register), c.register);
router.post('/resend-otp', otpLimiter, c.resendOtp);
router.post('/verify-otp', validate(v.verifyOtp), c.verifyOtp);

router.post('/login', loginLimiter, validate(v.login), c.login);
router.post('/forgot-password', otpLimiter, validate(v.forgot), c.forgotPassword);
router.post('/reset-password', validate(v.reset), c.resetPassword);
router.get('/me', auth, c.me);

module.exports = router;
