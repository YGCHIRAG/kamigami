const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');
const cache = require('../../common/utils/cache');
const { getSignedUrl } = require('../media/media.utils');

exports.createProduct = async (productData) => {
  const { name, slug, description, basePrice, categoryId, variants, mediaIds, isDrop, status } = productData;

  const existingProduct = await prisma.product.findUnique({ where: { slug } });
  if (existingProduct) throw new AppError('Product slug already exists', 409);

  const product = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name,
        slug,
        description,
        basePrice,
        categoryId,
        isDrop: isDrop || false,
        status: status || 'PUBLISHED',
        variants: {
          create: variants.map(v => ({
            sku: v.sku,
            attributes: v.attributes,
            price: v.price || basePrice,
            inventory: { create: { stockTotal: v.initialStock || 0, stockAvailable: v.initialStock || 0, stockReserved: 0 } }
          }))
        }
      },
      include: { variants: true }
    });
    if (mediaIds && mediaIds.length > 0) {
      await tx.productMedia.createMany({
        data: mediaIds.map((mediaId, index) => ({
          productId: newProduct.id,
          mediaId,
          position: index
        }))
      });
    }
    return newProduct;
  });

  // Invalidate Cache
  await cache.deleteByPattern('products:list:*');

  return product;
};

exports.updateProduct = async (productId, updateData) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      name: updateData.name,
      slug: updateData.slug,
      description: updateData.description,
      basePrice: updateData.basePrice,
      categoryId: updateData.categoryId,
      isDrop: updateData.isDrop,
      status: updateData.status,
      deletedAt: updateData.deletedAt
    },
    include: { variants: true }
  });

  if (updateData.mediaIds !== undefined) {
    await prisma.productMedia.deleteMany({ where: { productId } });
    if (updateData.mediaIds.length > 0) {
      await prisma.productMedia.createMany({
        data: updateData.mediaIds.map((mediaId, index) => ({
          productId,
          mediaId,
          position: index
        }))
      });
    }
  }

  // Invalidate Cache
  await cache.deleteCache(`product:${updated.slug}`);
  await cache.deleteByPattern('products:list:*');

  return updated;
};

exports.listProducts = async (filters) => {
  const { page = 1, limit = 10, category = 'all', search, sort, status = 'all', showDeleted = 'false' } = filters;

  const cacheKey = `products:list:${page}:${limit}:${category}:${sort || 'default'}:${status}:${showDeleted}`;
  if (!search) {
    const cached = await cache.getCache(cacheKey);
    if (cached) return cached;
  }

  const skip = (page - 1) * limit;
  const where = {};

  // Handle Deleted Filter
  if (showDeleted === 'true') {
    where.deletedAt = { not: null };
  } else {
    where.deletedAt = null;
  }

  if (category !== 'all') where.categoryId = category;

  if (status !== 'all') {
    where.status = status;
  } else if (!filters.isAdmin) {
    where.status = 'PUBLISHED';
    where.isDrop = false;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } }
    ];
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
  if (sort === 'price_desc') orderBy = { basePrice: 'desc' };
  if (sort === 'newest') orderBy = { createdAt: 'desc' };
  if (sort === 'oldest') orderBy = { createdAt: 'asc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip: parseInt(skip), take: parseInt(limit), orderBy,
      include: {
        category: { select: { name: true } },
        _count: { select: { variants: true } },
        variants: (filters.includeVariants || filters.isAdmin) ? {
          include: { inventory: true }
        } : false,
        media: { include: { media: true } }
      }
    }),
    prisma.product.count({ where })
  ]);

  // Resign S3 URLs dynamically for all products
  const productsWithSignedUrls = await Promise.all(
    products.map(async (p) => {
      if (p.media && p.media.length > 0) {
        p.media = await Promise.all(
          p.media.map(async (pm) => {
            if (pm.media) {
              pm.media.url = await getSignedUrl(pm.media.storageKey);
            }
            return pm;
          })
        );
      }
      return p;
    })
  );

  const result = {
    products: productsWithSignedUrls,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
  };

  // Cache store
  if (!search) {
    await cache.setCache(cacheKey, result, 600); // 10 mins
  }

  return result;
};

exports.getProductBySlug = async (slugOrId) => {
  const cacheKey = `product:${slugOrId}`;
  const cached = await cache.getCache(cacheKey);
  if (cached) return cached;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

  const product = await prisma.product.findUnique({
    where: isUuid ? { id: slugOrId } : { slug: slugOrId },
    include: {
      variants: { include: { inventory: { select: { stockAvailable: true } } } },
      category: { select: { name: true, slug: true } },
      media: { include: { media: true } }
    }
  });

  if (!product || product.isDrop || product.status !== 'PUBLISHED' || product.deletedAt) {
    throw new AppError('Product not found', 404);
  }

  // Resign S3 URLs dynamically
  if (product.media && product.media.length > 0) {
    product.media = await Promise.all(
      product.media.map(async (pm) => {
        if (pm.media) {
          pm.media.url = await getSignedUrl(pm.media.storageKey);
        }
        return pm;
      })
    );
  }

  const totalStockAvailable = product.variants.reduce((sum, v) => sum + (v.inventory?.stockAvailable || 0), 0);
  const result = { ...product, totalStockAvailable };

  await cache.setCache(cacheKey, result, 900); // 15 mins
  return result;
};
