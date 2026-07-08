const usersService = require('./users.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

exports.getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getProfile(req.user.userId);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await usersService.updateProfile(req.user.userId, req.body);
  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.getAddresses = asyncHandler(async (req, res) => {
  const addresses = await usersService.getAddresses(req.user.userId);
  res.status(200).json({
    status: 'success',
    data: { addresses },
  });
});

exports.addAddress = asyncHandler(async (req, res) => {
  const address = await usersService.addAddress(req.user.userId, req.body);
  res.status(201).json({
    status: 'success',
    data: { address },
  });
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const address = await usersService.updateAddress(req.user.userId, req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: { address },
  });
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  await usersService.deleteAddress(req.user.userId, req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
