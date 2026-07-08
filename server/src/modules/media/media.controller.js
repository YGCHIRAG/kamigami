const mediaService = require('./media.service');
const asyncHandler = require('../../common/middleware/asyncHandler');
const AppError = require('../../common/errors/AppError');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('./media.utils');
const { compressVideo } = require('./media.compress');
const path = require('path');
const fs = require('fs');

exports.uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No video file uploaded', 400);
  }

  const uploadedBy = req.user ? req.user.id : null;
  const folder = req.body.folder || 'videos';
  const altText = req.body.altText || null;

  try {
    // Save metadata returned by multer-s3 (since upload is handled in middleware)
    const fileData = {
      key: req.file.key,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype || 'video/mp4',
      size: req.file.size,
      folder,
      altText
    };

    const savedMedia = await mediaService.saveMedia(fileData, uploadedBy);

    res.status(201).json({
      status: 'success',
      data: [savedMedia]
    });

  } catch (error) {
    console.error('❌ Video upload error:', error);
    throw new AppError(error.message || 'Video upload failed', 500);
  }
});

exports.uploadMedia = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const uploadedBy = req.user ? req.user.id : null;
  const folder = req.body.folder || 'misc';
  const altText = req.body.altText || null;

  const savedMedia = [];
  for (const file of req.files) {
    const fileData = {
      ...file,
      folder,
      altText
    };
    const result = await mediaService.saveMedia(fileData, uploadedBy);
    savedMedia.push(result);
  }

  res.status(201).json({
    status: 'success',
    data: savedMedia
  });
});

exports.getAllMedia = asyncHandler(async (req, res) => {
  const filters = {
    type: req.query.type,
    folder: req.query.folder,
    search: req.query.search
  };
  const pagination = {
    page: req.query.page || 1,
    limit: req.query.limit || 20
  };

  const result = await mediaService.getAllMedia(filters, pagination);
  
  res.status(200).json({
    status: 'success',
    data: result.data,
    meta: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    }
  });
});

exports.getMediaById = asyncHandler(async (req, res) => {
  const media = await mediaService.getMediaById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: media
  });
});

exports.updateMedia = asyncHandler(async (req, res) => {
  const { originalName, altText } = req.body;
  const updatedMedia = await mediaService.updateMedia(req.params.id, { originalName, altText });
  res.status(200).json({
    status: 'success',
    data: updatedMedia
  });
});

exports.deleteMedia = asyncHandler(async (req, res) => {
  await mediaService.deleteMedia(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Media deleted successfully'
  });
});
