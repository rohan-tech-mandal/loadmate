import asyncHandler from 'express-async-handler';

/**
 * Middleware to check if user is admin
 * Must be used after protect middleware
 */
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});

/**
 * Middleware to check if user is vehicle owner
 */
const owner = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as vehicle owner');
  }
});

export { admin, owner };