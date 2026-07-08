require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@kamigami.com';
  const password = 'adminSecurepassword@2026!';
  
  let admin = await prisma.user.findFirst({
    where: { 
      role: { in: ['ADMIN', 'SUPERADMIN'] }
    }
  }); 

  if (!admin) {
    console.log('No admin found, creating one...');
    const hashedPassword = await bcrypt.hash(password, 10);
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
    console.log('Admin created with ID:', admin.id);
  } else {
    console.log('Found existing admin:', admin.email, 'ID:', admin.id);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
