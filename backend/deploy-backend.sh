#!/bin/bash

# 后端自动部署脚本
echo "开始部署后端到 Vercel..."

# 使用 yes 命令自动确认所有选项
yes | npx vercel --prod

echo "后端部署完成！"