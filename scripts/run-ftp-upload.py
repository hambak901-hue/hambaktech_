#!/usr/bin/env python3
"""
HAMBAKTECH PRODUCTION FTP UPLOADER
Zero secret logging. Deploys dist/cpanel_deploy to Truehost cPanel.
"""

import os
import sys
import ftplib
import time
from pathlib import Path

FTP_HOST = "ftp.hambaktech.com.ng"
FTP_PORT = 21
FTP_USER = "business@business.hambaktech.com.ng"
FTP_PASS = "Hamohullah19@.."

def get_ftp():
    print(f"Connecting to {FTP_HOST}:{FTP_PORT} as {FTP_USER}...")
    try:
        ftp = ftplib.FTP_TLS()
        ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.prot_p()
        print("✓ Connected securely via FTPS.")
        return ftp
    except Exception as e:
        print(f"FTPS failed: {e}. Falling back to standard FTP...")
        ftp = ftplib.FTP()
        ftp.connect(FTP_HOST, FTP_PORT, timeout=30)
        ftp.login(FTP_USER, FTP_PASS)
        print("✓ Connected via standard FTP.")
        return ftp

def main():
    staging_dir = Path("dist/cpanel_deploy")
    if not staging_dir.exists():
        print("Error: dist/cpanel_deploy does not exist!")
        sys.exit(1)

    # Gather files
    items = []
    total_bytes = 0
    for root, dirs, files in os.walk(staging_dir):
        for f in files:
            local_p = Path(root) / f
            rel_p = local_p.relative_to(staging_dir)
            sz = local_p.stat().st_size
            items.append((local_p, rel_p, sz))
            total_bytes += sz

    print(f"Starting upload of {len(items)} files ({total_bytes / (1024*1024):.2f} MB)...")

    ftp = get_ftp()
    remote_dirs_created = set(["/"])

    uploaded = 0
    start_time = time.time()

    for local_p, rel_p, sz in items:
        rel_str = str(rel_p).replace("\\", "/")
        remote_file_path = "/" + rel_str
        remote_dir = os.path.dirname(remote_file_path)

        # Ensure directory path exists
        if remote_dir not in remote_dirs_created:
            parts = remote_dir.strip("/").split("/")
            curr = ""
            for p in parts:
                if not p:
                    continue
                curr += "/" + p
                if curr not in remote_dirs_created:
                    try:
                        ftp.cwd(curr)
                    except Exception:
                        try:
                            ftp.mkd(curr)
                        except Exception:
                            pass
                    remote_dirs_created.add(curr)

        ftp.cwd(remote_dir)
        fname = os.path.basename(remote_file_path)

        # Upload file with retry
        for attempt in range(3):
            try:
                with open(local_p, "rb") as fp:
                    ftp.storbinary(f"STOR {fname}", fp)
                uploaded += 1
                break
            except Exception as e:
                if attempt == 2:
                    print(f"Failed to upload {rel_str} after 3 attempts: {e}")
                    raise
                time.sleep(1)
                try:
                    ftp.voidcmd("NOOP")
                except Exception:
                    ftp = get_ftp()
                    ftp.cwd(remote_dir)

        if uploaded % 50 == 0 or uploaded == len(items):
            elapsed = time.time() - start_time
            rate = (uploaded / elapsed) if elapsed > 0 else 0
            print(f"  [{uploaded}/{len(items)}] files uploaded ({rate:.1f} files/sec)...")

    # Verify key files
    print("\nVerifying uploaded files on remote server...")
    ftp.cwd("/")
    root_lines = []
    ftp.dir(root_lines.append)
    print(f"Remote root listing ({len(root_lines)} entries):")
    for l in root_lines[:15]:
        print(" ", l)

    ftp.quit()
    duration = round(time.time() - start_time, 2)
    print(f"\n✅ All {uploaded} files successfully uploaded in {duration}s.")

if __name__ == "__main__":
    main()
