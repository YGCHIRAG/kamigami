const express = require('express');
const router = express.Router();
const mediaController = require('./media.controller');
const { upload, uploadVideoDirect } = require('./media.utils');
const { verifyJWT, requireAdmin } = require('../auth/auth.middleware');

// Routes mapping for Admin Media API
// GET    /api/v1/admin/media
// POST   /api/v1/admin/media/upload
// DELETE /api/v1/admin/media/:id
// GET    /api/v1/admin/media/:id

// Admin Media APIs (assuming this router is mounted at /api/v1/admin/media)
router.use(verifyJWT, requireAdmin);

router.post('/upload', upload.array('files', 20), mediaController.uploadMedia);
router.post('/upload/video', uploadVideoDirect.single('file'), mediaController.uploadVideo);
router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMediaById);
router.put('/:id', mediaController.updateMedia);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;
