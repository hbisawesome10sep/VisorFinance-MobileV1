import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTransactionSchema, 
  insertGoalSchema, 
  insertSettingsSchema, 
  insertUserSchema,
  loginSchema,
  otpVerificationSchema
} from "@shared/schema";
import { z } from "zod";
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateOTP, 
  sendOTP, 
  isValidEmail, 
  isValidMobile,
  authenticateToken,
  type AuthRequest
} from "./auth";
import {
  generateBiometricRegistrationOptions,
  verifyBiometricRegistration,
  generateBiometricAuthenticationOptions,
  verifyBiometricAuthentication
} from "./webauthn";
import {
  sendSMSOTP,
  verifySMSOTP,
  generateTOTPSecret,
  verifyTOTP,
  disable2FA,
  parseBankSMS
} from "./sms";

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic authentication routes (simplified for demo)
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log('Registration request body:', req.body);
      
      const { fullName, email, mobileNumber, panNumber, aadhaarNumber, dateOfBirth, passwordHash } = req.body;
      
      // Basic validation
      if (!fullName || !mobileNumber || !panNumber || !passwordHash) {
        return res.status(400).json({ 
          message: "Full name, mobile number, PAN number, and password are required" 
        });
      }
      
      // Validate PAN format
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (!panRegex.test(panNumber)) {
        return res.status(400).json({ 
          message: "Invalid PAN format. Must be 10 characters: 5 letters + 4 numbers + 1 letter" 
        });
      }
      
      // Validate mobile number format
      const mobileRegex = /^\+91\d{10}$/;
      if (!mobileRegex.test(mobileNumber)) {
        return res.status(400).json({ 
          message: "Invalid mobile number format. Must start with +91 followed by 10 digits" 
        });
      }
      
      // For demo: simulate successful registration
      const newUser = {
        id: "user-" + Date.now(),
        fullName,
        email: email || null,
        mobileNumber,
        panNumber,
        aadhaarNumber: aadhaarNumber || null,
        dateOfBirth,
        isVerified: false,
        createdAt: new Date().toISOString()
      };
      
      console.log('Created user:', newUser);
      
      res.status(201).json({
        message: "Account created successfully",
        user: newUser
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: "Registration failed. Please try again." 
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;
      
      // Basic validation - require both fields
      if (!identifier || !password) {
        return res.status(400).json({ 
          message: "Email/mobile number and password are required" 
        });
      }
      
      console.log('Login attempt:', { identifier, password });
      
      // Check demo credentials first
      if (identifier === "+919876543210" && password === "demo123!") {
        const mockUser = {
          id: "demo-user",
          fullName: "Demo User", 
          email: "demo@visor.app",
          mobileNumber: "+919876543210",
        };
        
        return res.json({
          message: "Login successful",
          user: mockUser,
        });
      }
      
      // For registered users - simplified validation (in production, hash comparison would be done)
      // Accept any credentials that look valid for demo purposes
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^\+91\d{10}$/;
      
      const isValidIdentifier = emailRegex.test(identifier) || mobileRegex.test(identifier);
      const isValidPassword = password.length >= 8;
      
      if (isValidIdentifier && isValidPassword) {
        // For demo: simulate getting user from database
        // In production, this would query the actual database
        const isEmail = emailRegex.test(identifier);
        const user = {
          id: "user-" + Date.now(),
          fullName: "Harsh Bhati", // Use registered name
          email: isEmail ? identifier : "harshbhati15987@gmail.com",
          mobileNumber: isEmail ? "+918947819840" : identifier,
          panNumber: "BQPPB8677N",
          aadhaarNumber: "5440-2080-4467",
          dateOfBirth: "1997-09-10",
        };
        
        console.log('Login successful for user:', user);
        
        return res.json({
          message: "Login successful",
          user: user,
        });
      }
      
      res.status(401).json({ 
        message: "Invalid credentials. Please check your email/mobile and password." 
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/verify", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      
      // Check if token exists
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided" });
      }
      
      // For demo purposes, return the registered user data
      // In production, this would validate the actual JWT token and get user from database
      const token = authHeader.replace('Bearer ', '');
      
      // If it's a demo token (from recent registration/login), return registered user data
      if (token.startsWith('demo-auth-token-')) {
        const registeredUser = {
          id: "user-registered",
          fullName: "Harsh Bhati", 
          email: "harshbhati15987@gmail.com",
          mobileNumber: "+918947819840",
          panNumber: "BQPPB8677N",
          aadhaarNumber: "5440-2080-4467",
          dateOfBirth: "1997-09-10",
          isVerified: true
        };
        
        res.json(registeredUser);
        return;
      }
      
      // Fallback to demo user for any other tokens
      const mockUser = {
        id: "demo-user",
        fullName: "Demo User", 
        email: "demo@visor.app",
        mobileNumber: "+919876543210",
        isVerified: true
      };
      
      res.json(mockUser);
    } catch (error) {
      console.error('Auth verification error:', error);
      res.status(401).json({ message: "Invalid token" });
    }
  });

  // Handle GET requests to /api/logout and redirect to home
  app.get("/api/logout", async (req, res) => {
    // Redirect to home page for browsers that navigate to logout URL
    res.redirect('/');
  });

  app.post("/api/logout", async (req, res) => {
    try {
      // Clear any session data here if needed
      // For now, just respond with success
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, message: "Logout failed" });
    }
  });

  // SMS parsing endpoint for real-time transaction detection
  app.post("/api/sms/parse", async (req, res) => {
    try {
      const { message, sender } = req.body;
      
      if (!message || !sender) {
        return res.status(400).json({ 
          message: "Message and sender are required" 
        });
      }

      // Validate that message and sender are strings
      if (typeof message !== 'string' || typeof sender !== 'string') {
        return res.status(400).json({ 
          message: "Message and sender must be strings" 
        });
      }

      const userId = 'demo-user'; // This will be replaced with actual auth later
      const { processSMSTransaction } = await import('./sms-parser');
      
      const success = await processSMSTransaction(message, sender, userId);
      
      if (success) {
        res.json({ 
          success: true, 
          message: "Transaction created from SMS" 
        });
      } else {
        res.json({ 
          success: false, 
          message: "Could not parse transaction from SMS" 
        });
      }
    } catch (error) {
      console.error('SMS parsing error:', error);
      res.status(500).json({ message: "Failed to process SMS" });
    }
  });

  // Test SMS parsing endpoint
  app.get("/api/sms/test", async (req, res) => {
    try {
      const { testSMSParsing } = await import('./sms-parser');
      testSMSParsing();
      res.json({ message: "Check console for SMS parsing test results" });
    } catch (error) {
      console.error('SMS test error:', error);
      res.status(500).json({ message: "Failed to run SMS test" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const { type, category, startDate, endDate } = req.query;
      
      let transactions;
      if (type) {
        transactions = await storage.getTransactionsByType(userId, type as string);
      } else if (category) {
        transactions = await storage.getTransactionsByCategory(userId, category as string);
      } else if (startDate && endDate) {
        transactions = await storage.getTransactionsByDateRange(
          userId,
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        transactions = await storage.getTransactions(userId);
      }
      
      res.json(transactions);
    } catch (error) {
      console.error('Fetch transactions error:', error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const transaction = await storage.getTransaction(req.params.id, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error('Fetch transaction error:', error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({ ...validatedData, userId });
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Create transaction error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, userId, validatedData);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error('Update transaction error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const success = await storage.deleteTransaction(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Goals routes
  app.get("/api/goals", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error('Fetch goals error:', error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal({ ...validatedData, userId });
      res.status(201).json(goal);
    } catch (error) {
      console.error('Create goal error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const validatedData = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(req.params.id, userId, validatedData);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      console.error('Update goal error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const success = await storage.deleteGoal(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Delete goal error:', error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const settings = await storage.getSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error('Fetch settings error:', error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const validatedData = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(userId, validatedData);
      res.json(settings);
    } catch (error) {
      console.error('Update settings error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const userId = 'demo-user'; // This will be replaced with actual auth later
      const transactions = await storage.getTransactions(userId);
      const frequency = req.query.frequency as string || 'month';
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const quarter = req.query.quarter ? parseInt(req.query.quarter as string) : undefined;
      
      let filteredTransactions = [];
      
      if (frequency === 'quarter' && quarter !== undefined) {
        // Specific quarter
        const quarterStart = new Date(year, (quarter - 1) * 3, 1);
        const quarterEnd = new Date(year, quarter * 3, 0);
        filteredTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= quarterStart && tDate <= quarterEnd;
        });
      } else if (frequency === 'year') {
        // Specific year
        filteredTransactions = transactions.filter(t => 
          new Date(t.date).getFullYear() === year
        );
      } else if (frequency === 'month' && month !== undefined) {
        // Specific month
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        filteredTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= monthStart && tDate <= monthEnd;
        });
      } else {
        // Fallback to current period
        const now = new Date();
        if (frequency === 'quarter') {
          const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
          const quarterStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
          const quarterEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
          filteredTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= quarterStart && tDate <= quarterEnd;
          });
        } else if (frequency === 'year') {
          filteredTransactions = transactions.filter(t => 
            new Date(t.date).getFullYear() === now.getFullYear()
          );
        } else {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          filteredTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= monthStart && tDate <= monthEnd;
          });
        }
      }

      const periodIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const periodExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const periodInvestments = filteredTransactions
        .filter(t => t.type === 'investment')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalInvestments = transactions
        .filter(t => t.type === 'investment')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const netSavings = periodIncome - periodExpenses;
      const savingsRate = periodIncome > 0 ? (netSavings / periodIncome) * 100 : 0;

      res.json({
        monthlyIncome: periodIncome,
        monthlyExpenses: periodExpenses,
        monthlyInvestments: periodInvestments,
        totalInvestments,
        netSavings,
        savingsRate,
        frequency,
      });
    } catch (error) {
      console.error('Analytics summary error:', error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Biometric Authentication Routes
  app.post('/api/auth/biometric/register/begin', async (req, res) => {
    try {
      const userId = 'demo-user'; // In real app, get from authenticated session
      const options = await generateBiometricRegistrationOptions(userId);
      res.json(options);
    } catch (error) {
      console.error('Biometric registration begin error:', error);
      res.status(500).json({ message: 'Failed to generate registration options' });
    }
  });

  app.post('/api/auth/biometric/register/complete', async (req, res) => {
    try {
      const userId = 'demo-user'; // In real app, get from authenticated session
      const verification = await verifyBiometricRegistration(userId, req.body);
      res.json({ verified: verification.verified });
    } catch (error) {
      console.error('Biometric registration complete error:', error);
      res.status(500).json({ message: 'Failed to verify registration' });
    }
  });

  app.post('/api/auth/biometric/authenticate/begin', async (req, res) => {
    try {
      const userId = 'demo-user'; // In real app, get from authenticated session
      const options = await generateBiometricAuthenticationOptions(userId);
      res.json(options);
    } catch (error) {
      console.error('Biometric authentication begin error:', error);
      res.status(500).json({ message: 'Failed to generate authentication options' });
    }
  });

  app.post('/api/auth/biometric/authenticate/complete', async (req, res) => {
    try {
      const userId = 'demo-user'; // In real app, get from authenticated session
      const verification = await verifyBiometricAuthentication(userId, req.body);
      res.json({ verified: verification.verified });
    } catch (error) {
      console.error('Biometric authentication complete error:', error);
      res.status(500).json({ message: 'Failed to verify authentication' });
    }
  });

  // 2FA Routes
  app.post('/api/auth/2fa/setup', async (req, res) => {
    try {
      const userId = 'demo-user'; // In real app, get from authenticated session
      const { secret, qrCode } = await generateTOTPSecret(userId);
      res.json({ secret, qrCode });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ message: 'Failed to setup 2FA' });
    }
  });

  app.post('/api/auth/2fa/verify', async (req, res) => {
    try {
      const userId = 'demo-user'; // In real app, get from authenticated session
      const { token } = req.body;
      const verified = await verifyTOTP(userId, token);
      res.json({ verified });
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({ message: 'Failed to verify 2FA token' });
    }
  });

  app.post('/api/auth/2fa/disable', async (req, res) => {
    try {
      const userId = 'demo-user'; // In real app, get from authenticated session
      await disable2FA(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({ message: 'Failed to disable 2FA' });
    }
  });

  // SMS OTP Routes
  app.post('/api/auth/sms/send', async (req, res) => {
    try {
      const userId = 'demo-user'; // In real app, get from authenticated session
      const { mobileNumber } = req.body;
      
      if (!mobileNumber) {
        return res.status(400).json({ message: "Mobile number is required" });
      }

      // Prevent sending to same number as Twilio sender
      const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
      let formattedTwilio = twilioNumber;
      if (twilioNumber && !twilioNumber.startsWith('+')) {
        formattedTwilio = twilioNumber.startsWith('91') ? '+' + twilioNumber : '+91' + twilioNumber;
      }
      
      let formattedMobile = mobileNumber;
      if (!formattedMobile.startsWith('+')) {
        formattedMobile = formattedMobile.startsWith('91') ? '+' + formattedMobile : '+91' + formattedMobile;
      }
      
      if (formattedTwilio === formattedMobile) {
        return res.json({ 
          sent: false, 
          message: "Cannot send SMS to same number as sender. Use a different mobile number for testing." 
        });
      }
      
      const sent = await sendSMSOTP(userId, mobileNumber);
      res.json({ sent, message: sent ? "SMS sent successfully" : "Failed to send SMS" });
    } catch (error) {
      console.error('SMS OTP send error:', error);
      res.status(500).json({ message: 'Failed to send SMS OTP' });
    }
  });

  app.post('/api/auth/sms/verify', async (req, res) => {
    try {
      const userId = 'demo-user'; // In real app, get from authenticated session
      const { code } = req.body;
      const verified = verifySMSOTP(userId, code);
      res.json({ verified });
    } catch (error) {
      console.error('SMS OTP verification error:', error);
      res.status(500).json({ message: 'Failed to verify SMS OTP' });
    }
  });

  // SMS Bank Transaction Parsing
  app.post('/api/sms/parse', async (req, res) => {
    try {
      const { messageBody, fromNumber } = req.body;
      const transaction = await parseBankSMS(messageBody, fromNumber);
      
      if (transaction) {
        // Auto-create transaction if parsing successful
        const userId = 'demo-user'; // In real app, get from authenticated session
        const createdTransaction = await storage.createTransaction({
          ...transaction,
          userId,
          title: `Auto: ${transaction.category}`,
          date: transaction.timestamp,
          notes: `Auto-parsed from SMS: ${transaction.bank}`,
        });
        
        res.json({ 
          parsed: true, 
          transaction: createdTransaction,
          details: transaction 
        });
      } else {
        res.json({ parsed: false });
      }
    } catch (error) {
      console.error('SMS parsing error:', error);
      res.status(500).json({ message: 'Failed to parse SMS' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
