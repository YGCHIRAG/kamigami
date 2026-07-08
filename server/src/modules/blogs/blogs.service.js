const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');

exports.getAllBlogs = async () => {
  return await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
};

exports.getBlogBySlug = async (slug) => {
  const blog = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  if (!blog) {
    throw new AppError('Blog post not found', 404);
  }

  return blog;
};

exports.createBlog = async (authorId, blogData) => {
  const { title, content, summary } = blogData;
  if (!title || !content) {
    throw new AppError('Title and content are required', 400);
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

  return await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      summary: summary || '',
      authorId,
      publishedAt: new Date()
    }
  });
};

exports.deleteBlog = async (blogId) => {
  const blog = await prisma.blogPost.findUnique({
    where: { id: blogId }
  });

  if (!blog) {
    throw new AppError('Blog post not found', 404);
  }

  await prisma.blogPost.delete({
    where: { id: blogId }
  });

  return { success: true };
};

exports.updateBlog = async (blogId, blogData) => {
  const { title, content, summary } = blogData;
  
  const blog = await prisma.blogPost.findUnique({
    where: { id: blogId }
  });

  if (!blog) {
    throw new AppError('Blog post not found', 404);
  }

  const updateData = {};
  if (title) {
    updateData.title = title;
    updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  if (content) updateData.content = content;
  if (summary !== undefined) updateData.summary = summary;

  return await prisma.blogPost.update({
    where: { id: blogId },
    data: updateData
  });
};
