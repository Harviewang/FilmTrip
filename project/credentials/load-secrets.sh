#!/bin/bash
# FilmTrip 密钥加载脚本
# 用途: 将secrets.conf中的密钥加载到当前shell的环境变量中
# 使用: source project/credentials/load-secrets.sh

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_FILE="$SCRIPT_DIR/secrets.conf"

# 检查文件是否存在
if [ ! -f "$SECRETS_FILE" ]; then
    echo "❌ 错误: 密钥文件不存在: $SECRETS_FILE"
    return 1
fi

echo "🔐 正在加载密钥..."

# 读取配置文件并导出环境变量
while IFS= read -r line || [ -n "$line" ]; do
    # 跳过注释和空行
    [[ "$line" =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue
    
    # 跳过=号后面为空的行
    [[ "$line" =~ ^[^=]+=\s*$ ]] && continue
    
    # 导出环境变量
    if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
        export "${BASH_REMATCH[1]}=${BASH_REMATCH[2]}"
    fi
done < "$SECRETS_FILE"

echo "✅ 密钥加载完成"
echo ""
echo "📋 已加载的密钥:"
echo "  - ALIYUN_ACCESS_KEY_ID"
echo "  - ALIYUN_ACCESS_KEY_SECRET"
echo "  - 以及其他配置的密钥..."
echo ""
echo "💡 提示: 这些环境变量仅在当前shell会话中有效"
echo "   退出终端后需要重新加载"

