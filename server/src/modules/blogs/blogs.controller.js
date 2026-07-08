const blogsService = require('./blogs.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

exports.getBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogsService.getAllBlogs();
  res.status(200).json({ status: 'success', data: blogs });
});

exports.getBlog = asyncHandler(async (req, res) => {
  const blog = await blogsService.getBlogBySlug(req.params.slug);
  res.status(200).json({ status: 'success', data: blog });
});

exports.createBlog = asyncHandler(async (req, res) => {
  const blog = await blogsService.createBlog(req.user.userId, req.body);
  res.status(201).json({ status: 'success', data: blog });
});

exports.deleteBlog = asyncHandler(async (req, res) => {
  const result = await blogsService.deleteBlog(req.params.id);
  res.status(200).json({ status: 'success', data: result });
});

exports.updateBlog = asyncHandler(async (req, res) => {
  const blog = await blogsService.updateBlog(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: blog });
});
