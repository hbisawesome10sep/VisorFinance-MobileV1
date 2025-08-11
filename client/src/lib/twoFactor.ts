export class TwoFactorService {
  async setup2FA(): Promise<{ secret: string; qrCode: string }> {
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to setup 2FA');
      }

      return await response.json();
    } catch (error) {
      console.error('2FA setup error:', error);
      throw error;
    }
  }

  async verifyTOTP(token: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify 2FA token');
      }

      const result = await response.json();
      return result.verified;
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  }

  async disable2FA(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to disable 2FA');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('2FA disable error:', error);
      throw error;
    }
  }

  async sendSMSOTP(mobileNumber: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS OTP');
      }

      const result = await response.json();
      return result.sent;
    } catch (error) {
      console.error('SMS OTP send error:', error);
      throw error;
    }
  }

  async verifySMSOTP(code: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/sms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify SMS OTP');
      }

      const result = await response.json();
      return result.verified;
    } catch (error) {
      console.error('SMS OTP verification error:', error);
      throw error;
    }
  }
}

export const twoFactorService = new TwoFactorService();