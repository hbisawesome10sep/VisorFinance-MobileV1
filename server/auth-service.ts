// Simple authentication service for demo purposes
import { storage } from './storage';

export interface BiometricCredential {
  id: string;
  userId: string;
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
}

export interface TOTPSecret {
  userId: string;
  secret: string;
}

// In-memory storage for demo - in production would use database
const biometricCredentials = new Map<string, BiometricCredential[]>();
const totpSecrets = new Map<string, string>();
const otpCodes = new Map<string, { code: string; expires: number; attempts: number }>();

export class AuthService {
  async storeBiometricCredential(userId: string, credential: any): Promise<void> {
    const userCredentials = biometricCredentials.get(userId) || [];
    userCredentials.push({
      id: Math.random().toString(36),
      userId,
      credentialID: credential.credentialID,
      credentialPublicKey: credential.credentialPublicKey,
      counter: credential.counter,
    });
    biometricCredentials.set(userId, userCredentials);
  }

  async getBiometricCredentials(userId: string): Promise<any[]> {
    return biometricCredentials.get(userId) || [];
  }

  async getBiometricCredential(userId: string, credentialId: string): Promise<any> {
    const userCredentials = biometricCredentials.get(userId) || [];
    return userCredentials.find(cred => cred.credentialID === credentialId);
  }

  async updateBiometricCredential(userId: string, credentialId: string, data: any): Promise<void> {
    const userCredentials = biometricCredentials.get(userId) || [];
    const credential = userCredentials.find(cred => cred.credentialID === credentialId);
    if (credential) {
      credential.counter = data.counter;
    }
  }

  async deleteBiometricCredentials(userId: string): Promise<void> {
    biometricCredentials.delete(userId);
  }

  async storeTOTPSecret(userId: string, secret: string): Promise<void> {
    totpSecrets.set(userId, secret);
  }

  async getTOTPSecret(userId: string): Promise<string | null> {
    return totpSecrets.get(userId) || null;
  }

  async deleteTOTPSecret(userId: string): Promise<void> {
    totpSecrets.delete(userId);
  }

  storeOTP(userId: string, code: string, expiresInMinutes: number = 5): void {
    otpCodes.set(userId, {
      code,
      expires: Date.now() + (expiresInMinutes * 60 * 1000),
      attempts: 0
    });
  }

  verifyOTP(userId: string, code: string): boolean {
    const stored = otpCodes.get(userId);
    if (!stored) return false;

    if (Date.now() > stored.expires) {
      otpCodes.delete(userId);
      return false;
    }

    if (stored.attempts >= 3) {
      otpCodes.delete(userId);
      return false;
    }

    stored.attempts++;

    if (stored.code === code) {
      otpCodes.delete(userId);
      return true;
    }

    return false;
  }

  async enableBiometric(userId: string): Promise<void> {
    await storage.updateSettings(userId, { biometricEnabled: true });
  }

  async enableTwoFactor(userId: string): Promise<void> {
    await storage.updateSettings(userId, { twoFactorEnabled: true });
  }
}

export const authService = new AuthService();