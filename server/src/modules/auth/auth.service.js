const prisma = require('../../db/prisma');
const authUtils = require('./auth.utils');
const AppError = require('../../common/errors/AppError');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (userData) => {
  const { email, password, firstName, lastName } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const hashedPassword = await authUtils.hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      role: 'CUSTOMER',
    },
  });

  const accessToken = authUtils.generateAccessToken(user);
  const refreshToken = authUtils.generateRefreshToken(user);

  delete user.passwordHash;
  return { user, accessToken, refreshToken };
};

exports.login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await authUtils.comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(`Account is ${user.status.toLowerCase()}`, 403);
  }

  const accessToken = authUtils.generateAccessToken(user);
  const refreshToken = authUtils.generateRefreshToken(user);

  delete user.passwordHash;
  return { user, accessToken, refreshToken };
};

exports.refreshToken = async (token) => {
  try {
    const decoded = authUtils.verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('User not found or inactive', 401);
    }

    const accessToken = authUtils.generateAccessToken(user);
    const newRefreshToken = authUtils.generateRefreshToken(user);

    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

exports.googleLogin = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name,
          lastName: family_name,
          passwordHash: '', // No password for OAuth users
          metadata: { provider: 'google', picture },
          role: 'CUSTOMER',
        },
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(`Account is ${user.status.toLowerCase()}`, 403);
    }

    const accessToken = authUtils.generateAccessToken(user);
    const refreshToken = authUtils.generateRefreshToken(user);

    delete user.passwordHash;
    return { user, accessToken, refreshToken };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Google authentication failed', 401);
  }
};

exports.getMe = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  delete user.passwordHash;
  return user;
};
