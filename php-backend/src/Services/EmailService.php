<?php
declare(strict_types=1);

namespace HambakTech\Services;

use HambakTech\Config\Env;
use RuntimeException;

/**
 * Authoritative Server-Side SMTP Email Delivery Engine
 * Pure PHP RFC 5321/5322 Socket Client — Zero External Dependencies.
 */
class EmailService
{
    private string $host;
    private int $port;
    private string $user;
    private string $password;
    private string $fromEmail;
    private string $fromName;
    private string $replyTo;
    private string $secure; // 'tls', 'ssl', or 'none'

    public function __construct()
    {
        // Support both SMTP_* and MAIL_* env variables
        $this->host = Env::get('SMTP_HOST', Env::get('MAIL_HOST', '')) ?? '';
        $this->port = Env::getInt('SMTP_PORT', Env::getInt('MAIL_PORT', 587));
        $this->user = Env::get('SMTP_USER', Env::get('MAIL_USERNAME', '')) ?? '';
        $this->password = Env::get('SMTP_PASSWORD', Env::get('MAIL_PASSWORD', '')) ?? '';
        $this->fromEmail = Env::get('SMTP_FROM_EMAIL', Env::get('MAIL_FROM_ADDRESS', 'no-reply@hambaktech.com.ng')) ?? 'no-reply@hambaktech.com.ng';
        $this->fromName = Env::get('SMTP_FROM_NAME', Env::get('MAIL_FROM_NAME', 'HambakTech & Services')) ?? 'HambakTech & Services';
        $this->replyTo = Env::get('SMTP_REPLY_TO', 'support@hambaktech.com.ng') ?? 'support@hambaktech.com.ng';
        $this->secure = strtolower(Env::get('SMTP_SECURE', Env::get('MAIL_ENCRYPTION', 'tls')) ?? 'tls');
    }

    public function isConfigured(): bool
    {
        return !empty($this->host) && !empty($this->user) && !empty($this->password);
    }

    /**
     * Dispatches an email via direct SMTP socket. In dev/test mode with missing credentials,
     * it safely logs the message to avoid halting non-production workflows.
     */
    public function send(string $toEmail, string $subject, string $htmlBody, ?string $textBody = null): bool
    {
        if (empty($toEmail) || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            error_log("[EmailService] Invalid recipient email: {$toEmail}");
            return false;
        }

        $plainText = $textBody ?? strip_tags($htmlBody);

        if (!$this->isConfigured()) {
            $logDir = dirname(__DIR__, 2) . '/storage/logs';
            if (!is_dir($logDir)) {
                @mkdir($logDir, 0755, true);
            }
            // Sanitize and mask any sensitive OTP codes, tokens, or credentials from log files
            $sanitizedSubject = preg_replace('/\b\d{6}\b/', '[REDACTED_OTP]', $subject);
            $logEntry = sprintf(
                "[%s] [SMTP_DEV_MOCK] To: %s | Subject: %s | Status: QUEUED (Sensitive credentials omitted)\n------------------------------------\n",
                date('Y-m-d H:i:s'),
                $toEmail,
                $sanitizedSubject
            );
            @file_put_contents("{$logDir}/email.log", $logEntry, FILE_APPEND | LOCK_EX);

            if (Env::isProduction()) {
                error_log("[EmailService WARNING] SMTP not configured in production. Mail logged locally.");
                return false;
            }
            return true;
        }

        try {
            return $this->sendViaSmtpSocket($toEmail, $subject, $htmlBody, $plainText);
        } catch (\Throwable $e) {
            error_log("[EmailService ERROR] SMTP dispatch failed: " . $e->getMessage());
            if (Env::isProduction()) {
                throw new RuntimeException("Email dispatch service temporarily unavailable.", 503, $e);
            }
            return false;
        }
    }

    private function sendViaSmtpSocket(string $toEmail, string $subject, string $htmlBody, string $textBody): bool
    {
        $protocol = ($this->secure === 'ssl' || $this->port === 465) ? 'ssl://' : 'tcp://';
        $target = $protocol . $this->host . ':' . $this->port;

        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
                'allow_self_signed' => false,
            ],
        ]);

        $socket = @stream_socket_client($target, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);
        if (!$socket) {
            throw new RuntimeException("Could not connect to SMTP server: {$errstr} ({$errno})");
        }

        stream_set_timeout($socket, 15);
        $this->readResponse($socket, '220');

        $this->sendCommand($socket, 'EHLO ' . gethostname(), '250');

        if (($this->secure === 'tls' || $this->port === 587) && $protocol === 'tcp://') {
            $this->sendCommand($socket, 'STARTTLS', '220');
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
                throw new RuntimeException("TLS negotiation failed with SMTP server");
            }
            $this->sendCommand($socket, 'EHLO ' . gethostname(), '250');
        }

        $this->sendCommand($socket, 'AUTH LOGIN', '334');
        $this->sendCommand($socket, base64_encode($this->user), '334');
        $this->sendCommand($socket, base64_encode($this->password), '235');

        $this->sendCommand($socket, "MAIL FROM:<{$this->fromEmail}>", '250');
        $this->sendCommand($socket, "RCPT TO:<{$toEmail}>", '250');
        $this->sendCommand($socket, 'DATA', '354');

        $boundary = '=_hambak_' . md5((string) microtime(true));

        $headers = [
            "Date: " . date('r'),
            "From: {$this->fromName} <{$this->fromEmail}>",
            "To: <{$toEmail}>",
            "Reply-To: <{$this->replyTo}>",
            "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
            "MIME-Version: 1.0",
            "Content-Type: multipart/alternative; boundary=\"{$boundary}\"",
            "X-Mailer: HambakTech Platform Engine v1.0",
        ];

        $messageBody = implode("\r\n", $headers) . "\r\n\r\n";
        $messageBody .= "--{$boundary}\r\n";
        $messageBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $messageBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $messageBody .= chunk_split(base64_encode($textBody)) . "\r\n";

        $messageBody .= "--{$boundary}\r\n";
        $messageBody .= "Content-Type: text/html; charset=UTF-8\r\n";
        $messageBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $messageBody .= chunk_split(base64_encode($htmlBody)) . "\r\n";
        $messageBody .= "--{$boundary}--\r\n";

        // Dot termination
        $this->sendCommand($socket, $messageBody . "\r\n.", '250');
        $this->sendCommand($socket, 'QUIT', '221');

        fclose($socket);
        return true;
    }

    private function sendCommand($socket, string $command, string $expectedCode): void
    {
        fwrite($socket, $command . "\r\n");
        $this->readResponse($socket, $expectedCode);
    }

    private function readResponse($socket, string $expectedCode): string
    {
        $response = '';
        while (!feof($socket)) {
            $line = fgets($socket, 512);
            if ($line === false) {
                break;
            }
            $response .= $line;
            // Check if end of multiline response (code followed by space)
            if (preg_match('/^[0-9]{3} /', $line)) {
                break;
            }
        }

        $code = substr(trim($response), 0, 3);
        if ($code !== $expectedCode) {
            throw new RuntimeException("SMTP unexpected response: expected {$expectedCode}, received: {$response}");
        }
        return $response;
    }

    // ---------------------------------------------------------------------
    // BRANDED TEMPLATE BUILDERS
    // ---------------------------------------------------------------------

    private function wrapHtmlTemplate(string $title, string $contentHtml): string
    {
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{$title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .header { background: #1b2559; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 4px 0 0; color: #94a3b8; font-size: 12px; }
    .body { padding: 32px 28px; }
    .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; color: #2563eb; letter-spacing: 8px; margin: 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #dbeafe; color: #1e40af; }
    .footer { background: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6; text-align: center; }
    .button { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>HAMBAKTECH & SERVICES</h1>
      <p>Smart Digital Platform | Ibeju-Lekki, Lagos</p>
    </div>
    <div class="body">
      {$contentHtml}
    </div>
    <div class="footer">
      <p><strong>HambakTech & Services</strong><br>Suite 4, Eleko Junction Commercial Plaza, Ibeju-Lekki, Lagos, Nigeria<br>Support: support@hambaktech.com.ng | Phone: +234 814 783 7664</p>
      <p style="margin-top: 8px; font-size: 10px; color: #94a3b8;">This is an automated system notification. If you did not initiate this request, please contact our security desk immediately.</p>
    </div>
  </div>
</body>
</html>
HTML;
    }

    // ---------------------------------------------------------------------
    // PHASE 6: FORGOT PASSWORD + OTP EMAIL
    // ---------------------------------------------------------------------
    public function sendPasswordResetOtp(string $email, string $otp, string $name = 'Valued Customer', int $expiresInMinutes = 15): bool
    {
        $subject = "Your HambakTech Password Reset Code: {$otp}";
        $content = <<<HTML
<span class="badge">Security Authentication</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">Password Recovery Request</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Hello <strong>{$name}</strong>,</p>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">We received a request to reset the password for your HambakTech account. Enter the verification code below on the password recovery screen to complete your reset:</p>

<div class="otp-box">
  <div class="otp-code">{$otp}</div>
  <p style="margin: 8px 0 0; font-size: 12px; color: #64748b;">This code expires in <strong>{$expiresInMinutes} minutes</strong>.</p>
</div>

<p style="font-size: 12px; line-height: 1.6; color: #dc2626; background: #fef2f2; border: 1px solid #fee2e2; padding: 12px; border-radius: 8px;">
  <strong>Security Warning:</strong> Never share this code with anyone, including HambakTech staff. Our team will never ask for your verification code over the phone or via email.
</p>
<p style="font-size: 12px; color: #64748b; margin-top: 16px;">If you did not request this code, your account password has not been changed. You can safely disregard this email.</p>
HTML;

        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    // ---------------------------------------------------------------------
    // PHASE 8: SUPPORT & CONTACT DESK EMAILS
    // ---------------------------------------------------------------------
    public function sendSupportAcknowledgement(string $email, string $name, string $ticketNumber, string $inquirySubject): bool
    {
        $subject = "[{$ticketNumber}] Support Inquiry Received: {$inquirySubject}";
        $content = <<<HTML
<span class="badge">Customer Support Desk</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">We Have Received Your Inquiry</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Hello <strong>{$name}</strong>,</p>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Thank you for contacting HambakTech & Services. Your inquiry has been registered in our support desk with reference number <strong>{$ticketNumber}</strong>.</p>

<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
  <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">Reference Number: <strong style="color: #0f172a;">{$ticketNumber}</strong></p>
  <p style="margin: 0; font-size: 12px; color: #64748b;">Subject: <strong style="color: #0f172a;">{$inquirySubject}</strong></p>
</div>

<p style="font-size: 13px; line-height: 1.6; color: #334155;">Our support team in Ibeju-Lekki is reviewing your inquiry. A representative will get back to you shortly with a resolution or update.</p>
HTML;

        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendSupportStaffNotification(string $ticketNumber, string $customerName, string $customerEmail, string $inquirySubject, string $message): bool
    {
        $subject = "[ADMIN ALERT] [{$ticketNumber}] New Inquiry from {$customerName}";
        $adminEmail = Env::get('SUPPORT_NOTIFY_EMAIL', 'support@hambaktech.com.ng') ?? 'support@hambaktech.com.ng';
        $content = <<<HTML
<span class="badge" style="background: #fef3c7; color: #92400e;">Staff Desk Alert</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">New Customer Inquiry ({$ticketNumber})</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">A new inquiry has been submitted through the public website:</p>

<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px;">
  <p style="margin: 0 0 6px;"><strong>Customer:</strong> {$customerName} ({$customerEmail})</p>
  <p style="margin: 0 0 6px;"><strong>Ticket Ref:</strong> {$ticketNumber}</p>
  <p style="margin: 0 0 12px;"><strong>Subject:</strong> {$inquirySubject}</p>
  <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 8px 0;">
  <p style="margin: 0; white-space: pre-wrap; color: #1e293b;">{$message}</p>
</div>
HTML;

        return $this->send($adminEmail, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendSupportReply(string $email, string $name, string $ticketNumber, string $replyContent): bool
    {
        $subject = "[Update {$ticketNumber}] Response to Your HambakTech Support Ticket";
        $content = <<<HTML
<span class="badge">Support Desk Update</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">Staff Response on Ticket #{$ticketNumber}</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Hello <strong>{$name}</strong>,</p>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Our operations team has provided an update regarding your inquiry:</p>

<div style="background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px; padding: 16px; margin: 16px 0; font-size: 13px; line-height: 1.6; color: #1e3a8a;">
  {$replyContent}
</div>

<p style="font-size: 13px; line-height: 1.6; color: #334155;">You can reply directly to this email or visit your customer dashboard to continue the conversation.</p>
HTML;

        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    // ---------------------------------------------------------------------
    // PHASE 9: SYSTEM NOTIFICATION EVENTS
    // ---------------------------------------------------------------------
    public function sendEmailVerification(string $email, string $token, string $name = 'User'): bool
    {
        $subject = "Verify Your HambakTech Account";
        $appUrl = Env::get('NEXT_PUBLIC_APP_URL', 'https://hambaktech.com.ng') ?? 'https://hambaktech.com.ng';
        $link = "{$appUrl}/verify-email?token=" . urlencode($token);
        $content = <<<HTML
<span class="badge">Account Verification</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">Welcome to HambakTech</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Hello <strong>{$name}</strong>,</p>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Thank you for creating your account. Please click the button below to verify your email address:</p>
<p style="text-align: center;"><a href="{$link}" class="button">Verify Email Address</a></p>
<p style="font-size: 11px; color: #64748b; word-break: break-all;">Or copy and paste this link in your browser:<br>{$link}</p>
HTML;
        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendWelcomeEmail(string $email, string $name): bool
    {
        $subject = "Welcome to HambakTech & Services!";
        $content = <<<HTML
<span class="badge">Registration Complete</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">Your Digital Business Account is Ready</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Hello <strong>{$name}</strong>,</p>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Welcome to the HambakTech Smart Digital Platform. Your personal wallet has been initialized, allowing you to access instant VTU airtime/data top-ups, NIN operations, CAC corporate filings, printing orders, and Academy courses.</p>
HTML;
        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendOrderConfirmation(string $email, array $order): bool
    {
        $orderNumber = $order['orderNumber'] ?? $order['order_number'] ?? 'HT-ORD';
        $title = $order['title'] ?? 'Service Order';
        $amount = number_format((float)($order['totalAmount'] ?? $order['total_amount'] ?? 0), 2);
        $subject = "[Confirmed] Order #{$orderNumber} - {$title}";
        $content = <<<HTML
<span class="badge">Order Confirmed</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">Order Successfully Placed</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Your order <strong>#{$orderNumber}</strong> for <strong>{$title}</strong> has been received and confirmed.</p>
<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px;">
  <p style="margin: 0 0 6px;"><strong>Total Paid:</strong> ₦{$amount}</p>
  <p style="margin: 0;"><strong>Status:</strong> Processing</p>
</div>
HTML;
        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendWalletFundingConfirmation(string $email, array $transaction): bool
    {
        $amount = number_format((float)($transaction['amount'] ?? 0), 2);
        $ref = $transaction['reference'] ?? 'HT-REF';
        $subject = "Wallet Credited: ₦{$amount}";
        $content = <<<HTML
<span class="badge">Wallet Credited</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">Funds Added to Your Wallet</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Your digital wallet has been successfully funded with <strong>₦{$amount}</strong>.</p>
<p style="font-size: 12px; color: #64748b;">Transaction Reference: <strong>{$ref}</strong></p>
HTML;
        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendServiceOrderUpdate(string $email, array $order): bool
    {
        $orderNumber = $order['orderNumber'] ?? $order['order_number'] ?? 'HT-ORD';
        $status = $order['status'] ?? 'UPDATED';
        $subject = "Order #{$orderNumber} Status Update: {$status}";
        $content = <<<HTML
<span class="badge">Status Update</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">Order #{$orderNumber} is {$status}</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Your order workflow has transitioned to <strong>{$status}</strong>. Please check your dashboard for full tracking details.</p>
HTML;
        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendAcademyEnrollment(string $email, array $enrollment): bool
    {
        $courseTitle = $enrollment['courseTitle'] ?? 'Academy Course';
        $regNumber = $enrollment['studentRegNumber'] ?? 'HT-STD';
        $subject = "Academy Enrollment Confirmed: {$courseTitle}";
        $content = <<<HTML
<span class="badge">Academy Admission</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">You Are Enrolled in {$courseTitle}</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Congratulations on your admission! Your Student Registration Number is <strong>{$regNumber}</strong>.</p>
HTML;
        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendCertificateNotification(string $email, array $cert): bool
    {
        $certNum = $cert['certificateNumber'] ?? 'HT-CERT';
        $subject = "Official Certificate Issued: {$certNum}";
        $content = <<<HTML
<span class="badge">Certificate Issued</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">Your Professional Certificate is Ready</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Your certificate of completion <strong>{$certNum}</strong> has been officially issued and registered in our public verification registry.</p>
HTML;
        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendPaymentConfirmation(string $email, array $payment): bool
    {
        $ref = $payment['reference'] ?? 'PAY-REF';
        $amount = number_format((float)($payment['amount'] ?? 0), 2);
        $subject = "Payment Receipt: ₦{$amount} ({$ref})";
        $content = <<<HTML
<span class="badge">Payment Receipt</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">Payment Successful</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Your payment of <strong>₦{$amount}</strong> has been confirmed under reference <strong>{$ref}</strong>.</p>
HTML;
        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendPaymentFailure(string $email, array $payment, string $reason): bool
    {
        $ref = $payment['reference'] ?? 'PAY-REF';
        $subject = "Payment Unsuccessful ({$ref})";
        $content = <<<HTML
<span class="badge" style="background: #fee2e2; color: #991b1b;">Payment Issue</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">Payment Could Not Be Processed</h2>
<p style="font-size: 13px; line-height: 1.6; color: #334155;">Your transaction attempt <strong>{$ref}</strong> was not successful. Reason: <em>{$reason}</em>.</p>
HTML;
        return $this->send($email, $subject, $this->wrapHtmlTemplate($subject, $content));
    }

    public function sendAdminNotification(string $subject, string $details): bool
    {
        $adminEmail = Env::get('ADMIN_ALERT_EMAIL', 'admin@hambaktech.com.ng') ?? 'admin@hambaktech.com.ng';
        $content = <<<HTML
<span class="badge" style="background: #fee2e2; color: #991b1b;">Admin Alert</span>
<h2 style="font-size: 18px; color: #0f172a; margin: 12px 0 8px;">{$subject}</h2>
<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px;">
  <p style="margin: 0; white-space: pre-wrap; font-family: monospace;">{$details}</p>
</div>
HTML;
        return $this->send($adminEmail, "[ALERT] " . $subject, $this->wrapHtmlTemplate($subject, $content));
    }
}
