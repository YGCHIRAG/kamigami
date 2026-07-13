const express = require('express');

const authRoutes = require('./auth/auth.routes');
const userRoutes = require('./users/users.routes');
const productRoutes = require('./products/products.routes');
const dropRoutes = require('./drops/drops.routes');
const cartRoutes = require('./cart/cart.routes');
const inventoryRoutes = require('./inventory/inventory.routes');
const orderRoutes = require('./orders/orders.routes');
const logisticsRoutes = require('./logistics/logistics.routes');
const adminRoutes = require('./admin/admin.routes');
const collectionRoutes = require('./collections/collections.routes');
const reservationRoutes = require('./reservation/reservation.routes');
const stripeWebhookRoutes = require('./webhooks/payment.routes');
const paymentRoutes = require('./payments/payment.routes');
const mediaRoutes = require('./media/media.routes');
const settingsRoutes = require('./settings/settings.routes');
const faqsRoutes = require('./faqs/faqs.routes');
const blogsRoutes = require('./blogs/blogs.routes');
const returnsRoutes = require('./returns/returns.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/', collectionRoutes); // Handles both /collections and /admin/collections
router.use('/drops', dropRoutes);
router.use('/drops', reservationRoutes); // This will handle /drops/:dropId/reserve
router.use('/cart', cartRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/', orderRoutes); // Handles /checkout/intent and /orders/*
router.use('/logistics', logisticsRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/media', mediaRoutes);
router.use('/settings', settingsRoutes);
router.use('/webhooks', stripeWebhookRoutes);
router.use('/payments', paymentRoutes);
router.use('/faqs', faqsRoutes);
router.use('/blogs', blogsRoutes);
router.use('/returns', returnsRoutes);

module.exports = router;
