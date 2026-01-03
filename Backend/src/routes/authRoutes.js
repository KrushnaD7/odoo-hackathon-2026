const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { signupValidator, signinValidator } = require('../utils/validators');

// Public routes
router.post('/signup', signupValidator, authController.signup);
router.post('/signin', signinValidator, authController.signin);
router.post('/verify-email', authController.verifyEmail);

// Protected routes
router.get('/me', authenticate, authController.getMe);

module.exports = router;

