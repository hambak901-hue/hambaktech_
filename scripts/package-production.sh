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
if [ -d "$ROOT_DIR/src/app/api" ]; then
  mv "$ROOT_DIR/src/app/api" "$ROOT_DIR/src/app_api_temp_backup"
fi
trap 'if [ -d "$ROOT_DIR/src/app_api_temp_backup" ]; then mv "$ROOT_DIR/src/app_api_temp_backup" "$ROOT_DIR/src/app/api"; fi' EXIT

NEXT_EXPORT=true npm run build

if [ -d "$ROOT_DIR/src/app_api_temp_backup" ]; then
  mv "$ROOT_DIR/src/app_api_temp_backup" "$ROOT_DIR/src/app/api"
fi

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
cp -R "$ROOT_DIR/api/"* "$STAGING_DIR/public_html/api/"
cp "$ROOT_DIR/logo.png" "$STAGING_DIR/public_html/logo.png"

echo "  -> Generating DirectoryIndex index.html mirrors for static subdirectories..."
python3 -c "
import os, shutil
pub = '$STAGING_DIR/public_html'
for root, dirs, files in os.walk(pub):
    for d in dirs:
        dir_path = os.path.join(root, d)
        html_file = dir_path + '.html'
        index_file = os.path.join(dir_path, 'index.html')
        if os.path.exists(html_file):
            shutil.copy2(html_file, index_file)
            print(f'     ✓ Created index.html mirror for {os.path.relpath(dir_path, pub)}')
# Guarantee login directory has signin page mirror
login_dir = os.path.join(pub, 'login')
signin_html = os.path.join(pub, 'signin.html')
if os.path.exists(login_dir) and os.path.exists(signin_html):
    shutil.copy2(signin_html, os.path.join(login_dir, 'index.html'))
    print('     ✓ Mirrored signin.html to login/index.html')
"

echo "  -> Packaging instant cPanel extraction utility..."
cat << 'EOF' > "$STAGING_DIR/public_html/extract-production.php"
<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
$token = $_GET['token'] ?? '';
if ($token !== 'hambaktech2026deploy') {
    echo json_encode(['status' => 'READY', 'message' => 'HambakTech Deployment Unpacker is armed.']);
    exit;
}
$zipPath = __DIR__ . '/hambaktech-production-cpanel.zip';
if (!file_exists($zipPath)) {
    http_response_code(404);
    echo json_encode(['status' => 'ERROR', 'message' => 'Archive not found.']);
    exit;
}
$zip = new ZipArchive();
if ($zip->open($zipPath) === true) {
    $zip->extractTo(__DIR__);
    $zip->close();
    echo json_encode(['status' => 'SUCCESS', 'message' => 'Extraction complete.']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'ERROR', 'message' => 'Extraction failed.']);
}
EOF

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

mkdir -p "$DIST_DIR/cpanel_deploy"
cp -R "$STAGING_DIR/public_html/"* "$DIST_DIR/cpanel_deploy/"
cp "$STAGING_DIR/public_html/.htaccess" "$DIST_DIR/cpanel_deploy/.htaccess"
cp -R "$STAGING_DIR/php-backend" "$DIST_DIR/cpanel_deploy/"
cp -R "$STAGING_DIR/storage" "$DIST_DIR/cpanel_deploy/"
cp -R "$STAGING_DIR/database" "$DIST_DIR/cpanel_deploy/"
cp -R "$STAGING_DIR/config" "$DIST_DIR/cpanel_deploy/"
cp "$ROOT_DIR/config/production.env.template" "$DIST_DIR/cpanel_deploy/.env"

python3 -c "
import zipfile, os, sys
dist = '$DIST_DIR'
staging = '$STAGING_DIR'
cpanel_deploy = os.path.join(dist, 'cpanel_deploy')

# Build flat cPanel archive directly from cpanel_deploy
zip_path = os.path.join(dist, 'hambaktech-production-cpanel.zip')
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(cpanel_deploy):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, cpanel_deploy)
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
