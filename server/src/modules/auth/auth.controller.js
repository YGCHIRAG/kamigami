const authService = require('./auth.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const result = await authService.googleLogin(idToken);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.userId);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});
