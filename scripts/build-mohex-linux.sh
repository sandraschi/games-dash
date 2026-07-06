#!/usr/bin/env bash
# Build MoHex (Benzene) natively on Linux.
# Run: bash scripts/build-mohex-linux.sh
# Or use Docker: docker compose up mohex-engine
set -euo pipefail

echo "=== MoHex Linux Build ==="

echo "[1/5] Installing build tools..."
sudo apt-get update -qq
sudo apt-get install -y -qq build-essential autoconf automake libtool git subversion \
    libboost-all-dev libdb-dev 2>/dev/null || true

BUILD_DIR=$(mktemp -d)
trap "rm -rf $BUILD_DIR" EXIT

echo "[2/5] Building Fuego from source..."
svn checkout -r 1371 http://svn.code.sf.net/p/fuego/code/trunk "$BUILD_DIR/fuego" 2>/dev/null
cd "$BUILD_DIR/fuego"
autoreconf -i
./configure
make -j$(nproc)
FUEGO_ROOT="$BUILD_DIR/fuego"

echo "[3/5] Cloning Benzene..."
git clone --depth 1 https://github.com/cgao3/benzene.git "$BUILD_DIR/benzene"
cd "$BUILD_DIR/benzene"

echo "[4/5] Configuring with Fuego..."
autoreconf -i
./configure --with-fuego-root="$FUEGO_ROOT"

echo "[5/5] Building MoHex..."
make -j$(nproc)

MOHEX_BIN="$BUILD_DIR/benzene/src/mohex/mohex"
if [ -f "$MOHEX_BIN" ]; then
    sudo cp "$MOHEX_BIN" /usr/local/bin/mohex
    echo "  Installed: /usr/local/bin/mohex"
    echo ""
    echo "=== Build complete ==="
    echo "Set env: export MOHEX_PATH=/usr/local/bin/mohex"
    echo "Then:   just serve"
else
    echo "ERROR: mohex binary not found at $MOHEX_BIN"
    exit 1
fi
