#!/usr/bin/env bash
# Build MoHex (Benzene) natively on macOS using Homebrew Fuego.
# Run: bash scripts/build-mohex-macos.sh
set -euo pipefail

echo "=== MoHex macOS Build ==="

# Prerequisites
echo "[1/5] Installing build tools..."
brew install autoconf automake libtool boost pkg-config 2>/dev/null || true

echo "[2/5] Installing Fuego (pre-built bottle)..."
brew install fuego 2>/dev/null || true
FUEGO_PREFIX=$(brew --prefix fuego)
echo "  Fuego at: $FUEGO_PREFIX"

BUILD_DIR=$(mktemp -d)
trap "rm -rf $BUILD_DIR" EXIT

echo "[3/5] Cloning Benzene..."
git clone --depth 1 https://github.com/cgao3/benzene.git "$BUILD_DIR/benzene"
cd "$BUILD_DIR/benzene"

echo "[4/5] Configuring with Fuego..."
autoreconf -i
./configure --with-fuego-root="$FUEGO_PREFIX"

echo "[5/5] Building MoHex..."
make -j$(sysctl -n hw.ncpu)

# Install
MOHEX_BIN="$BUILD_DIR/benzene/src/mohex/mohex"
if [ -f "$MOHEX_BIN" ]; then
    cp "$MOHEX_BIN" /usr/local/bin/mohex
    echo "  Installed: /usr/local/bin/mohex"
    echo ""
    echo "=== Build complete ==="
    echo "Set env: export MOHEX_PATH=/usr/local/bin/mohex"
    echo "Then:   just serve"
else
    echo "ERROR: mohex binary not found at $MOHEX_BIN"
    exit 1
fi
