const prisma = require('../../db/prisma');
const authUtils = require('./auth.utils');

exports.ensureAdmin = async () => {
  const email = 'superadmin@kamigami.com';
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!password) {
    console.warn('[Init] [Warning] DEFAULT_ADMIN_PASSWORD environment variable is not set! Using default fallback.');
  }
  const adminPassword = password || 'adminSecurepassword@2026!';
  
  try {
    let admin = await prisma.user.findFirst({
      where: { 
        role: { in: ['ADMIN', 'SUPERADMIN'] }
      }
    });

    if (!admin) {
      console.log('[Init] No admin found, creating default admin...');
      const hashedPassword = await authUtils.hashPassword(adminPassword);
      admin = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName: 'System',
          lastName: 'Admin',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      console.log('[Init] Admin created with ID:', admin.id);
    } else {
      console.log('[Init] Admin already exists:', admin.email);
    }
  } catch (error) {
    console.error('[Init] Failed to ensure admin:', error.message);
    // We don't want to crash the server if DB is not ready yet, 
    // but in this case, it's better to log it.
  }
};
