const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');

exports.getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });
  }

  return cart;
};

exports.addItem = async (userId, variantId, quantity) => {
  // 1. Validate variant and drop status
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: {
      product: true,
      inventory: true
    }
  });

  if (!variant) throw new AppError('Product variant not found', 404);
  if (variant.product.isDrop) throw new AppError('Drop products cannot be added to cart. Use reservation.', 400);

  // 2. Check stock
  if (variant.inventory.stockAvailable < quantity) {
    throw new AppError('Insufficient stock available', 409);
  }

  const cart = await this.getOrCreateCart(userId);

  // 3. Upsert item
  const existingItem = cart.items.find(item => item.variantId === variantId);

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (variant.inventory.stockAvailable < newQuantity) {
      throw new AppError('Insufficient stock for total requested quantity', 409);
    }

    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity }
    });
  }

  return await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      variantId,
      quantity
    }
  });
};

exports.updateItem = async (userId, itemId, quantity) => {
  if (quantity < 0) throw new AppError('Quantity cannot be negative', 400);

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      variant: {
        include: { inventory: true }
      }
    }
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new AppError('Cart item not found', 404);
  }

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return null;
  }

  // Check stock
  if (cartItem.variant.inventory.stockAvailable < quantity) {
    throw new AppError('Insufficient stock available', 409);
  }

  return await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity }
  });
};

exports.removeItem = async (userId, itemId) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true }
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new AppError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return { success: true };
};

exports.getCart = async (userId) => {
  const cart = await this.getOrCreateCart(userId);

  let totalAmount = 0;
  const items = cart.items.map(item => {
    const price = parseFloat(item.variant.price || item.variant.product.basePrice);
    const subtotal = price * item.quantity;
    totalAmount += subtotal;

    return {
      itemId: item.id,
      variantId: item.variantId,
      name: item.variant.product.name,
      attributes: item.variant.attributes,
      price,
      quantity: item.quantity,
      subtotal
    };
  });

  return {
    id: cart.id,
    items,
    totalAmount
  };
};
