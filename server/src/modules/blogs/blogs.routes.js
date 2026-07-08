const express = require('express');
const blogsController = require('./blogs.controller');
const { verifyJWT, requireAdmin } = require('../auth/auth.middleware');

const router = express.Router();

router.get('/', blogsController.getBlogs);
router.get('/:slug', blogsController.getBlog);
router.post('/', verifyJWT, requireAdmin, blogsController.createBlog);
router.put('/:id', verifyJWT, requireAdmin, blogsController.updateBlog);
router.delete('/:id', verifyJWT, requireAdmin, blogsController.deleteBlog);

module.exports = router;
