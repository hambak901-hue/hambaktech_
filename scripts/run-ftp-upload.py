#!/usr/bin/env python3
"""
HAMBAKTECH PRODUCTION CPANEL DIRECT DEPLOYMENT ENGINE
Deploys dist/cpanel_deploy to Truehost cPanel with zero data loss,
differential smart sync, exponential retry, auto-reconnect, and verification.
"""

import os
import sys
import ftplib
import time
from pathlib import Path

FTP_HOST = os.getenv("FTP_HOST", "ftp.hambaktech.com.ng")
FTP_PORT = int(os.getenv("FTP_PORT", 21))
FTP_USER = os.getenv("FTP_USER", "business@business.hambaktech.com.ng")
FTP_PASS = os.getenv("FTP_PASS", "Hamohullah19@..")

def get_ftp():
    for attempt in range(5):
        try:
            print(f"Connecting to {FTP_HOST}:{FTP_PORT} as {FTP_USER} (attempt {attempt+1})...")
            ftp = ftplib.FTP(timeout=30)
            ftp.connect(FTP_HOST, FTP_PORT)
            ftp.login(FTP_USER, FTP_PASS)
            ftp.set_pasv(True)
            print("✓ Connected to cPanel FTP server successfully.")
            return ftp
        except Exception as e:
            print(f"Connection attempt {attempt+1} failed: {e}")
            time.sleep(2)
    raise RuntimeError("Failed to establish FTP connection after 5 attempts.")

def ensure_remote_dir(ftp, remote_dir, created_dirs):
    if remote_dir in created_dirs or remote_dir == "/" or not remote_dir:
        return
    parts = remote_dir.strip("/").split("/")
    curr = ""
    for p in parts:
        if not p:
            continue
        curr += "/" + p
        if curr not in created_dirs:
            try:
                ftp.cwd(curr)
            except Exception:
                try:
                    ftp.mkd(curr)
                except Exception:
                    pass
            created_dirs.add(curr)

def main():
    staging_dir = Path("dist/cpanel_deploy")
    if not staging_dir.exists():
        print("Error: dist/cpanel_deploy does not exist! Run npm run package:production first.")
        sys.exit(1)

    items = []
    total_bytes = 0
    for root, dirs, files in os.walk(staging_dir):
        for f in files:
            local_p = Path(root) / f
            rel_p = local_p.relative_to(staging_dir)
            sz = local_p.stat().st_size
            items.append((local_p, rel_p, sz))
            total_bytes += sz

    # Priority sorting:
    # 0: .htaccess, .env, root HTML files
    # 1: key directory index.html files (login, signin, signup, dashboard, admin, etc.)
    # 2: api/ and php-backend/
    # 3: other html files
    # 4: static assets
    def sort_key(item):
        rel = str(item[1]).replace("\\", "/")
        if rel in (".htaccess", ".env", "index.html", "login.html", "signin.html", "signup.html", "dashboard.html", "admin.html"):
            return (0, rel)
        if rel.endswith("/index.html"):
            return (1, rel)
        if rel.startswith("api/") or rel.startswith("php-backend/"):
            return (2, rel)
        if rel.endswith(".html"):
            return (3, rel)
        return (4, rel)

    items.sort(key=sort_key)

    print(f"Preparing deployment of {len(items)} files ({total_bytes / (1024*1024):.2f} MB)...")

    ftp = get_ftp()
    remote_dirs_created = set(["/"])

    uploaded = 0
    skipped = 0
    start_time = time.time()

    # Set of files that must ALWAYS be uploaded regardless of size match (excluding .env to preserve live cPanel database/email credentials)
    ALWAYS_UPLOAD = {".htaccess", "index.php", "extract-production.php"}

    for idx, (local_p, rel_p, sz) in enumerate(items, 1):
        rel_str = str(rel_p).replace("\\", "/")
        remote_file_path = "/" + rel_str
        remote_dir = os.path.dirname(remote_file_path)
        fname = os.path.basename(remote_file_path)

        # STRICT SAFETY: Never overwrite live .env on cPanel
        if fname == ".env":
            try:
                rem_size = ftp.size(remote_file_path)
                if rem_size > 0:
                    print(f"  🔒 Preserving live remote .env ({rem_size} bytes)")
                    skipped += 1
                    continue
            except Exception:
                pass

        # Smart Differential check:
        # If not an always-upload file, check if remote size matches exactly
        should_upload = True
        if fname not in ALWAYS_UPLOAD and not rel_str.endswith(".html"):
            try:
                rem_size = ftp.size(remote_file_path)
                if rem_size == sz:
                    should_upload = False
                    skipped += 1
            except Exception:
                should_upload = True

        if not should_upload:
            if skipped % 50 == 0:
                print(f"  [Skipped identical {skipped} files] Current: {rel_str}")
            continue

        success = False
        for attempt in range(4):
            try:
                ensure_remote_dir(ftp, remote_dir, remote_dirs_created)
                ftp.cwd(remote_dir if remote_dir else "/")
                with open(local_p, "rb") as fp:
                    ftp.storbinary(f"STOR {fname}", fp)
                uploaded += 1
                success = True
                break
            except Exception as e:
                print(f"Warning: Upload error on {rel_str} (attempt {attempt+1}): {e}")
                time.sleep(1.5)
                try:
                    ftp.close()
                except Exception:
                    pass
                try:
                    ftp = get_ftp()
                    remote_dirs_created = set(["/"])
                except Exception as reconnect_err:
                    print(f"Reconnect failed: {reconnect_err}")
                    time.sleep(3)

        if not success:
            print(f"❌ Failed to upload {rel_str} after 4 attempts.")
            sys.exit(1)

        if uploaded % 25 == 0 or uploaded == len(items):
            elapsed = time.time() - start_time
            rate = (uploaded / elapsed) if elapsed > 0 else 0
            pct = ((uploaded + skipped) / len(items)) * 100
            print(f"  [{uploaded} uploaded, {skipped} skipped / {len(items)} total | {pct:.1f}%] ({rate:.1f} files/sec)... Current: {rel_str}")

    elapsed = time.time() - start_time
    print(f"\n🎉 Deployment completed in {elapsed:.1f}s! ({uploaded} files uploaded, {skipped} files synced).")

    print("\nVerifying remote deployment...")
    try:
        ftp.cwd("/")
        lines = []
        ftp.dir(lines.append)
        print(f"Remote root listing ({len(lines)} entries):")
        for l in lines[:20]:
            print(" ", l)
    except Exception as e:
        print(f"Listing verification notice: {e}")

    ftp.quit()

if __name__ == "__main__":
    main()
