const fs = require('fs');
const path = require('path');

const modules = ['auth', 'users', 'products', 'drops', 'cart', 'inventory', 'orders', 'logistics', 'admin'];
const baseDir = path.join(__dirname, 'src', 'modules');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

modules.forEach((mod) => {
  const modDir = path.join(baseDir, mod);
  if (!fs.existsSync(modDir)) {
    fs.mkdirSync(modDir, { recursive: true });
  }

  // Service
  const serviceCode = `const prisma = require('../../db/prisma');

exports.getExample = async () => {
  return { message: '${mod} service running' };
};
`;
  fs.writeFileSync(path.join(modDir, mod + '.service.js'), serviceCode);

  // Controller
  const controllerCode = `const ${mod}Service = require('./${mod}.service');
const asyncHandler = require('../../common/middleware/asyncHandler');

exports.getExample = asyncHandler(async (req, res, next) => {
  const result = await ${mod}Service.getExample();
  res.status(200).json({
    status: 'success',
    data: result
  });
});
`;
  fs.writeFileSync(path.join(modDir, mod + '.controller.js'), controllerCode);

  // Routes
  const routesCode = `const express = require('express');
const ${mod}Controller = require('./${mod}.controller');

const router = express.Router();

router.get('/', ${mod}Controller.getExample);

module.exports = router;
`;
  fs.writeFileSync(path.join(modDir, mod + '.routes.js'), routesCode);
});

console.log('Modules scaffolded successfully!');
