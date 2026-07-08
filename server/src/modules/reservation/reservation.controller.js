const reservationService = require('./reservation.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

exports.reserveStock = asyncHandler(async (req, res) => {
  const { dropId } = req.params;
  const { variantId } = req.body;
  const userId = req.user.userId;

  if (!variantId) {
    return res.status(400).json({
      status: 'error',
      message: 'variantId is required'
    });
  }

  const result = await reservationService.reserveStock(dropId, variantId, userId);

  res.status(200).json({
    status: 'success',
    data: result
  });
});
