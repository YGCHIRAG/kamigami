const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');
const cache = require('../../common/utils/cache');
const dropsCache = require('./drops.cache'); // Kept for real-time stock logic
const { getSignedUrl } = require('../media/media.utils');

exports.createDrop = async (dropData) => {
  const { title, slug, description, startTime, endTime } = dropData;
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError('Invalid start or end date format', 400);
  }

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

  // Sign S3 URLs dynamically for drop list media
  const dropsWithSignedUrls = await Promise.all(
    formattedDrops.map(async (d) => {
      if (d.media && d.media.length > 0) {
        d.media = await Promise.all(
          d.media.map(async (dm) => {
            if (dm.media) {
              dm.media.url = await getSignedUrl(dm.media.storageKey);
            }
            return dm;
          })
        );
      }
      return d;
    })
  );

  await cache.setCache(cacheKey, dropsWithSignedUrls, 60);
  return dropsWithSignedUrls;
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

    // Sign S3 URLs dynamically for drop products media
    for (const dp of drop.dropProducts) {
      if (dp.product && dp.product.media && dp.product.media.length > 0) {
        dp.product.media = await Promise.all(
          dp.product.media.map(async (pm) => {
            if (pm.media) {
              pm.media.url = await getSignedUrl(pm.media.storageKey);
            }
            return pm;
          })
        );
      }
    }

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
