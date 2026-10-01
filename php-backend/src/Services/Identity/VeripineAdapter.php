<?php
declare(strict_types=1);
namespace HambakTech\Services\Identity;

use HambakTech\Config\Env;
use RuntimeException;

final class VeripineAdapter
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim(Env::get('VERIPINE_BASE_URL', 'https://www.veripine.com/api') ?? '', '/');
        $this->apiKey = trim((string)(Env::get('VERIPINE_API_KEY', '') ?? ''));
    }

    public function configured(): bool { return $this->apiKey !== ''; }

    public function request(string $path, string $method = 'POST', array $payload = []): array
    {
        if (!$this->configured()) {
            throw new RuntimeException('Veripine production API is not configured. Add VERIPINE_API_KEY on the server.', 503);
        }
        $url = $this->baseUrl . '/' . ltrim($path, '/');
        if ($method === 'GET' && $payload) {
            $url .= '?' . http_build_query($payload);
        }
        $ch = curl_init($url);
        if ($ch === false) throw new RuntimeException('Unable to initialize provider connection.', 502);
        $headers = ['Accept: application/json', 'Content-Type: application/json', 'x-api-key: ' . $this->apiKey];
        $options = [CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>30, CURLOPT_CONNECTTIMEOUT=>10, CURLOPT_HTTPHEADER=>$headers, CURLOPT_CUSTOMREQUEST=>$method];
        if ($method !== 'GET') $options[CURLOPT_POSTFIELDS] = json_encode($payload, JSON_UNESCAPED_SLASHES);
        curl_setopt_array($ch, $options);
        $raw = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        if ($raw === false) throw new RuntimeException('Veripine connection failed: ' . $err, 502);
        $data = json_decode($raw, true);
        if (!is_array($data)) throw new RuntimeException('Veripine returned an invalid response.', 502);
        if ($status < 200 || $status >= 300 || (($data['status'] ?? '') !== 'success')) {
            $message = trim((string)($data['message'] ?? 'Veripine request failed.'));
            throw new RuntimeException($message, $status >= 400 ? $status : 502);
        }
        return $data;
    }
}
