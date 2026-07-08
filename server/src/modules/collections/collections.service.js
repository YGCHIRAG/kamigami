const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');

const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

const generateUniqueSlug = async (modelName, text, currentId = null) => {
  let slug = generateSlug(text);
  if (!slug) {
    slug = 'item-' + Math.random().toString(36).substring(2, 6);
  }

  // Try to find if slug exists
  const where = { slug };
  if (currentId) {
    where.id = { not: currentId };
  }

  const existing = await prisma[modelName].findFirst({ where });
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  }
  return slug;
};

// 1. ADMIN SERVICES
exports.createCollection = async (adminId, collectionData) => {
  const { name, slug: inputSlug, description, sortOrder, metadata, mediaIds } = collectionData;

  const slug = await generateUniqueSlug('collection', inputSlug || name);

  const collection = await prisma.collection.create({
    data: {
      name,
      slug,
      description,
      sortOrder: sortOrder || 0,
      metadata: metadata || {}
    }
  });

  if (mediaIds && mediaIds.length > 0) {
    await prisma.collectionMedia.createMany({
      data: mediaIds.map((mediaId, index) => ({
        collectionId: collection.id,
        mediaId,
        position: index
      }))
    });
  }

  return collection;
};

exports.updateCollection = async (adminId, collectionId, updateData) => {
  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection) throw new AppError('Collection not found', 404);
  if (collection.deletedAt) throw new AppError('Cannot update a deleted collection', 400);

  if (updateData.name || updateData.slug) {
    const slug = await generateUniqueSlug('collection', updateData.slug || updateData.name || collection.name, collectionId);
    updateData.slug = slug;
  }

  return await prisma.collection.update({
    where: { id: collectionId },
    data: updateData
  });
};

exports.deleteCollection = async (adminId, collectionId) => {
  const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
  if (!collection) throw new AppError('Collection not found', 404);

  return await prisma.collection.update({
    where: { id: collectionId },
    data: {
      deletedAt: new Date(),
      isActive: false
    }
  });
};

exports.addProductsToCollection = async (collectionId, productIds) => {
  return await prisma.$transaction(async (tx) => {
    const collection = await tx.collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.deletedAt) throw new AppError('Collection not found', 404);

    const data = productIds.map(productId => ({
      collectionId,
      productId
    }));

    // createMany with skipDuplicates handles the unique constraint
    return await tx.collectionProduct.createMany({
      data,
      skipDuplicates: true
    });
  });
};

exports.reorderProducts = async (collectionId, items) => {
  return await prisma.$transaction(async (tx) => {
    const updates = items.map(item =>
      tx.collectionProduct.update({
        where: {
          collectionId_productId: {
            collectionId,
            productId: item.productId
          }
        },
        data: { position: item.position }
      })
    );
    return await Promise.all(updates);
  });
};

exports.removeProductFromCollection = async (collectionId, productId) => {
  return await prisma.collectionProduct.delete({
    where: {
      collectionId_productId: {
        collectionId,
        productId
      }
    }
  });
};

// 2. PUBLIC SERVICES
exports.listCollections = async (filters) => {
  const { page = 1, limit = 10, isAdmin = false } = filters;
  const skip = (page - 1) * limit;

  const where = isAdmin ? { deletedAt: null } : { isActive: true, deletedAt: null };

  const [collections, total] = await Promise.all([
    prisma.collection.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        isActive: true,
        media: {
          include: { media: true }
        }
      }
    }),
    prisma.collection.count({ where })
  ]);

  return { collections, total, page, totalPages: Math.ceil(total / limit) };
};

exports.getCollectionBySlug = async (slug, productFilters) => {
  const { page = 1, limit = 20 } = productFilters;
  const skip = (page - 1) * limit;

  const collection = await prisma.collection.findUnique({
    where: { slug, isActive: true, deletedAt: null },
    include: {
      media: {
        include: { media: true }
      },
      products: {
        orderBy: { position: 'asc' },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              media: { include: { media: true } },
              variants: {
                select: {
                  id: true,
                  sku: true,
                  attributes: true,
                  price: true
                }
              }
            }
          }
        }
      },
      _count: {
        select: { products: true }
      }
    }
  });

  if (!collection) throw new AppError('Collection not found', 404);

  // Flatten the response
  const products = collection.products.map(cp => cp.product);

  return {
    ...collection,
    products,
    pagination: {
      total: collection._count.products,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(collection._count.products / limit)
    }
  };
};
