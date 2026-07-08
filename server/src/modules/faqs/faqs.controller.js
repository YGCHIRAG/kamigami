const faqsService = require('./faqs.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

exports.getFaqs = asyncHandler(async (req, res) => {
  const faqs = await faqsService.getAllFaqs();
  res.status(200).json({ status: 'success', data: faqs });
});

exports.createFaq = asyncHandler(async (req, res) => {
  const faq = await faqsService.createFaq(req.body);
  res.status(201).json({ status: 'success', data: faq });
});

exports.deleteFaq = asyncHandler(async (req, res) => {
  const result = await faqsService.deleteFaq(req.params.id);
  res.status(200).json({ status: 'success', data: result });
});

exports.updateFaq = asyncHandler(async (req, res) => {
  const faq = await faqsService.updateFaq(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: faq });
});
