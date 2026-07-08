const prisma = require('../../db/prisma');
const shiprocket = require('./logistics.provider');
const AppError = require('../../common/errors/AppError');

exports.createShipment = async (adminId, orderId) => {
  console.log(`[Logistics Service] 🚀 Step 1: Starting shipment generation for Order ID: ${orderId}`);

  // 1. Fetch Order with Items and Address
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true }
  });

  if (!order) {
    console.error(`[Logistics Service] ❌ Order not found: ${orderId}`);
    throw new AppError('Order not found', 404);
  }
  
  console.log(`[Logistics Service] ✅ Step 2: Loaded order #${order.orderNumber}. Status: ${order.status}`);

  if (order.status !== 'PAID' && order.status !== 'PROCESSING') {
    throw new AppError('Order must be PAID or PROCESSING to create shipment', 400);
  }

  const shippingAddr = order.shippingAddress;

  const sanitizePhone = (phone) => {
    if (!phone) {
      throw new AppError('A valid phone number is required to book a shipment.', 400);
    }
    let cleaned = phone.toString().replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.length < 10) {
      throw new AppError('Phone number must be a valid 10-digit number for courier booking.', 400);
    }
    return cleaned.slice(-10);
  };

  const billingPhone = sanitizePhone(shippingAddr?.phoneNumber || order.user?.phoneNumber);
  console.log(`[Logistics Service] 📱 Step 3: Sanitized phone for Shiprocket: ${billingPhone}`);

  // 2. Transform into Shiprocket Payload
  const shiprocketPayload = {
    order_id: order.orderNumber,
    order_date: order.createdAt.toISOString().split('T')[0],
    pickup_location: process.env.DEFAULT_PICKUP_LOCATION || 'Primary',
    billing_customer_name: order.user?.firstName || 'Customer',
    billing_last_name: order.user?.lastName || '',
    billing_address: shippingAddr.street1 || shippingAddr.street_1 || '',
    billing_address_2: shippingAddr.street2 || shippingAddr.street_2 || '',
    billing_city: shippingAddr.city || '',
    billing_pincode: shippingAddr.postalCode || shippingAddr.postal_code || '',
    billing_state: shippingAddr.stateProvince || shippingAddr.state_province || '',
    billing_country: shippingAddr.country || '',
    billing_email: order.user?.email || 'fake@email.com',
    billing_phone: billingPhone,
    shipping_is_billing: true,
    order_items: order.items.map(item => ({
      name: item.name,
      sku: item.sku,
      units: item.quantity,
      selling_price: item.priceAtPurchase.toString()
    })),
    payment_method: 'Prepaid',
    sub_total: order.subtotal.toString(),
    length: 10, // Default dimensions (cm)
    breadth: 10,
    height: 10,
    weight: Math.max(0.4, order.items.reduce((sum, item) => sum + (item.quantity * 0.4), 0)) // 400g per item
  };

  console.log(`[Logistics Service] 📦 Step 4: Constructed Shiprocket Payload:\n`, JSON.stringify(shiprocketPayload, null, 2));

  try {
    // 3. Call Shiprocket API
    console.log(`[Logistics Service] 📡 Step 5: Sending request to Shiprocket to create order...`);
    const srOrder = await shiprocket.createOrder(shiprocketPayload);
    console.log(`[Logistics Service] 📥 Step 6: Shiprocket order created successfully! Response:\n`, JSON.stringify(srOrder, null, 2));
    
    const shipmentId = srOrder.shipment_id;
    console.log(`[Logistics Service] 📡 Step 7: Requesting AWB code assignment for Shipment ID: ${shipmentId}`);

    // 4. Assign AWB
    const awbResult = await shiprocket.assignAWB(shipmentId);
    console.log(`[Logistics Service] 📥 Step 8: AWB Assignment Response:\n`, JSON.stringify(awbResult, null, 2));

    const awbCode = awbResult.response?.data?.awb_code;
    const courierName = awbResult.response?.data?.courier_name;
    const awbAssignStatus = awbResult.awb_assign_status;
    const awbError = awbResult.response?.data?.awb_assign_error || awbResult.message;

    // Validate AWB was actually assigned - status 0 means failure
    if (!awbCode || awbAssignStatus === 0) {
      console.error(`[Logistics Service] ❌ AWB assignment failed: ${awbError}`);
      throw new Error(awbError || 'AWB assignment failed. Please check your Shiprocket wallet balance.');
    }

    console.log(`[Logistics Service] 🎯 Step 9: AWB assigned! Code: ${awbCode}, Courier: ${courierName}`);

    // 5. Update Order in DB
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        awbCode,
        courierName,
        shipmentStatus: 'shipped',
        status: 'SHIPPED',
        trackingUrl: `https://shiprocket.co/tracking/${awbCode}`
      }
    });

    console.log(`[Logistics Service] 🎉 Step 10: Storefront database updated! Shipment registration complete.`);

    // 6. Admin Log (use relation connect only when adminId is provided)
    await prisma.adminLog.create({
      data: {
        ...(adminId ? { admin: { connect: { id: adminId } } } : {}),
        action: 'create_shipment',
        entityId: orderId,
        metadata: { awbCode, courierName, shipmentId }
      }
    });

    return updatedOrder;
  } catch (err) {
    if (err.response?.data) {
      console.error('❌ [Logistics] Shiprocket API Rejected Payload:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('[Logistics] API Error:', err.message);
    }
    throw new AppError(`Shiprocket API failed: ${err.message}`, 502);
  }
};

exports.updateTrackingManual = async (adminId, orderId, trackingData) => {
  const { trackingUrl, courierName, awbCode, status } = trackingData;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingUrl,
      courierName,
      awbCode,
      shipmentStatus: status || 'shipped',
      status: status === 'delivered' ? 'DELIVERED' : 'SHIPPED'
    }
  });

  await prisma.adminLog.create({
    data: {
      adminId,
      action: 'update_tracking_manual',
      entityId: orderId,
      metadata: trackingData
    }
  });

  return order;
};

exports.getTrackingInfo = async (orderId, userId = null) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      trackingUrl: true,
      courierName: true,
      awbCode: true,
      shipmentStatus: true,
      status: true
    }
  });

  if (!order) throw new AppError('Order not found', 404);

  // Security check for users
  if (userId && order.userId !== userId) {
    throw new AppError('Unauthorized access to tracking info', 403);
  }

  return {
    order_id: order.id,
    tracking_url: order.trackingUrl,
    courier: order.courierName,
    awb_code: order.awbCode,
    shipment_status: order.shipmentStatus,
    order_status: order.status
  };
};

exports.getETA = async (deliveryPostcode) => {
  const pickupPostcode = process.env.DEFAULT_PICKUP_POSTCODE || '110001';

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  try {
    const serviceability = await shiprocket.getServiceability(pickupPostcode, deliveryPostcode);
    const couriers = serviceability.data?.available_courier_companies || [];

    if (couriers.length > 0) {
      const fastest = couriers.reduce((prev, current) => {
        const prevDays = prev.etd_hours || 120;
        const currDays = current.etd_hours || 120;
        return currDays < prevDays ? current : prev;
      });

      const etdDateString = fastest.etd;
      if (etdDateString) {
        const etdDate = new Date(etdDateString);
        const days = Math.ceil((etdDate - new Date()) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          return {
            status: 'serviceable',
            days: days,
            etaString: `Expected Delivery: ${formatDate(etdDate)}`
          };
        }
      }
    }

    const fallbackDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    return {
      status: 'serviceable',
      days: 4,
      etaString: `Expected Delivery: ${formatDate(fallbackDate)}`
    };
  } catch (err) {
    console.warn('[Logistics] Serviceability ETA failed, using fallback:', err.message);
    const fallbackDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    return {
      status: 'serviceable',
      days: 4,
      etaString: `Expected Delivery: ${formatDate(fallbackDate)}`
    };
  }
};
