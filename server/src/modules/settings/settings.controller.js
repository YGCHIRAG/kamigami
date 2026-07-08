const settingsService = require('./settings.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

exports.getSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const value = await settingsService.getSetting(key);
  
  return res.status(200).json({
    status: 'success',
    data: {
      key,
      value
    }
  });
});

exports.saveSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  
  const savedValue = await settingsService.saveSetting(key, value);
  
  return res.status(200).json({
    status: 'success',
    data: {
      key,
      value: savedValue
    }
  });
});
