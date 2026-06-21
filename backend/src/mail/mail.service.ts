import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend?: Resend;

  constructor(private readonly config: AppConfigService) {
    if (config.resendApiKey) {
      this.resend = new Resend(config.resendApiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY is not set — verification links will be logged to console only. ' +
          'Add RESEND_API_KEY to .env to send real emails.',
      );
    }
  }

  async sendVerificationEmail(opts: {
    to: string;
    name: string;
    verifyUrl: string;
  }): Promise<void> {
    const from = this.config.smtpFrom;
    const subject = 'Verify your ChainEstate account';
    const html = this.buildVerificationHtml(opts.name, opts.verifyUrl);

    if (!this.resend) {
      this.logger.log(
        `[DEV] Verification email → ${opts.to}\n  Link: ${opts.verifyUrl}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from,
      to: opts.to,
      subject,
      html,
      text: `Welcome to ChainEstate, ${opts.name}!\n\nVerify your email:\n${opts.verifyUrl}\n\nThis link expires in 24 hours.`,
    });

    if (error) {
      // Log but don't throw — registration should still succeed even if the
      // email provider rejects the send (e.g. unverified domain in dev/staging).
      this.logger.error(
        `Resend failed for ${opts.to}: ${error.message} — falling back to console link.`,
      );
      this.logger.log(
        `[DEV FALLBACK] Verification link for ${opts.to}:\n  ${opts.verifyUrl}`,
      );
    }
  }

  private buildVerificationHtml(name: string, verifyUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verify your ChainEstate account</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
          <tr>
            <td style="background:linear-gradient(135deg,#1a3c5e,#2563eb);padding:32px 40px;text-align:center">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px">
                &#x26D3; ChainEstate
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,.75);font-size:14px">
                Blockchain-Powered Real Estate Marketplace
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px">
              <h2 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:600">
                Welcome, ${name}!
              </h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6">
                Thanks for joining ChainEstate. Please verify your email address to activate your account and start exploring properties on the blockchain.
              </p>
              <div style="text-align:center;margin:32px 0">
                <a href="${verifyUrl}"
                   style="display:inline-block;padding:14px 36px;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.3px">
                  Verify Email Address
                </a>
              </div>
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6">
                Or paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;word-break:break-all;font-size:12px;color:#2563eb">
                ${verifyUrl}
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6">
                This link expires in <strong>24 hours</strong>. If you did not create a ChainEstate account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb">
              <p style="margin:0;color:#9ca3af;font-size:12px">
                &copy; 2026 ChainEstate &nbsp;|&nbsp; Blockchain Real Estate Marketplace
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
