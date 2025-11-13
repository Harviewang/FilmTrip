#!/bin/bash

# 又拍云配置脚本
# 使用方法: ./scripts/configure-upyun.sh

echo "=== 又拍云配置助手 ==="
echo ""
echo "您提供的两个值："
echo "1. 2f7e682861014d71a9119678f8027deb"
echo "2. 402e4c36b7c75b85586f5fa12b27bc89"
echo ""
echo "请确认这些值的用途："
echo ""
echo "选项 A："
echo "  - UPYUN_OPERATOR=2f7e682861014d71a9119678f8027deb"
echo "  - UPYUN_FORM_API_SECRET=402e4c36b7c75b85586f5fa12b27bc89"
echo ""
echo "选项 B："
echo "  - UPYUN_PASSWORD=2f7e682861014d71a9119678f8027deb"
echo "  - UPYUN_FORM_API_SECRET=402e4c36b7c75b85586f5fa12b27bc89"
echo ""
echo "选项 C："
echo "  - UPYUN_OPERATOR=2f7e682861014d71a9119678f8027deb"
echo "  - UPYUN_PASSWORD=402e4c36b7c75b85586f5fa12b27bc89"
echo ""
echo "还需要配置以下信息："
echo "  - UPYUN_BUCKET: 存储空间名称"
echo "  - UPYUN_CDN_DOMAIN: CDN 域名（如 https://img.filmtrip.cn）"
echo "  - UPYUN_NOTIFY_URL: 回调 URL（如 https://api.filmtrip.cn/api/storage/callback）"
echo ""
echo "请编辑 backend/.env 文件，配置以上信息。"
echo ""

