import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { webAuthnService } from '@/lib/webauthn';
import { twoFactorService } from '@/lib/twoFactor';
import { apiRequest } from '@/lib/queryClient';
import { SMSStatusIndicator } from '../components/sms-status-indicator';
import { DemoSuccessSummary } from '../components/demo-success-summary';
import { AndroidSMSDemo } from '../components/android-sms-demo';
import { DeploymentGuide } from '../components/deployment-guide';
import { Fingerprint, Shield, Smartphone, QrCode, CheckCircle, XCircle, MessageSquare, Plus } from 'lucide-react';

function SMSParsingDemo() {
  const { toast } = useToast();
  const [smsMessage, setSmsMessage] = useState('');
  const [smsSender, setSmsSender] = useState('HDFCBK');
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);

  const testSamples = [
    {
      message: "Rs.1500.00 debited from A/c **1234 on 09-Aug-25. UPI Ref 123456789. Swiggy Food Order",
      sender: "HDFCBK",
      expected: "₹1,500 expense in 'food' category"
    },
    {
      message: "Rs.50000.00 credited to your A/c **5678 on 08-Aug-25 at 02:30PM. Salary Transfer from Company Ltd.",
      sender: "ICICIB", 
      expected: "₹50,000 income in 'salary' category"
    },
    {
      message: "Rs.299.00 spent on Netflix subscription via UPI. UPI Ref: 987654321",
      sender: "PAYTM",
      expected: "₹299 expense in 'entertainment' category"
    },
    {
      message: "Payment of Rs.2500.00 made to Amazon via Google Pay on 07-Aug-25",
      sender: "GOOGLEPAY",
      expected: "₹2,500 expense in 'shopping' category"
    }
  ];

  const handleParseSMS = async () => {
    if (!smsMessage.trim()) {
      toast({
        title: "SMS Required",
        description: "Please enter an SMS message to parse",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/sms/parse', {
        message: smsMessage,
        sender: smsSender
      });
      
      const result = await response.json();
      
      if (result.success) {
        setParsedResult(result);
        toast({
          title: "SMS Parsed Successfully",
          description: "Transaction has been created and added to your dashboard",
        });
      } else {
        setParsedResult({ success: false, message: result.message });
        toast({
          title: "Parsing Failed",
          description: result.message || "Could not parse transaction from SMS",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('SMS parsing error:', error);
      toast({
        title: "Parsing Error",
        description: "Failed to process SMS message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: any) => {
    setSmsMessage(sample.message);
    setSmsSender(sample.sender);
    setParsedResult(null);
  };

  const testAllSamples = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sms/test');
      const result = await response.json();
      
      toast({
        title: "Test Complete",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to run SMS parsing test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual SMS Input */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="sms-sender">Bank/Sender ID</Label>
          <Input
            id="sms-sender"
            value={smsSender}
            onChange={(e) => setSmsSender(e.target.value)}
            placeholder="HDFCBK, ICICIB, SBIINB, etc."
          />
        </div>
        
        <div>
          <Label htmlFor="sms-message">SMS Message</Label>
          <Textarea
            id="sms-message"
            value={smsMessage}
            onChange={(e) => setSmsMessage(e.target.value)}
            placeholder="Paste your bank SMS here..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleParseSMS}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Parsing...' : 'Parse SMS & Create Transaction'}
        </Button>
      </div>

      {/* Result Display */}
      {parsedResult && (
        <div className={`p-4 rounded-lg ${
          parsedResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {parsedResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">
              {parsedResult.success ? 'Transaction Created' : 'Parsing Failed'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {parsedResult.message}
          </p>
        </div>
      )}

      {/* Sample Messages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Sample Bank SMS Messages</h4>
          <Button 
            variant="outline" 
            size="sm"
            onClick={testAllSamples}
            disabled={loading}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Test All Samples
          </Button>
        </div>
        
        <div className="space-y-3">
          {testSamples.map((sample, index) => (
            <div key={index} className="p-3 bg-muted rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {sample.sender}
                    </Badge>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground break-words">
                    "{sample.message}"
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Expected: {sample.expected}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadSample(sample)}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SMS Configuration Status */}
      <SMSStatusIndicator 
        status="warning" 
        message="Twilio phone number (+918947819840) needs to be purchased/verified in your Twilio console. SMS parsing works - only sending needs real Twilio number."
      />

      {/* Info Section */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Real-Time SMS Integration
        </h4>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p>• <strong>Android:</strong> Direct SMS access with READ_SMS permission</p>
          <p>• <strong>iOS:</strong> Email parsing + Account Aggregator integration</p>
          <p>• <strong>Web:</strong> Manual input + bank API connections</p>
          <p>• <strong>Supports:</strong> 10+ Indian banks and UPI apps</p>
          <p>• <strong>Auto-categorizes:</strong> Food, transport, shopping, utilities, etc.</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthDemo() {
  const { toast } = useToast();
  const [biometricSupported, setBiometricSupported] = useState<boolean | null>(null);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState('+919876543210');
  const [otpCode, setOtpCode] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [smsVerified, setSmsVerified] = useState(false);
  const [totpVerified, setTotpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check WebAuthn support on component mount
  useState(() => {
    webAuthnService.isSupported().then(setBiometricSupported);
  });

  const handleBiometricRegistration = async () => {
    setLoading(true);
    try {
      const success = await webAuthnService.registerBiometric();
      if (success) {
        setBiometricRegistered(true);
        toast({
          title: "Biometric Registration Successful",
          description: "You can now use fingerprint/face ID to authenticate",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Biometric registration error:', error);
      toast({
        title: "Registration Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    setLoading(true);
    try {
      const success = await webAuthnService.authenticateWithBiometric();
      if (success) {
        toast({
          title: "Authentication Successful",
          description: "Biometric authentication completed",
        });
      } else {
        toast({
          title: "Authentication Failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const { secret, qrCode } = await twoFactorService.setup2FA();
      setTotpSecret(secret);
      setQrCode(qrCode);
      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      toast({
        title: "Setup Error",
        description: "Failed to setup 2FA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    setLoading(true);
    try {
      const verified = await twoFactorService.verifyTOTP(totpToken);
      if (verified) {
        setTotpVerified(true);
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication is now active",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid authenticator code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('TOTP verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    setLoading(true);
    try {
      const sent = await twoFactorService.sendSMSOTP(mobileNumber);
      if (sent) {
        toast({
          title: "SMS Sent",
          description: `Verification code sent to ${mobileNumber}`,
        });
      } else {
        toast({
          title: "SMS Failed",
          description: "Failed to send SMS - check Twilio configuration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('SMS send error:', error);
      toast({
        title: "SMS Error",
        description: "Failed to send SMS",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySMS = async () => {
    setLoading(true);
    try {
      const verified = await twoFactorService.verifySMSOTP(otpCode);
      if (verified) {
        setSmsVerified(true);
        toast({
          title: "SMS Verified",
          description: "Phone number verification successful",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid or expired OTP code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('SMS verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify SMS code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test WebAuthn biometric authentication, 2FA, and SMS OTP features
          </p>
        </div>

        <Tabs defaultValue="biometric" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="biometric" className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4" />
              Biometric
            </TabsTrigger>
            <TabsTrigger value="totp" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              2FA (TOTP)
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              SMS OTP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="biometric">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5" />
                  WebAuthn Biometric Authentication
                </CardTitle>
                <CardDescription>
                  Use Touch ID, Face ID, or Windows Hello for secure authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Browser Support:</Label>
                  {biometricSupported === null ? (
                    <Badge variant="secondary">Checking...</Badge>
                  ) : biometricSupported ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Supported
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Supported
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {!biometricRegistered ? (
                    <Button 
                      onClick={handleBiometricRegistration}
                      disabled={loading || !biometricSupported}
                      className="w-full"
                    >
                      {loading ? 'Registering...' : 'Register Biometric'}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Biometric Registered
                      </Badge>
                      <Button 
                        onClick={handleBiometricAuth}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'Authenticating...' : 'Test Biometric Login'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="totp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  TOTP Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Use Google Authenticator or Authy for 2FA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!qrCode ? (
                  <Button 
                    onClick={handleSetup2FA}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Setting up...' : 'Setup 2FA'}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Scan with your authenticator app
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                        Secret: {totpSecret}
                      </p>
                    </div>

                    {!totpVerified ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="totp-token">Enter 6-digit code from app</Label>
                          <Input
                            id="totp-token"
                            placeholder="123456"
                            value={totpToken}
                            onChange={(e) => setTotpToken(e.target.value)}
                            maxLength={6}
                          />
                        </div>
                        <Button 
                          onClick={handleVerifyTOTP}
                          disabled={loading || totpToken.length !== 6}
                          className="w-full"
                        >
                          {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="default" className="bg-green-500 w-full justify-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        2FA Enabled Successfully
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  SMS OTP Verification
                </CardTitle>
                <CardDescription>
                  Verify your phone number with SMS one-time password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    placeholder="+919876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>

                {!smsVerified ? (
                  <div className="space-y-3">
                    <Button 
                      onClick={handleSendSMS}
                      disabled={loading || !mobileNumber}
                      className="w-full"
                    >
                      {loading ? 'Sending...' : 'Send SMS OTP'}
                    </Button>

                    <div>
                      <Label htmlFor="otp-code">Enter 6-digit OTP</Label>
                      <Input
                        id="otp-code"
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        maxLength={6}
                      />
                    </div>

                    <Button 
                      onClick={handleVerifySMS}
                      disabled={loading || otpCode.length !== 6}
                      className="w-full"
                    >
                      {loading ? 'Verifying...' : 'Verify SMS OTP'}
                    </Button>
                  </div>
                ) : (
                  <Badge variant="default" className="bg-green-500 w-full justify-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    SMS Verified Successfully
                  </Badge>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>SMS Transaction Parsing Demo</CardTitle>
            <CardDescription>
              Test automatic transaction detection from bank SMS messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SMSParsingDemo />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📱 Android Deployment Guide</CardTitle>
            <CardDescription>
              Get Visor running on your Android device - Test SMS parsing now!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeploymentGuide />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🔧 Android SMS Integration</CardTitle>
            <CardDescription>
              Native Android SMS processing - No Twilio costs required!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AndroidSMSDemo />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🎯 Project Status Summary</CardTitle>
            <CardDescription>
              Complete overview of implemented features and next steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DemoSuccessSummary />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}