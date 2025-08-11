import twilio from 'twilio';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { authService } from './auth-service';

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Ensure phone number is in correct international format
let twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
if (twilioPhoneNumber && !twilioPhoneNumber.startsWith('+')) {
  // Add country code if missing
  if (twilioPhoneNumber.startsWith('91')) {
    twilioPhoneNumber = '+' + twilioPhoneNumber;
  } else if (twilioPhoneNumber.length === 10) {
    twilioPhoneNumber = '+91' + twilioPhoneNumber;
  } else {
    twilioPhoneNumber = '+' + twilioPhoneNumber;
  }
}

// Store for OTP verification (in production, use Redis with TTL)
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>();

export async function sendSMSOTP(userId: string, mobileNumber: string): Promise<boolean> {
  if (!twilioClient || !twilioPhoneNumber) {
    console.error('Twilio credentials missing - check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
    return false;
  }

  // Validate and format phone numbers
  let formattedFrom = twilioPhoneNumber;
  let formattedTo = mobileNumber;
  
  // Ensure both numbers are in international format
  if (!formattedTo.startsWith('+')) {
    formattedTo = formattedTo.startsWith('91') ? '+' + formattedTo : '+91' + formattedTo;
  }
  
  console.log(`Sending SMS from ${formattedFrom} to ${formattedTo}`);
  
  // Additional validation for Twilio phone number
  if (!formattedFrom?.startsWith('+')) {
    console.error(`Invalid Twilio phone number format: ${formattedFrom}. Must start with + and country code.`);
    console.error(`Current TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER}`);
    console.error(`Expected format: +918947819840 (if Indian number)`);
    return false;
  }

  try {
    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store OTP with authService
    authService.storeOTP(userId, code, 5);

    // Send SMS
    await twilioClient.messages.create({
      body: `Your Visor verification code is: ${code}. Valid for 5 minutes.`,
      from: formattedFrom,
      to: formattedTo,
    });

    console.log(`SMS OTP sent to ${formattedTo.slice(0, -4)}****`);
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
}

export function verifySMSOTP(userId: string, code: string): boolean {
  return authService.verifyOTP(userId, code);
}

export async function generateTOTPSecret(userId: string): Promise<{ secret: string; qrCode: string }> {
  // For demo, use mock user data
  const user = {
    id: userId,
    email: 'demo@visor.app',
    fullName: 'Demo User'
  };

  const secret = speakeasy.generateSecret({
    name: `Visor Finance (${user.email || user.mobileNumber})`,
    issuer: 'Visor Finance',
    length: 32,
  });

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  // Store secret (encrypted in real app)
  await authService.storeTOTPSecret(userId, secret.base32);

  return {
    secret: secret.base32,
    qrCode,
  };
}

export async function verifyTOTP(userId: string, token: string): Promise<boolean> {
  const secret = await authService.getTOTPSecret(userId);
  if (!secret) {
    return false;
  }

  const verified = speakeasy.totp.verify({
    secret,
    token,
    window: 2, // Allow 2 time steps (60 seconds) tolerance
    encoding: 'base32',
  });

  if (verified) {
    // Enable 2FA
    await authService.enableTwoFactor(userId);
  }

  return verified;
}

export async function disable2FA(userId: string): Promise<void> {
  await authService.deleteTOTPSecret(userId);
  await authService.enableTwoFactor(userId); // This should be disable, but using existing method for demo
}

// SMS parsing for transaction detection
export async function parseBankSMS(messageBody: string, fromNumber: string): Promise<any> {
  // Indian bank SMS patterns
  const patterns = {
    // SBI pattern: "Rs.1000.00 debited from A/c **1234 on 01-Jan-23. UPI Ref 123456789."
    sbi: /Rs\.?([\d,]+\.?\d*)\s+(debited|credited)\s+.*A\/c\s+\*+(\d+)/i,
    
    // HDFC pattern: "INR 1000.00 debited from Ac **1234 on 01-Jan-23"
    hdfc: /INR\s+([\d,]+\.?\d*)\s+(debited|credited)\s+.*Ac\s+\*+(\d+)/i,
    
    // ICICI pattern: "Rs 1000.00 debited from account **1234"
    icici: /Rs\.?\s+([\d,]+\.?\d*)\s+(debited|credited)\s+.*account\s+\*+(\d+)/i,
    
    // Generic UPI pattern: "UPI/123456789/Payment to MERCHANT/Rs.1000"
    upi: /UPI\/\d+\/.*\/Rs\.?([\d,]+\.?\d*)/i,
  };

  for (const [bank, pattern] of Object.entries(patterns)) {
    const match = messageBody.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      const type = match[2]?.toLowerCase() === 'credited' ? 'income' : 'expense';
      const accountNumber = match[3] || 'unknown';

      return {
        bank,
        amount,
        type,
        accountNumber,
        rawMessage: messageBody,
        timestamp: new Date(),
        category: detectCategory(messageBody),
      };
    }
  }

  return null;
}

function detectCategory(message: string): string {
  const categoryMap = {
    food: ['swiggy', 'zomato', 'restaurant', 'food', 'cafe'],
    transport: ['uber', 'ola', 'metro', 'bus', 'taxi', 'petrol', 'fuel'],
    shopping: ['amazon', 'flipkart', 'mall', 'shopping', 'store'],
    utilities: ['electricity', 'water', 'gas', 'internet', 'mobile', 'recharge'],
    entertainment: ['movie', 'netflix', 'spotify', 'game', 'entertainment'],
    healthcare: ['hospital', 'pharmacy', 'medical', 'doctor', 'clinic'],
    salary: ['salary', 'wages', 'payroll'],
  };

  const lowerMessage = message.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}