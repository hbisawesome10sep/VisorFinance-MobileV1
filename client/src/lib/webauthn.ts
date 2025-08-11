import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export class WebAuthnService {
  async registerBiometric(): Promise<boolean> {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Get registration options from server
      const optionsResponse = await fetch('/api/auth/biometric/register/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // Start registration with user's device
      const attResp = await startRegistration(options);

      // Send registration response to server
      const verificationResponse = await fetch('/api/auth/biometric/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attResp),
      });

      if (!verificationResponse.ok) {
        throw new Error('Failed to verify registration');
      }

      const verification = await verificationResponse.json();
      return verification.verified;
    } catch (error) {
      console.error('Biometric registration error:', error);
      throw error;
    }
  }

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Get authentication options from server
      const optionsResponse = await fetch('/api/auth/biometric/authenticate/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // Start authentication with user's device
      const authResp = await startAuthentication(options);

      // Send authentication response to server
      const verificationResponse = await fetch('/api/auth/biometric/authenticate/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResp),
      });

      if (!verificationResponse.ok) {
        throw new Error('Failed to verify authentication');
      }

      const verification = await verificationResponse.json();
      return verification.verified;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      throw error;
    }
  }

  async isSupported(): Promise<boolean> {
    try {
      if (!window.PublicKeyCredential) {
        return false;
      }

      // Check if platform authenticator is available (for biometric)
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
}

export const webAuthnService = new WebAuthnService();