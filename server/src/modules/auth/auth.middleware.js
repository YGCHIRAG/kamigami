const authUtils = require('./auth.utils');
const AppError = require('../../common/errors/AppError');
const asyncHandler = require('../../common/middleware/asyncHandler');

exports.verifyJWT = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('You are not logged in. Please log in to get access.', 401);
  }

  try {
    const decoded = authUtils.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    throw new AppError('Invalid or expired token. Please log in again.', 401);
  }
});

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};
