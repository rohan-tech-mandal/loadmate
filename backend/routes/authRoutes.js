import express from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  getUserProfile,
  googleAuthSuccess,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Regular auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login',
      session: false,
    }),
    googleAuthSuccess
  );
} else {
  // Fallback routes when Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      message: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({ 
      message: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  });
}

export default router;