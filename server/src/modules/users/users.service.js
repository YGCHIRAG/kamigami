const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');

exports.getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  delete user.passwordHash;
  return user;
};

exports.updateProfile = async (userId, updateData) => {
  const { firstName, lastName, phoneNumber } = updateData;

  // Mass assignment prevention: only allow specific fields
  const data = {};
  if (firstName) data.firstName = firstName;
  if (lastName) data.lastName = lastName;
  if (phoneNumber) {
    // Check phone uniqueness
    const existing = await prisma.user.findFirst({
      where: {
        phoneNumber,
        id: { not: userId },
      },
    });
    if (existing) {
      throw new AppError('Phone number already in use', 400);
    }
    data.phoneNumber = phoneNumber;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  delete user.passwordHash;
  return user;
};

exports.getAddresses = async (userId) => {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

exports.addAddress = async (userId, addressData) => {
  const { isDefault, type } = addressData;

  return await prisma.$transaction(async (tx) => {
    // If setting as default, unset previous default of same type
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId, type, isDefault: true },
        data: { isDefault: false },
      });
    }

    return await tx.address.create({
      data: {
        ...addressData,
        userId,
      },
    });
  });
};

exports.updateAddress = async (userId, addressId, addressData) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address || address.userId !== userId) {
    throw new AppError('Address not found or unauthorized', 404);
  }

  const { isDefault, type } = addressData;

  return await prisma.$transaction(async (tx) => {
    // If setting as default, unset previous default of same type
    if (isDefault) {
      // Use the provided type or existing type
      const targetType = type || address.type;
      await tx.address.updateMany({
        where: { userId, type: targetType, isDefault: true },
        data: { isDefault: false },
      });
    }

    return await tx.address.update({
      where: { id: addressId },
      data: addressData,
    });
  });
};

exports.deleteAddress = async (userId, addressId) => {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address || address.userId !== userId) {
    throw new AppError('Address not found or unauthorized', 404);
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  return { success: true };
};
