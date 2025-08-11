import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type VerifyAuthenticationResponseOpts,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { authService } from './auth-service';

const rpName = 'Visor Finance';
const rpID = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost';
const origin = `https://${rpID}`;

// Store for challenge verification (in production, use Redis or database)
const challengeStore = new Map<string, string>();

export async function generateBiometricRegistrationOptions(userId: string) {
  // For demo, use mock user data
  const user = {
    id: userId,
    email: 'demo@visor.app',
    fullName: 'Demo User'
  };

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: Buffer.from(userId),
    userName: user.email,
    userDisplayName: user.fullName,
    attestationType: 'none',
    authenticatorSelection: {
      userVerification: 'preferred',
      authenticatorAttachment: 'platform', // For built-in biometric sensors
    },
  });

  // Store challenge for verification
  challengeStore.set(userId, options.challenge);

  return options;
}

export async function verifyBiometricRegistration(
  userId: string,
  response: RegistrationResponseJSON
) {
  const expectedChallenge = challengeStore.get(userId);
  if (!expectedChallenge) {
    throw new Error('Challenge not found');
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (verification.verified && verification.registrationInfo) {
    // Store credential in auth service
    await authService.storeBiometricCredential(userId, {
      credentialID: verification.registrationInfo.credential.id,
      credentialPublicKey: verification.registrationInfo.credentialPublicKey,
      counter: verification.registrationInfo.credential.counter,
    });
    
    // Enable biometric authentication
    await authService.enableBiometric(userId);
    
    challengeStore.delete(userId);
  }

  return verification;
}

export async function generateBiometricAuthenticationOptions(userId: string) {
  const credentials = await authService.getBiometricCredentials(userId);
  
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: credentials.map(cred => ({
      id: cred.credentialID,
      type: 'public-key',
    })),
    userVerification: 'preferred',
  });

  challengeStore.set(userId, options.challenge);
  return options;
}

export async function verifyBiometricAuthentication(
  userId: string,
  response: AuthenticationResponseJSON
) {
  const expectedChallenge = challengeStore.get(userId);
  if (!expectedChallenge) {
    throw new Error('Challenge not found');
  }

  const credential = await authService.getBiometricCredential(userId, response.id);
  if (!credential) {
    throw new Error('Credential not found');
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.credentialID,
      publicKey: credential.credentialPublicKey,
      counter: credential.counter,
    },
  });

  if (verification.verified) {
    // Update counter
    await authService.updateBiometricCredential(userId, response.id, {
      counter: verification.authenticationInfo.newCounter,
    });
    
    challengeStore.delete(userId);
  }

  return verification;
}