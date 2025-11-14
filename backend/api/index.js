// Vercel Serverless Function entry point
// 这个文件是Vercel Serverless Functions的入口点
// 它将所有请求路由到Express应用

const app = require('../index');

// Vercel Serverless Functions需要导出handler函数
module.exports = app;

