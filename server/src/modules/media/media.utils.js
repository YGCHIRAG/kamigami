const { S3Client, DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    // Support both legacy lowercase keys and standard uppercase keys
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.awsaccesskey || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.awssecretkey || 'dummy',
  },
});

// Helper to build a signed URL for a stored object (5‑minute expiry)
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getS3SignedUrl } = require('@aws-sdk/s3-request-presigner');

function getSignedUrl(storageKey) {
  const bucket = process.env.AWS_S3_BUCKET_NAME || 'kamigami-media';
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: storageKey
  });
  // Expires in 7200 seconds (2 hours) to outlive Redis cache TTL
  return getS3SignedUrl(s3Client, command, { expiresIn: 7200 });
}

// Legacy public URL helper (kept for backward compatibility, but not used for gallery)
function getPublicUrl(storageKey) {
  const bucket = process.env.AWS_S3_BUCKET_NAME || 'kamigami-media';
  const baseUrl = process.env.AWS_S3_PUBLIC_URL || `https://${bucket}.s3.amazonaws.com`;
  return `${baseUrl}/${storageKey}`;
}

const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit for images
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME || 'kamigami-media',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      // Generate a unique filename
      const folder = req.body.folder || 'misc';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const filename = crypto.randomBytes(16).toString('hex') + ext;
      const fullPath = `${folder}/${uniqueSuffix}-${filename}`;
      
      cb(null, fullPath);
    }
  }),
  fileFilter: (req, file, cb) => {
    // For general endpoint, keep image-only uploads or general validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed on this endpoint. For videos, use the video endpoint.'));
    }
  }
});

// Configure video upload directly to S3 memory buffer with a 10MB limit (no disk compression)
const uploadVideoDirect = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit for videos
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME || 'kamigami-media',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const folder = req.body.folder || 'videos';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const filename = crypto.randomBytes(16).toString('hex') + ext;
      const fullPath = `${folder}/${uniqueSuffix}-${filename}`;
      
      cb(null, fullPath);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed on this endpoint.'));
    }
  }
});

const deleteFromS3 = async (storageKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'kamigami-media',
      Key: storageKey,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
};

const deleteMultipleFromS3 = async (storageKeys) => {
  if (!storageKeys || storageKeys.length === 0) return;
  try {
    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'kamigami-media',
      Delete: {
        Objects: storageKeys.map(key => ({ Key: key })),
        Quiet: false,
      }
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting multiple files from S3:', error);
    throw new Error('Failed to delete files from S3');
  }
};

module.exports = {
  upload,
  uploadVideoDirect,
  deleteFromS3,
  deleteMultipleFromS3,
  s3Client,
  getPublicUrl,
  getSignedUrl
};
