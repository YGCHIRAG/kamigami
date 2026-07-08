const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');
const cache = require('../../common/utils/cache');
const dropsCache = require('./drops.cache'); // Kept for real-time stock logic

exports.createDrop = async (dropData) => {
  const { title, slug, description, startTime, endTime } = dropData;
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) throw new AppError('Start time must be before end time', 400);

  const existing = await prisma.drop.findUnique({ where: { slug } });
  if (existing) throw new AppError('Drop slug already exists', 409);

  const drop = await prisma.drop.create({
    data: {
      title,
      slug,
      description,
      startTime: start,
      endTime: end,
      status: 'SCHEDULED'
    }
  });

  await cache.deleteByPattern('drops:list:*');
  return drop;
};

exports.attachProducts = async (dropId, productAllocations) => {
  const drop = await prisma.drop.findUnique({ where: { id: dropId } });
  if (!drop) throw new AppError('Drop not found', 404);

  const result = await prisma.$transaction(async (tx) => {
    const productIds = productAllocations.map(p => p.productId);
    await tx.dropProduct.deleteMany({ where: { dropId, productId: { in: productIds } } });
    const created = await tx.dropProduct.createMany({
      data: productAllocations.map(p => ({
        dropId,
        productId: p.productId,
        variantAllocations: p.variantAllocations || {}
      }))
    });
    return created;
  });

  await cache.deleteCache(`drop:${drop.slug}`);
  await cache.deleteByPattern('drops:list:*');
  return result;
};

exports.attachCollection = async (dropId, collectionId, defaultStock = 100) => {
  const drop = await prisma.drop.findUnique({ where: { id: dropId } });
  if (!drop) throw new AppError('Drop not found', 404);

  const collectionProducts = await prisma.collectionProduct.findMany({
    where: { collectionId },
    select: { productId: true }
  });

  if (collectionProducts.length === 0) throw new AppError('Collection is empty', 400);

  const allocations = collectionProducts.map(cp => ({
    productId: cp.productId,
    variantAllocations: {}
  }));

  return await exports.attachProducts(dropId, allocations);
};

exports.listDrops = async (statusFilter) => {
  const cacheKey = `drops:list:${statusFilter || 'all'}`;
  const cached = await cache.getCache(cacheKey);
  if (cached) return cached;

  const where = {};
  if (statusFilter === 'active') where.status = 'ACTIVE';
  else if (statusFilter === 'upcoming') where.status = 'SCHEDULED';
  else if (statusFilter === 'ended') where.status = 'ENDED';

  const drops = await prisma.drop.findMany({
    where,
    orderBy: { startTime: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      startTime: true,
      endTime: true,
      status: true,
      media: { include: { media: true } },
      _count: {
        select: { dropProducts: true }
      }
    }
  });

  // Map _count to dropProducts for frontend compatibility if needed
  const formattedDrops = drops.map(d => ({
    ...d,
    dropProducts: new Array(d._count.dropProducts).fill({}) // Mock array for length check
  }));

  await cache.setCache(cacheKey, formattedDrops, 60);
  return formattedDrops;
};

exports.getDropBySlug = async (slug) => {
  const cacheKey = `drop:${slug}`;

  // Try metadata cache
  const cached = await cache.getCache(cacheKey);
  let drop = cached;

  if (!drop) {
    drop = await prisma.drop.findUnique({
      where: { slug },
      include: {
        dropProducts: { 
          include: { 
            product: { 
              include: { 
                media: { include: { media: true } },
                variants: { include: { inventory: true } } 
              } 
            } 
          } 
        }
      }
    });

    if (!drop) throw new AppError('Drop not found', 404);

    // Only cache metadata if not active (active drops have real-time stock that shouldn't be stale)
    if (drop.status !== 'ACTIVE') {
      await cache.setCache(cacheKey, drop, 120); // 2 mins
    }
  }

  // If drop is active, enrich with Real-time Redis stock (Always fresh)
  if (drop.status === 'ACTIVE') {
    for (const dp of drop.dropProducts) {
      for (const variant of dp.product.variants) {
        const stock = await dropsCache.getVariantStock(drop.id, variant.id);
        variant.currentDropStock = stock !== null ? stock : 0;
      }
    }
  }

  return drop;
};

// Activation/Deactivation methods also need to invalidate
exports.activateDrop = async (dropId) => {
  const drop = await prisma.drop.findUnique({
    where: { id: dropId },
    include: { dropProducts: { include: { product: { include: { variants: true } } } } }
  });

  if (!drop || drop.status !== 'SCHEDULED') return;

  await prisma.drop.update({ where: { id: dropId }, data: { status: 'ACTIVE' } });

  await dropsCache.loadDropStock(dropId, drop.dropProducts);
  await cache.deleteCache(`drop:${drop.slug}`);
  await cache.deleteByPattern('drops:list:*');
};

exports.endDrop = async (dropId) => {
  const drop = await prisma.drop.findUnique({ where: { id: dropId } });
  if (!drop || drop.status !== 'ACTIVE') return;

  await prisma.drop.update({ where: { id: dropId }, data: { status: 'ENDED' } });

  await dropsCache.clearDropStock(dropId);
  await cache.deleteCache(`drop:${drop.slug}`);
  await cache.deleteByPattern('drops:list:*');
};
