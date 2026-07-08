const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');

exports.getAllFaqs = async () => {
  return await prisma.faq.findMany({
    orderBy: { createdAt: 'asc' }
  });
};

exports.createFaq = async (faqData) => {
  const { question, answer, category } = faqData;
  if (!question || !answer) {
    throw new AppError('Question and answer are required', 400);
  }

  return await prisma.faq.create({
    data: {
      question,
      answer,
      category: category || 'General'
    }
  });
};

exports.deleteFaq = async (faqId) => {
  const faq = await prisma.faq.findUnique({
    where: { id: faqId }
  });

  if (!faq) {
    throw new AppError('FAQ not found', 404);
  }

  await prisma.faq.delete({
    where: { id: faqId }
  });

  return { success: true };
};

exports.updateFaq = async (faqId, faqData) => {
  const { question, answer, category } = faqData;

  const faq = await prisma.faq.findUnique({
    where: { id: faqId }
  });

  if (!faq) {
    throw new AppError('FAQ not found', 404);
  }

  const updateData = {};
  if (question) updateData.question = question;
  if (answer) updateData.answer = answer;
  if (category) updateData.category = category;

  return await prisma.faq.update({
    where: { id: faqId },
    data: updateData
  });
};
