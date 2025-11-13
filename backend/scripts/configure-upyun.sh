#!/bin/bash

# 又拍云配置脚本
# 使用方法: ./scripts/configure-upyun.sh

echo "=== 又拍云配置助手 ==="
echo ""
echo "⚠️  安全提示：此脚本不应包含真实密钥！"
echo ""
echo "请确认这些值的用途："
echo ""
echo "选项 A："
echo "  - UPYUN_OPERATOR=[密钥1，存储在.env文件中]"
echo "  - UPYUN_FORM_API_SECRET=[密钥2，存储在.env文件中]"
echo ""
echo "选项 B："
echo "  - UPYUN_PASSWORD=[密钥1，存储在.env文件中]"
echo "  - UPYUN_FORM_API_SECRET=[密钥2，存储在.env文件中]"
echo ""
echo "选项 C："
echo "  - UPYUN_OPERATOR=[密钥1，存储在.env文件中]"
echo "  - UPYUN_PASSWORD=[密钥2，存储在.env文件中]"
echo ""
echo "还需要配置以下信息："
echo "  - UPYUN_BUCKET: 存储空间名称"
echo "  - UPYUN_CDN_DOMAIN: CDN 域名（如 https://img.filmtrip.cn）"
echo "  - UPYUN_NOTIFY_URL: 回调 URL（如 https://api.filmtrip.cn/api/storage/callback）"
echo ""
echo "请编辑 backend/.env 文件，配置以上信息。"
echo ""

