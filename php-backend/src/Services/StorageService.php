<?php
declare(strict_types=1);

namespace HambakTech\Services;

use HambakTech\Config\Env;
use HambakTech\Utils\Security;
use RuntimeException;

/**
 * Hardened File Storage Service
 * Validates MIME types, extensions, magic bytes, and enforces path traversal protection.
 */
class StorageService
{
    private string $uploadDir;
    private int $maxBytes;

    private const ALLOWED_MIME = [
        'image/jpeg' => ['jpg', 'jpeg'],
        'image/png'  => ['png'],
        'image/webp' => ['webp'],
        'application/pdf' => ['pdf'],
    ];

    public function __construct()
    {
        $this->uploadDir = dirname(__DIR__, 2) . '/storage/uploads';
        if (!is_dir($this->uploadDir)) {
            @mkdir($this->uploadDir, 0755, true);
        }
        $this->maxBytes = Env::getInt('MAX_UPLOAD_BYTES', 5 * 1024 * 1024); // 5 MB
    }

    public function handleUpload(array $fileInfo, string $subfolder = 'documents'): array
    {
        if (!isset($fileInfo['error']) || is_array($fileInfo['error'])) {
            throw new RuntimeException("Invalid upload parameters.", 400);
        }

        if ($fileInfo['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException("File upload failed with error code: " . $fileInfo['error'], 400);
        }

        if ($fileInfo['size'] > $this->maxBytes) {
            throw new RuntimeException("File exceeds maximum allowed size of 5MB.", 400);
        }

        // Validate MIME type with finfo
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($fileInfo['tmp_name']);

        if (!isset(self::ALLOWED_MIME[$mime])) {
            throw new RuntimeException("Unsupported file format ({$mime}). Allowed: JPG, PNG, WEBP, PDF.", 400);
        }

        // Validate extension
        $origExt = strtolower(pathinfo($fileInfo['name'], PATHINFO_EXTENSION));
        if (!in_array($origExt, self::ALLOWED_MIME[$mime], true)) {
            throw new RuntimeException("File extension does not match its detected content type.", 400);
        }

        // Block all executable or script extensions
        $dangerous = ['php', 'phtml', 'phar', 'cgi', 'pl', 'py', 'sh', 'bash', 'exe', 'bin', 'js', 'html', 'htm', 'svg'];
        if (in_array($origExt, $dangerous, true)) {
            throw new RuntimeException("File type rejected for security policy compliance.", 403);
        }

        $cleanSubfolder = preg_replace('/[^a-zA-Z0-9_-]/', '', $subfolder);
        $targetDir = $this->uploadDir . '/' . $cleanSubfolder;
        if (!is_dir($targetDir)) {
            @mkdir($targetDir, 0755, true);
        }

        // Randomized safe filename
        $safeName = bin2hex(random_bytes(16)) . '.' . $origExt;
        $destPath = $targetDir . '/' . $safeName;

        if (!move_uploaded_file($fileInfo['tmp_name'], $destPath)) {
            throw new RuntimeException("Failed to persist uploaded file to storage.", 500);
        }

        return [
            'originalName' => Security::sanitizeFilename($fileInfo['name']),
            'storedName'   => $safeName,
            'subfolder'    => $cleanSubfolder,
            'mimeType'     => $mime,
            'size'         => $fileInfo['size'],
            'path'         => "/uploads/{$cleanSubfolder}/{$safeName}",
        ];
    }
}
