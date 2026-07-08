const express = require('express');
const faqsController = require('./faqs.controller');
const { verifyJWT, requireAdmin } = require('../auth/auth.middleware');

const router = express.Router();

router.get('/', faqsController.getFaqs);
router.post('/', verifyJWT, requireAdmin, faqsController.createFaq);
router.put('/:id', verifyJWT, requireAdmin, faqsController.updateFaq);
router.delete('/:id', verifyJWT, requireAdmin, faqsController.deleteFaq);

module.exports = router;
