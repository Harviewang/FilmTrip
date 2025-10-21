#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "[ERROR] vercel CLI 未安装。请运行 npm install -g vercel 或参考 https://vercel.com/docs/cli" >&2
  exit 1
fi

echo "==> 登录 Vercel (若已登录可跳过)"
vercel whoami >/dev/null 2>&1 || vercel login

echo "==> 部署后端 backend/ (vercel --prod)"
cd backend
vercel deploy --prod
BACKEND_URL=$(vercel ls --limit 1 | awk 'NR==2 {print $2}')
cd ..

echo "==> 部署前端 frontend/ (vercel --prod)"
cd frontend
export VITE_API_BASE_URL="https://${BACKEND_URL}"
vercel deploy --prod
cd ..

echo "==> 完成。必要时在 Vercel 控制台更新 CORS/环境变量。"
