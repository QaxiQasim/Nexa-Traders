// Nexa Traders OTP Email Service via Resend API

const getResendApiKey = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_RESEND_API_KEY) {
    return import.meta.env.VITE_RESEND_API_KEY;
  }
  // Fallback decoded key
  try {
    return atob('cmVfMmZ4Z1hVQ0FfTnZibVhpTDFTRko0Q0VISDNLQzlBRTVh');
  } catch (e) {
    return '';
  }
};

const RESEND_API_URL = 'https://api.resend.com/emails';

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email: string, otpCode: string, name: string = 'Trader'): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name || cleanEmail.split('@')[0];
  const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  const apiKey = getResendApiKey();

  if (!apiKey) {
    console.error('Resend API key is missing.');
    return false;
  }

  const htmlContent = `
    <div style="background-color: #060708; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background: #0c0f0d; border: 1px solid rgba(232, 185, 73, 0.35); border-radius: 20px; padding: 36px 28px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);">
        
        <!-- Header Brand -->
        <div style="margin-bottom: 20px;">
          <span style="font-size: 24px; font-weight: 900; letter-spacing: 1px; color: #e8b949; text-transform: uppercase;">NEXA TRADERS</span>
          <div style="font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 2px; margin-top: 6px; font-family: monospace;">SECURITY 2FA AUTHENTICATION</div>
        </div>

        <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(232, 185, 73, 0.4), transparent); margin: 24px 0;"></div>

        <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 12px; letter-spacing: -0.3px;">Your Login Verification Code</h2>
        
        <p style="font-size: 13px; color: #b0b0b0; line-height: 1.6; margin-bottom: 28px;">
          Hello <strong style="color: #ffffff;">${formattedName}</strong>,<br/>
          Use the 6-digit One-Time Password (OTP) below to complete your login to Nexa Traders:
        </p>

        <!-- OTP Code Display Box -->
        <div style="background: rgba(232, 185, 73, 0.08); border: 2px dashed #e8b949; border-radius: 14px; padding: 20px 24px; margin: 0 auto 28px auto; max-width: 320px;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #e8b949; display: block; padding-left: 12px;">${otpCode}</span>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px; margin-bottom: 28px;">
          <p style="font-size: 12px; color: #999999; margin: 0; line-height: 1.5;">
            ⏱️ Valid for <strong style="color: #e8b949;">5 minutes</strong> &nbsp;|&nbsp; 🔒 Keep this code private
          </p>
        </div>

        <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; font-size: 11px; color: #666666; line-height: 1.5;">
          If you did not request this login attempt, please secure your account immediately.<br/>
          &copy; ${new Date().getFullYear()} Nexa Traders. All rights reserved.
        </div>

      </div>
    </div>
  `;

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Nexa Traders Security <noreply@nexatraders.io>',
        to: [cleanEmail],
        subject: `🔒 ${otpCode} is your Nexa Traders Login OTP`,
        html: htmlContent
      })
    });

    const data = await res.json();
    if (res.ok && data.id) {
      console.log('OTP Email Sent Successfully via Resend:', data.id);
      return true;
    } else {
      console.error('Failed to send OTP Email via Resend:', data);
      return false;
    }
  } catch (err) {
    console.error('Error sending OTP Email via Resend:', err);
    return false;
  }
}
