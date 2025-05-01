const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

// Signup route
router.post('/signup', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value) => {
      return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject('E-Mail address already exists!');
        }
        return true; // Important to return true when validation passes
      });
    })
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long.'),
  body('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Name field cannot be empty.')
], authController.signup);

// Login route
router.post('/login', authController.login);

module.exports = router;