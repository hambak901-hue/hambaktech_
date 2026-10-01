#!/usr/bin/env python3
"""
HAMBAKTECH SMART DIGITAL PLATFORM v1.0
Automated FTP / FTPS Production Deployment Script for Truehost cPanel
Zero hardcoded credentials. All settings passed via environment or CLI flags.
"""

import os
import sys
import argparse
import ftplib
import time
from pathlib import Path

def mask_secret(val: str) -> str:
    if not val:
        return "[NOT SET]"
    return "*" * 8

def connect_ftp(host, port, user, password, protocol="ftps"):
    print(f"Connecting to {host}:{port} via {protocol.upper()}...")
    try:
        if protocol.lower() == "ftps":
            ftp = ftplib.FTP_TLS()
            ftp.connect(host, port, timeout=30)
            ftp.login(user, password)
            ftp.prot_p()  # Switch data connection to TLS
        else:
            ftp = ftplib.FTP()
            ftp.connect(host, port, timeout=30)
            ftp.login(user, password)
        print("✓ Authenticated successfully with remote FTP server.")
        return ftp
    except ftplib.error_perm as e:
        print(f"❌ FTP Authentication Failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ FTP Connection Failed: {e}")
        sys.exit(1)

def ensure_remote_dir(ftp, remote_dir):
    parts = remote_dir.strip("/").split("/")
    current = ""
    for part in parts:
        current += "/" + part
        try:
            ftp.cwd(current)
        except ftplib.error_perm:
            try:
                ftp.mkd(current)
                print(f"  + Created remote directory: {current}")
            except Exception:
                pass

def deploy():
    parser = argparse.ArgumentParser(description="HambakTech cPanel Deployment Automation")
    parser.add_argument("--host", default=os.getenv("FTP_HOST"), help="FTP hostname (e.g. ftp.hambaktech.com.ng)")
    parser.add_argument("--port", type=int, default=int(os.getenv("FTP_PORT", 21)), help="FTP port (default: 21)")
    parser.add_argument("--user", default=os.getenv("FTP_USERNAME"), help="FTP username")
    parser.add_argument("--password", default=os.getenv("FTP_PASSWORD"), help="FTP password")
    parser.add_argument("--protocol", default=os.getenv("FTP_PROTOCOL", "ftps"), choices=["ftp", "ftps"], help="FTP protocol")
    parser.add_argument("--remote-path", default=os.getenv("REMOTE_PATH", "/public_html"), help="Remote target root path")
    parser.add_argument("--dry-run", action="store_true", help="Simulate upload without writing remote files")
    parser.add_argument("--staging-dir", default="dist/staging", help="Local staging directory containing build artifacts")
    
    args = parser.parse_args()

    print("=================================================================")
    print("🚀 HAMBAKTECH PRODUCTION CPANEL DEPLOYMENT PIPELINE")
    print("=================================================================")
    print(f"Target Host:    {args.host or '[NOT SPECIFIED]'}")
    print(f"Target Port:    {args.port}")
    print(f"FTP User:       {args.user or '[NOT SPECIFIED]'}")
    print(f"FTP Password:   {mask_secret(args.password)}")
    print(f"Protocol:       {args.protocol.upper()}")
    print(f"Remote Path:    {args.remote_path}")
    print(f"Dry Run Mode:   {'YES (Simulated)' if args.dry_run else 'NO (Live Upload)'}")
    print("=================================================================\n")

    if not args.host or not args.user or not args.password:
        if args.dry_run:
            print("ℹ️  Dry-run without credentials: Validating local staging artifacts only.")
        else:
            print("❌ Missing deployment credentials.")
            print("Set FTP_HOST, FTP_USERNAME, FTP_PASSWORD in your deployment environment")
            print("or pass via --host, --user, --password.")
            sys.exit(1)

    staging_path = Path(args.staging_dir)
    if not staging_path.exists():
        print(f"❌ Local staging directory '{args.staging_dir}' not found.")
        print("Run 'npm run package:production' first to generate artifacts.")
        sys.exit(1)

    # Inventory local files
    files_to_upload = []
    total_bytes = 0
    for root, dirs, files in os.walk(staging_path):
        for f in files:
            if f in [".env", ".DS_Store", "Thumbs.db"] or f.endswith(".log"):
                continue
            local_full = Path(root) / f
            rel_path = local_full.relative_to(staging_path)
            size = local_full.stat().st_size
            files_to_upload.append((local_full, rel_path, size))
            total_bytes += size

    print(f"Staging Inventory: {len(files_to_upload)} files ({total_bytes / (1024*1024):.2f} MB)")

    if args.dry_run:
        print("\n[DRY RUN] The following directories and key files would be deployed:")
        for local_full, rel, size in files_to_upload[:15]:
            print(f"  -> {args.remote_path}/{rel} ({size} bytes)")
        if len(files_to_upload) > 15:
            print(f"  ... and {len(files_to_upload) - 15} more files.")
        print("\n✅ DRY RUN SUCCESSFUL: Packaging and file inventory verified.")
        sys.exit(0)

    # Live FTP execution
    ftp = connect_ftp(args.host, args.port, args.user, args.password, args.protocol)
    ensure_remote_dir(ftp, args.remote_path)

    uploaded_count = 0
    for local_full, rel, size in files_to_upload:
        remote_file_path = f"{args.remote_path}/{rel}".replace("\\", "/")
        remote_dir = os.path.dirname(remote_file_path)
        ensure_remote_dir(ftp, remote_dir)
        ftp.cwd(remote_dir)
        filename = os.path.basename(remote_file_path)

        with open(local_full, "rb") as fp:
            ftp.storbinary(f"STOR {filename}", fp)
            uploaded_count += 1
            if uploaded_count % 10 == 0 or uploaded_count == len(files_to_upload):
                print(f"  [{uploaded_count}/{len(files_to_upload)}] Uploaded {rel}")

    ftp.quit()
    print("\n=================================================================")
    print("✅ DEPLOYMENT FINISHED SUCCESSFULLY")
    print(f"Total Files Uploaded: {uploaded_count}")
    print("=================================================================")

if __name__ == "__main__":
    deploy()
