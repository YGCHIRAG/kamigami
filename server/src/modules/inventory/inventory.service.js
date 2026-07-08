const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');
const { redisClient } = require('../../db/redis');

// Helper to sync Redis if variant is in an active drop
async function syncRedisIfActiveDrop(tx, variantId, newStockAvailable) {
  if (!redisClient.isOpen) return;

  const activeDrop = await tx.drop.findFirst({
    where: {
      status: 'ACTIVE',
      dropProducts: {
        some: {
          product: {
            variants: {
              some: { id: variantId }
            }
          }
        }
      }
    },
    select: { id: true }
  });

  if (activeDrop) {
    const redisKey = `drop:${activeDrop.id}:variant:${variantId}:stock`;
    await redisClient.set(redisKey, newStockAvailable.toString());
  }
}

exports.updateStock = async (updateData, adminId) => {
  const { variantId, changeAmount, reason, referenceId } = updateData;

  return await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: { variantId }
    });

    if (!inventory) {
      throw new AppError('Inventory record not found', 404);
    }

    const newTotal = inventory.stockTotal + changeAmount;
    const newAvailable = inventory.stockAvailable + changeAmount;

    if (newTotal < 0 || newAvailable < 0) {
      throw new AppError('Insufficient stock for this operation', 400);
    }

    const updated = await tx.inventory.update({
      where: { variantId },
      data: {
        stockTotal: newTotal,
        stockAvailable: newAvailable
      }
    });

    // Logging
    await tx.inventoryLog.create({
      data: {
        variantId,
        changeAmount,
        reason,
        referenceId,
        performedBy: adminId
      }
    });

    // Sync Redis
    await syncRedisIfActiveDrop(tx, variantId, newAvailable);

    // Invalidate product list cache
    try {
      const cache = require('../../common/utils/cache');
      await cache.deleteByPattern('products:list:*');
    } catch (err) {
      console.warn('[InventoryService] Cache invalidation failed:', err.message);
    }

    return updated;
  });
};

exports.setAbsoluteStock = async (setData, adminId) => {
  const { variantId, stockTotal } = setData;

  if (stockTotal < 0) throw new AppError('Total stock cannot be negative', 400);

  return await prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({
      where: { variantId }
    });

    if (!inventory) throw new AppError('Inventory record not found', 404);

    const newAvailable = stockTotal - inventory.stockReserved;
    if (newAvailable < 0) {
      throw new AppError('Total stock cannot be less than reserved stock', 400);
    }

    const changeAmount = stockTotal - inventory.stockTotal;

    const updated = await tx.inventory.update({
      where: { variantId },
      data: {
        stockTotal,
        stockAvailable: newAvailable
      }
    });

    // Logging
    await tx.inventoryLog.create({
      data: {
        variantId,
        changeAmount,
        reason: 'MANUAL_SET',
        performedBy: adminId
      }
    });

    // Sync Redis
    await syncRedisIfActiveDrop(tx, variantId, newAvailable);

    // Invalidate product list cache
    try {
      const cache = require('../../common/utils/cache');
      await cache.deleteByPattern('products:list:*');
    } catch (err) {
      console.warn('[InventoryService] Cache invalidation failed:', err.message);
    }

    return updated;
  });
};

exports.getInventory = async (variantId) => {
  const inventory = await prisma.inventory.findUnique({
    where: { variantId }
  });

  if (!inventory) throw new AppError('Inventory record not found', 404);

  return {
    ...inventory,
    isLowStock: inventory.stockAvailable <= (inventory.lowStockThreshold || 5)
  };
};

exports.getAvailableStock = async (variantId) => {
  const inventory = await prisma.inventory.findUnique({
    where: { variantId },
    select: { stockAvailable: true }
  });

  if (!inventory) throw new AppError('Variant not found', 404);

  return inventory.stockAvailable;
};
