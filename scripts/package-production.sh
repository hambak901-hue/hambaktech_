#!/usr/bin/env bash
set -euo pipefail

echo "================================================================="
echo "📦 HAMBAKTECH PRODUCTION CPANEL PACKAGING PIPELINE"
echo "================================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DIST_DIR="$ROOT_DIR/dist"
STAGING_DIR="$DIST_DIR/staging"

echo "1. Cleaning previous build and staging artifacts..."
rm -rf "$DIST_DIR"
mkdir -p "$STAGING_DIR"

echo "2. Building production Next.js static export..."
npm run build

if [ ! -d "$ROOT_DIR/out" ]; then
  echo "❌ Error: Production build output 'out/' not found!"
  exit 1
fi

echo "3. Assembling cPanel production directory structure..."

mkdir -p "$STAGING_DIR/public_html/api"
mkdir -p "$STAGING_DIR/public_html/uploads"
mkdir -p "$STAGING_DIR/php-backend"
mkdir -p "$STAGING_DIR/storage/logs"
mkdir -p "$STAGING_DIR/storage/cache"
mkdir -p "$STAGING_DIR/storage/uploads"
mkdir -p "$STAGING_DIR/database/migrations"
mkdir -p "$STAGING_DIR/config"
mkdir -p "$STAGING_DIR/docs"

echo "  -> Copying static frontend assets to public_html/..."
cp -R "$ROOT_DIR/out/"* "$STAGING_DIR/public_html/"
cp "$ROOT_DIR/.htaccess" "$STAGING_DIR/public_html/.htaccess"
cp "$ROOT_DIR/api/index.php" "$STAGING_DIR/public_html/api/index.php"
cp "$ROOT_DIR/logo.png" "$STAGING_DIR/public_html/logo.png"

echo "  -> Copying PHP backend runtime engine..."
cp "$ROOT_DIR/php-backend/autoload.php" "$STAGING_DIR/php-backend/autoload.php"
cp -R "$ROOT_DIR/php-backend/src" "$STAGING_DIR/php-backend/"
if [ -d "$ROOT_DIR/php-backend/cron" ]; then
  cp -R "$ROOT_DIR/php-backend/cron" "$STAGING_DIR/php-backend/"
fi

echo "  -> Securing uploads and storage directories..."
cp "$ROOT_DIR/storage/uploads/.htaccess" "$STAGING_DIR/storage/uploads/.htaccess"
cp "$ROOT_DIR/storage/uploads/.htaccess" "$STAGING_DIR/public_html/uploads/.htaccess"
touch "$STAGING_DIR/storage/logs/.gitkeep"
touch "$STAGING_DIR/storage/cache/.gitkeep"

echo "  -> Packaging database schemas & migrations..."
cp "$ROOT_DIR/database/schema.sql" "$STAGING_DIR/database/schema.sql"
cp "$ROOT_DIR/database/seed.sql" "$STAGING_DIR/database/seed.sql"
cp "$ROOT_DIR/database/migrations/"*.sql "$STAGING_DIR/database/migrations/"

echo "  -> Packaging environment templates & documentation..."
cp "$ROOT_DIR/config/production.env.template" "$STAGING_DIR/config/production.env.template"
cp "$ROOT_DIR/.env.example" "$STAGING_DIR/.env.example"
cp "$ROOT_DIR/docs/deployment.md" "$STAGING_DIR/docs/deployment.md"
cp "$ROOT_DIR/docs/database-production.md" "$STAGING_DIR/docs/database-production.md"
cp "$ROOT_DIR/README.md" "$STAGING_DIR/README.md"

echo "4. Creating production deployment archives..."

python3 -c "
import zipfile, os
dist = ''
staging = ''

zip_path = os.path.join(dist, 'hambaktech-production-cpanel.zip')
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(staging):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, staging)
            z.write(full, rel)

pub = os.path.join(staging, 'public_html')
pub_zip_path = os.path.join(dist, 'hambaktech-public_html-only.zip')
with zipfile.ZipFile(pub_zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(pub):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, pub)
            z.write(full, rel)
"

tar -czf "$DIST_DIR/hambaktech-production-cpanel.tar.gz" -C "$STAGING_DIR" .
tar -czf "$DIST_DIR/hambaktech-public_html-only.tar.gz" -C "$STAGING_DIR/public_html" .

echo "================================================================="
echo "✅ PRODUCTION PACKAGING COMPLETE"
echo "================================================================="
echo "Artifacts generated in dist/:"
ls -lh "$DIST_DIR"/*.*
echo "================================================================="
