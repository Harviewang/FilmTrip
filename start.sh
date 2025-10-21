#!/bin/bash
set -euo pipefail
# Thin wrapper to unified entrypoint
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$ROOT_DIR/project/start.sh"
if [ ! -x "$TARGET" ]; then
  echo "[ERROR] project/start.sh 不存在或不可执行：$TARGET" >&2
  exit 1
fi
exec "$TARGET" "$@"
