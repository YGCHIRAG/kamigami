const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');
const { getSignedUrl } = require('../media/media.utils');

// Helper to check if a URL is an S3 URL and extract its storage key
function getS3KeyFromUrl(urlString) {
  if (typeof urlString !== 'string' || !urlString.startsWith('http')) return null;
  try {
    const url = new URL(urlString);
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'kamigami-images';
    if (url.hostname.includes(bucketName) || url.hostname.includes('s3.amazonaws.com')) {
      const key = decodeURIComponent(url.pathname.substring(1));
      return key;
    }
  } catch (e) {
    // Ignore invalid URLs
  }
  return null;
}

// Clean S3 URLs by stripping query parameters before saving to DB
function cleanS3Urls(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    const key = getS3KeyFromUrl(obj);
    if (key) {
      const bucketName = process.env.AWS_S3_BUCKET_NAME || 'kamigami-images';
      const region = process.env.AWS_REGION || 'ap-southeast-2';
      return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanS3Urls);
  }
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [k, v] of Object.entries(obj)) {
      cleaned[k] = cleanS3Urls(v);
    }
    return cleaned;
  }
  return obj;
}

// Dynamically generate signed URLs for S3 URLs when serving settings to client
async function signS3Urls(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    const key = getS3KeyFromUrl(obj);
    if (key) {
      try {
        const signed = await getSignedUrl(key);
        return signed;
      } catch (err) {
        console.error('Failed to sign S3 URL for key:', key, err);
        return obj;
      }
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(signS3Urls));
  }
  if (typeof obj === 'object') {
    const signed = {};
    for (const [k, v] of Object.entries(obj)) {
      signed[k] = await signS3Urls(v);
    }
    return signed;
  }
  return obj;
}

exports.getSetting = async (key) => {
  const setting = await prisma.siteSetting.findUnique({
    where: { key }
  });
  if (!setting) return null;
  
  // Dynamically sign all stored S3 URLs on the fly
  return signS3Urls(setting.value);
};

exports.saveSetting = async (key, value) => {
  if (!key) throw new AppError('Setting key is required', 400);
  
  // Clean all S3 URLs to remove query signatures before saving to DB
  const cleanedValue = cleanS3Urls(value);
  
  const setting = await prisma.siteSetting.upsert({
    where: { key },
    update: { value: cleanedValue },
    create: { key, value: cleanedValue }
  });
  
  return signS3Urls(setting.value);
};
