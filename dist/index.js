var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  biometricCredentials: () => biometricCredentials,
  goals: () => goals,
  insertGoalSchema: () => insertGoalSchema,
  insertSettingsSchema: () => insertSettingsSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  investmentCategories: () => investmentCategories,
  investmentRecommendations: () => investmentRecommendations,
  loginSchema: () => loginSchema,
  otpVerificationSchema: () => otpVerificationSchema,
  sessions: () => sessions,
  settings: () => settings,
  transactions: () => transactions,
  twoFactorSecrets: () => twoFactorSecrets,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, sessions, transactions, goals, settings, investmentCategories, investmentRecommendations, biometricCredentials, twoFactorSecrets, insertTransactionSchema, insertGoalSchema, insertSettingsSchema, insertUserSchema, loginSchema, otpVerificationSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      fullName: text("full_name").notNull(),
      email: text("email").unique(),
      mobileNumber: text("mobile_number").unique().notNull(),
      panNumber: text("pan_number").unique(),
      aadhaarNumber: text("aadhaar_number"),
      dateOfBirth: timestamp("date_of_birth"),
      passwordHash: text("password_hash").notNull(),
      isVerified: boolean("is_verified").default(false),
      otpCode: text("otp_code"),
      otpExpiry: timestamp("otp_expiry"),
      createdAt: timestamp("created_at").default(sql`now()`),
      updatedAt: timestamp("updated_at").default(sql`now()`)
    });
    sessions = pgTable("sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id).notNull(),
      token: text("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      createdAt: timestamp("created_at").default(sql`now()`)
    });
    transactions = pgTable("transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id).notNull(),
      type: text("type").notNull(),
      // 'income' | 'expense' | 'investment'
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      title: text("title").notNull(),
      category: text("category").notNull(),
      date: timestamp("date").notNull(),
      notes: text("notes"),
      isRecurring: boolean("is_recurring").default(false),
      recurrenceFrequency: text("recurrence_frequency"),
      // 'weekly' | 'monthly'
      recurrenceCount: integer("recurrence_count"),
      isSplit: boolean("is_split").default(false),
      splitCount: integer("split_count"),
      splitWith: text("split_with").array(),
      createdAt: timestamp("created_at").default(sql`now()`)
    });
    goals = pgTable("goals", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id).notNull(),
      name: text("name").notNull(),
      targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
      currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
      targetDate: timestamp("target_date"),
      category: text("category").notNull(),
      // 'emergency' | 'travel' | 'home' | 'retirement'
      createdAt: timestamp("created_at").default(sql`now()`)
    });
    settings = pgTable("settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id).notNull(),
      theme: text("theme").default("light"),
      // 'light' | 'dark'
      currency: text("currency").default("INR"),
      savingsTarget: integer("savings_target").default(30),
      // percentage
      biometricEnabled: boolean("biometric_enabled").default(false),
      smsParsingEnabled: boolean("sms_parsing_enabled").default(true),
      twoFactorEnabled: boolean("two_factor_enabled").default(false),
      emailNotifications: boolean("email_notifications").default(true),
      pushNotifications: boolean("push_notifications").default(true),
      dataExportEnabled: boolean("data_export_enabled").default(true),
      riskTolerance: text("risk_tolerance").default("moderate"),
      // 'conservative' | 'moderate' | 'aggressive'
      investmentStrategy: text("investment_strategy").default("balanced"),
      // 'conservative' | 'balanced' | 'growth' | 'aggressive'
      autoInvestEnabled: boolean("auto_invest_enabled").default(false),
      autoInvestAmount: decimal("auto_invest_amount", { precision: 10, scale: 2 }).default("0"),
      createdAt: timestamp("created_at").default(sql`now()`)
    });
    investmentCategories = pgTable("investment_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description"),
      riskLevel: text("risk_level").notNull(),
      // 'low' | 'medium' | 'high'
      expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }),
      createdAt: timestamp("created_at").default(sql`now()`)
    });
    investmentRecommendations = pgTable("investment_recommendations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id).notNull(),
      categoryId: varchar("category_id").references(() => investmentCategories.id).notNull(),
      recommendedAmount: decimal("recommended_amount", { precision: 10, scale: 2 }).notNull(),
      reason: text("reason").notNull(),
      priority: integer("priority").default(1),
      // 1 = high, 2 = medium, 3 = low
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(sql`now()`)
    });
    biometricCredentials = pgTable("biometric_credentials", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id).notNull(),
      credentialID: text("credential_id").notNull().unique(),
      credentialPublicKey: text("credential_public_key").notNull(),
      counter: integer("counter").default(0),
      createdAt: timestamp("created_at").default(sql`now()`)
    });
    twoFactorSecrets = pgTable("two_factor_secrets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id).notNull().unique(),
      secret: text("secret").notNull(),
      createdAt: timestamp("created_at").default(sql`now()`)
    });
    insertTransactionSchema = createInsertSchema(transactions).omit({
      id: true,
      userId: true,
      createdAt: true
    }).extend({
      amount: z.coerce.number().min(1, "Amount must be at least \u20B91"),
      type: z.enum(["income", "expense", "investment"]),
      date: z.coerce.date(),
      recurrenceFrequency: z.enum(["weekly", "monthly"]).optional(),
      recurrenceCount: z.coerce.number().min(2).max(299).optional(),
      splitCount: z.coerce.number().min(2).max(50).optional()
    });
    insertGoalSchema = createInsertSchema(goals).omit({
      id: true,
      userId: true,
      createdAt: true
    }).extend({
      targetAmount: z.coerce.number().min(1),
      currentAmount: z.coerce.number().min(0).optional(),
      targetDate: z.coerce.date().optional()
    });
    insertSettingsSchema = createInsertSchema(settings).omit({
      id: true,
      createdAt: true
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      otpCode: true,
      otpExpiry: true,
      isVerified: true
    }).extend({
      fullName: z.string().min(2, "Full name must be at least 2 characters"),
      email: z.string().email("Invalid email format").optional(),
      mobileNumber: z.string().regex(/^\+91\d{10}$/, "Mobile number must be 10 digits with +91 prefix"),
      panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN must be 10 characters: 5 letters + 4 numbers + 1 letter"),
      aadhaarNumber: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Aadhaar must be 12 digits with dashes (xxxx-xxxx-xxxx)").optional(),
      dateOfBirth: z.date().max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1e3), "Must be at least 18 years old"),
      passwordHash: z.string().min(8, "Password must be at least 8 characters")
    });
    loginSchema = z.object({
      identifier: z.string().min(1, "Email or mobile number is required"),
      password: z.string().min(1, "Password is required"),
      loginMethod: z.enum(["password", "otp"]).default("password")
    });
    otpVerificationSchema = z.object({
      identifier: z.string().min(1, "Email or mobile number is required"),
      otp: z.string().length(6, "OTP must be 6 digits")
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, or, and, gte, lte } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // Users
      async getUserByEmailOrMobile(identifier) {
        const [user] = await db.select().from(users).where(or(eq(users.email, identifier), eq(users.mobileNumber, identifier))).limit(1);
        return user;
      }
      async getUserById(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return user;
      }
      async createUser(user) {
        const [newUser] = await db.insert(users).values(user).returning();
        return newUser;
      }
      async updateUser(id, userData) {
        const [updatedUser] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
        return updatedUser;
      }
      // Transactions
      async getTransactions(userId) {
        return await db.select().from(transactions).where(eq(transactions.userId, userId));
      }
      async getTransaction(id, userId) {
        const [transaction] = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId))).limit(1);
        return transaction;
      }
      async createTransaction(transaction) {
        const [newTransaction] = await db.insert(transactions).values(transaction).returning();
        return newTransaction;
      }
      async updateTransaction(id, userId, transactionData) {
        const [updatedTransaction] = await db.update(transactions).set(transactionData).where(and(eq(transactions.id, id), eq(transactions.userId, userId))).returning();
        return updatedTransaction;
      }
      async deleteTransaction(id, userId) {
        const result = await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
        return result.rowCount > 0;
      }
      async getTransactionsByDateRange(userId, startDate, endDate) {
        return await db.select().from(transactions).where(and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        ));
      }
      async getTransactionsByType(userId, type) {
        return await db.select().from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.type, type)));
      }
      async getTransactionsByCategory(userId, category) {
        return await db.select().from(transactions).where(and(eq(transactions.userId, userId), eq(transactions.category, category)));
      }
      // Goals
      async getGoals(userId) {
        return await db.select().from(goals).where(eq(goals.userId, userId));
      }
      async getGoal(id, userId) {
        const [goal] = await db.select().from(goals).where(and(eq(goals.id, id), eq(goals.userId, userId))).limit(1);
        return goal;
      }
      async createGoal(goal) {
        const [newGoal] = await db.insert(goals).values(goal).returning();
        return newGoal;
      }
      async updateGoal(id, userId, goalData) {
        const [updatedGoal] = await db.update(goals).set(goalData).where(and(eq(goals.id, id), eq(goals.userId, userId))).returning();
        return updatedGoal;
      }
      async deleteGoal(id, userId) {
        const result = await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)));
        return result.rowCount > 0;
      }
      // Settings
      async getSettings(userId) {
        const [userSettings] = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
        if (!userSettings) {
          const [newSettings] = await db.insert(settings).values({
            userId,
            theme: "light",
            currency: "INR",
            savingsTarget: 30,
            biometricEnabled: false,
            smsParsingEnabled: true
          }).returning();
          return newSettings;
        }
        return userSettings;
      }
      async updateSettings(userId, settingsData) {
        const [updatedSettings] = await db.update(settings).set(settingsData).where(eq(settings.userId, userId)).returning();
        return updatedSettings;
      }
      // Biometric Authentication
      async storeBiometricCredential(userId, credential) {
        await db.insert(biometricCredentials).values({
          userId,
          credentialID: credential.credentialID.toString(),
          credentialPublicKey: Buffer.from(credential.credentialPublicKey).toString("base64"),
          counter: credential.counter
        });
      }
      async getBiometricCredentials(userId) {
        const credentials = await db.select().from(biometricCredentials).where(eq(biometricCredentials.userId, userId));
        return credentials.map((cred) => ({
          credentialID: Buffer.from(cred.credentialID, "base64"),
          credentialPublicKey: Buffer.from(cred.credentialPublicKey, "base64"),
          counter: cred.counter
        }));
      }
      async getBiometricCredential(userId, credentialId) {
        const [credential] = await db.select().from(biometricCredentials).where(and(
          eq(biometricCredentials.userId, userId),
          eq(biometricCredentials.credentialID, credentialId)
        ));
        if (!credential) return null;
        return {
          credentialID: Buffer.from(credential.credentialID, "base64"),
          credentialPublicKey: Buffer.from(credential.credentialPublicKey, "base64"),
          counter: credential.counter
        };
      }
      async updateBiometricCredential(userId, credentialId, data) {
        await db.update(biometricCredentials).set({ counter: data.counter }).where(and(
          eq(biometricCredentials.userId, userId),
          eq(biometricCredentials.credentialID, credentialId)
        ));
      }
      async deleteBiometricCredentials(userId) {
        await db.delete(biometricCredentials).where(eq(biometricCredentials.userId, userId));
      }
      // 2FA
      async storeTOTPSecret(userId, secret) {
        await db.insert(twoFactorSecrets).values({
          userId,
          secret
        }).onConflictDoUpdate({
          target: twoFactorSecrets.userId,
          set: { secret }
        });
      }
      async getTOTPSecret(userId) {
        const [result] = await db.select().from(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
        return result?.secret || null;
      }
      async deleteTOTPSecret(userId) {
        await db.delete(twoFactorSecrets).where(eq(twoFactorSecrets.userId, userId));
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/sms-parser.ts
var sms_parser_exports = {};
__export(sms_parser_exports, {
  parseBankSMS: () => parseBankSMS2,
  processSMSTransaction: () => processSMSTransaction,
  testSMSParsing: () => testSMSParsing
});
function parseBankSMS2(message, sender) {
  try {
    if (!message || typeof message !== "string") {
      console.error("Invalid message provided to parseBankSMS");
      return null;
    }
    if (!sender || typeof sender !== "string") {
      console.error("Invalid sender provided to parseBankSMS");
      return null;
    }
    const cleanMessage = message.replace(/\s+/g, " ").trim();
    let parsedData = null;
    let patternType = "";
    for (const { pattern, type } of TRANSACTION_PATTERNS) {
      const match = cleanMessage.match(pattern);
      if (match) {
        parsedData = match;
        patternType = type;
        break;
      }
    }
    if (!parsedData) {
      return null;
    }
    const amountStr = parsedData[1]?.replace(/,/g, "");
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return null;
    }
    const isCredit = /credited|received|refund/i.test(cleanMessage);
    const isDebit = /debited|spent|paid|withdrawn|charged/i.test(cleanMessage);
    let transactionType = "expense";
    if (isCredit && !isDebit) {
      transactionType = "income";
    }
    let description = "";
    let merchant = "";
    if (patternType === "bank" || patternType === "simple_bank") {
      const descMatch = parsedData[6] || parsedData[5] || parsedData[4] || "";
      description = descMatch.trim();
    } else if (patternType === "upi") {
      merchant = parsedData[2]?.trim() || "";
      description = merchant;
    } else if (patternType === "card") {
      merchant = parsedData[3]?.trim() || "";
      description = `Card payment at ${merchant}`;
    } else if (patternType === "online") {
      merchant = parsedData[2]?.trim() || "";
      description = `Payment to ${merchant}`;
    }
    description = description.replace(/UPI.*?Ref\.?\s*\w+/i, "").replace(/\s+/g, " ").trim();
    if (!description) {
      description = transactionType === "income" ? "Money received" : "Payment made";
    }
    const category = categorizeTransaction(description.toLowerCase(), merchant.toLowerCase());
    let transactionDate = /* @__PURE__ */ new Date();
    const dateMatch = parsedData[3] || parsedData[4];
    if (dateMatch) {
      const dateParts = dateMatch.split("-");
      if (dateParts.length >= 3) {
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        let year = parseInt(dateParts[2]);
        if (year < 100) {
          year += year < 50 ? 2e3 : 1900;
        }
        transactionDate = new Date(year, month, day);
      }
    }
    const accountNumber = parsedData[2]?.replace(/\*/g, "") || void 0;
    const upiRef = parsedData[5] || parsedData[3] || void 0;
    const bankName = BANK_SENDERS[sender] || "Unknown Bank";
    return {
      amount,
      type: transactionType,
      category,
      description,
      date: transactionDate,
      accountNumber,
      upiRef,
      merchant: merchant || void 0,
      bankName
    };
  } catch (error) {
    console.error("SMS parsing error:", error);
    return null;
  }
}
function categorizeTransaction(description, merchant) {
  const text2 = `${description} ${merchant}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === "other") continue;
    for (const keyword of keywords) {
      if (text2.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  if (/atm|cash/i.test(text2)) {
    return "other";
  }
  if (/loan|emi|interest/i.test(text2)) {
    return "other";
  }
  return "other";
}
async function processSMSTransaction(message, sender, userId = "demo-user") {
  try {
    const parsed = parseBankSMS2(message, sender);
    if (!parsed) {
      console.log("Could not parse SMS:", message);
      return false;
    }
    const transaction = await storage.createTransaction({
      userId,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      title: parsed.description,
      date: parsed.date,
      isRecurring: false,
      tags: parsed.bankName ? [parsed.bankName] : [],
      notes: parsed.upiRef ? `UPI Ref: ${parsed.upiRef}` : void 0
    });
    console.log("Created transaction from SMS:", {
      id: transaction.id,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      description: parsed.description
    });
    return true;
  } catch (error) {
    console.error("Error processing SMS transaction:", error);
    return false;
  }
}
function testSMSParsing() {
  const testMessages = [
    {
      message: "Rs.1500.00 debited from A/c **1234 on 09-Aug-25. UPI Ref 123456789. Swiggy Food Order",
      sender: "HDFCBK"
    },
    {
      message: "Rs.50000.00 credited to your A/c **5678 on 08-Aug-25 at 02:30PM. Salary Transfer from Company Ltd.",
      sender: "ICICIB"
    },
    {
      message: "Rs.299.00 spent on Netflix subscription via UPI. UPI Ref: 987654321",
      sender: "PAYTM"
    },
    {
      message: "Payment of Rs.2500.00 made to Amazon via Google Pay on 07-Aug-25",
      sender: "GOOGLEPAY"
    }
  ];
  console.log("Testing SMS parsing:");
  testMessages.forEach((test, index) => {
    console.log(`
Test ${index + 1}:`);
    console.log("Message:", test.message);
    console.log("Sender:", test.sender);
    const result = parseBankSMS2(test.message, test.sender);
    if (result) {
      console.log("Parsed:", {
        amount: result.amount,
        type: result.type,
        category: result.category,
        description: result.description,
        bank: result.bankName
      });
    } else {
      console.log("Failed to parse");
    }
  });
}
var BANK_SENDERS, TRANSACTION_PATTERNS, CATEGORY_KEYWORDS;
var init_sms_parser = __esm({
  "server/sms-parser.ts"() {
    "use strict";
    init_storage();
    BANK_SENDERS = {
      "HDFCBK": "HDFC Bank",
      "ICICIB": "ICICI Bank",
      "SBIINB": "State Bank of India",
      "SBMSMS": "State Bank of India",
      "PAYTM": "Paytm Payments Bank",
      "AXISBK": "Axis Bank",
      "KOTAKB": "Kotak Mahindra Bank",
      "PNBSMS": "Punjab National Bank",
      "IOBNET": "Indian Overseas Bank",
      "UNIONB": "Union Bank of India"
    };
    TRANSACTION_PATTERNS = [
      // Standard bank SMS patterns - most comprehensive
      {
        pattern: /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited|debited|withdrawn|spent|paid|received|transferred).*?(?:A\/c|account).*?(\*+\d+).*?on\s*([\d-]+).*?(?:at\s*([\d:]+\s*(?:AM|PM)?))?.*?(?:UPI.*?Ref\.?\s*(\w+))?.*?(.+?)(?:\.|\s*$)/i,
        type: "bank"
      },
      // Simple debit/credit patterns for HDFC, ICICI, SBI
      {
        pattern: /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|credited).*?from.*?A\/c.*?(\*+\d+).*?on\s*([\d-]+).*?(?:UPI\s*Ref\.?\s*(\w+))?.*?(.+?)(?:\.|$)/i,
        type: "simple_bank"
      },
      // UPI specific patterns
      {
        pattern: /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:sent|received|paid|debited|credited).*?UPI.*?(?:to|from)\s*(.+?)(?:\.|\s*UPI\s*Ref\.?\s*(\w+))/i,
        type: "upi"
      },
      // Credit card patterns
      {
        pattern: /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:spent|charged|debited).*?card.*?(\*+\d+).*?at\s*(.+?)(?:on\s*([\d-]+))?/i,
        type: "card"
      },
      // Online payment patterns
      {
        pattern: /Payment of (?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:made|received).*?(?:to|from)\s*(.+?)(?:on\s*([\d-]+))?/i,
        type: "online"
      }
    ];
    CATEGORY_KEYWORDS = {
      "food": ["swiggy", "zomato", "dominos", "pizza", "restaurant", "cafe", "food", "dining", "kitchen", "meal", "lunch", "dinner", "breakfast"],
      "transport": ["uber", "ola", "metro", "bus", "taxi", "petrol", "diesel", "fuel", "parking", "toll", "railway", "irctc"],
      "shopping": ["amazon", "flipkart", "myntra", "nykaa", "shopping", "retail", "store", "mall", "purchase", "buy"],
      "entertainment": ["netflix", "spotify", "hotstar", "prime", "movie", "cinema", "theater", "game", "entertainment"],
      "utilities": ["electricity", "water", "gas", "internet", "mobile", "recharge", "bill", "utility", "broadband"],
      "healthcare": ["hospital", "doctor", "pharmacy", "medicine", "health", "clinic", "medical"],
      "education": ["school", "college", "university", "course", "education", "training", "study"],
      "investment": ["mutual fund", "sip", "equity", "stock", "investment", "trading", "zerodha", "groww"],
      "transfer": ["transfer", "sent to", "received from", "family", "friend", "personal"],
      "salary": ["salary", "wages", "income", "payroll", "employment"],
      "other": []
    };
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_schema();
import { createServer } from "http";
import { z as z2 } from "zod";

// server/webauthn.ts
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from "@simplewebauthn/server";

// server/auth-service.ts
init_storage();
var biometricCredentials2 = /* @__PURE__ */ new Map();
var totpSecrets = /* @__PURE__ */ new Map();
var otpCodes = /* @__PURE__ */ new Map();
var AuthService = class {
  async storeBiometricCredential(userId, credential) {
    const userCredentials = biometricCredentials2.get(userId) || [];
    userCredentials.push({
      id: Math.random().toString(36),
      userId,
      credentialID: credential.credentialID,
      credentialPublicKey: credential.credentialPublicKey,
      counter: credential.counter
    });
    biometricCredentials2.set(userId, userCredentials);
  }
  async getBiometricCredentials(userId) {
    return biometricCredentials2.get(userId) || [];
  }
  async getBiometricCredential(userId, credentialId) {
    const userCredentials = biometricCredentials2.get(userId) || [];
    return userCredentials.find((cred) => cred.credentialID === credentialId);
  }
  async updateBiometricCredential(userId, credentialId, data) {
    const userCredentials = biometricCredentials2.get(userId) || [];
    const credential = userCredentials.find((cred) => cred.credentialID === credentialId);
    if (credential) {
      credential.counter = data.counter;
    }
  }
  async deleteBiometricCredentials(userId) {
    biometricCredentials2.delete(userId);
  }
  async storeTOTPSecret(userId, secret) {
    totpSecrets.set(userId, secret);
  }
  async getTOTPSecret(userId) {
    return totpSecrets.get(userId) || null;
  }
  async deleteTOTPSecret(userId) {
    totpSecrets.delete(userId);
  }
  storeOTP(userId, code, expiresInMinutes = 5) {
    otpCodes.set(userId, {
      code,
      expires: Date.now() + expiresInMinutes * 60 * 1e3,
      attempts: 0
    });
  }
  verifyOTP(userId, code) {
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
  async enableBiometric(userId) {
    await storage.updateSettings(userId, { biometricEnabled: true });
  }
  async enableTwoFactor(userId) {
    await storage.updateSettings(userId, { twoFactorEnabled: true });
  }
};
var authService = new AuthService();

// server/webauthn.ts
var rpName = "Visor Finance";
var rpID = process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost";
var origin = `https://${rpID}`;
var challengeStore = /* @__PURE__ */ new Map();
async function generateBiometricRegistrationOptions(userId) {
  const user = {
    id: userId,
    email: "demo@visor.app",
    fullName: "Demo User"
  };
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: Buffer.from(userId),
    userName: user.email,
    userDisplayName: user.fullName,
    attestationType: "none",
    authenticatorSelection: {
      userVerification: "preferred",
      authenticatorAttachment: "platform"
      // For built-in biometric sensors
    }
  });
  challengeStore.set(userId, options.challenge);
  return options;
}
async function verifyBiometricRegistration(userId, response) {
  const expectedChallenge = challengeStore.get(userId);
  if (!expectedChallenge) {
    throw new Error("Challenge not found");
  }
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID
  });
  if (verification.verified && verification.registrationInfo) {
    await authService.storeBiometricCredential(userId, {
      credentialID: verification.registrationInfo.credential.id,
      credentialPublicKey: verification.registrationInfo.credentialPublicKey,
      counter: verification.registrationInfo.credential.counter
    });
    await authService.enableBiometric(userId);
    challengeStore.delete(userId);
  }
  return verification;
}
async function generateBiometricAuthenticationOptions(userId) {
  const credentials = await authService.getBiometricCredentials(userId);
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: credentials.map((cred) => ({
      id: cred.credentialID,
      type: "public-key"
    })),
    userVerification: "preferred"
  });
  challengeStore.set(userId, options.challenge);
  return options;
}
async function verifyBiometricAuthentication(userId, response) {
  const expectedChallenge = challengeStore.get(userId);
  if (!expectedChallenge) {
    throw new Error("Challenge not found");
  }
  const credential = await authService.getBiometricCredential(userId, response.id);
  if (!credential) {
    throw new Error("Credential not found");
  }
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.credentialID,
      publicKey: credential.credentialPublicKey,
      counter: credential.counter
    }
  });
  if (verification.verified) {
    await authService.updateBiometricCredential(userId, response.id, {
      counter: verification.authenticationInfo.newCounter
    });
    challengeStore.delete(userId);
  }
  return verification;
}

// server/sms.ts
import twilio from "twilio";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
var twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;
var twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
if (twilioPhoneNumber && !twilioPhoneNumber.startsWith("+")) {
  if (twilioPhoneNumber.startsWith("91")) {
    twilioPhoneNumber = "+" + twilioPhoneNumber;
  } else if (twilioPhoneNumber.length === 10) {
    twilioPhoneNumber = "+91" + twilioPhoneNumber;
  } else {
    twilioPhoneNumber = "+" + twilioPhoneNumber;
  }
}
async function sendSMSOTP(userId, mobileNumber) {
  if (!twilioClient || !twilioPhoneNumber) {
    console.error("Twilio credentials missing - check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER");
    return false;
  }
  let formattedFrom = twilioPhoneNumber;
  let formattedTo = mobileNumber;
  if (!formattedTo.startsWith("+")) {
    formattedTo = formattedTo.startsWith("91") ? "+" + formattedTo : "+91" + formattedTo;
  }
  console.log(`Sending SMS from ${formattedFrom} to ${formattedTo}`);
  if (!formattedFrom?.startsWith("+")) {
    console.error(`Invalid Twilio phone number format: ${formattedFrom}. Must start with + and country code.`);
    console.error(`Current TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER}`);
    console.error(`Expected format: +918947819840 (if Indian number)`);
    return false;
  }
  try {
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expires = Date.now() + 5 * 60 * 1e3;
    authService.storeOTP(userId, code, 5);
    await twilioClient.messages.create({
      body: `Your Visor verification code is: ${code}. Valid for 5 minutes.`,
      from: formattedFrom,
      to: formattedTo
    });
    console.log(`SMS OTP sent to ${formattedTo.slice(0, -4)}****`);
    return true;
  } catch (error) {
    console.error("SMS sending failed:", error);
    return false;
  }
}
function verifySMSOTP(userId, code) {
  return authService.verifyOTP(userId, code);
}
async function generateTOTPSecret(userId) {
  const user = {
    id: userId,
    email: "demo@visor.app",
    fullName: "Demo User"
  };
  const secret = speakeasy.generateSecret({
    name: `Visor Finance (${user.email || user.mobileNumber})`,
    issuer: "Visor Finance",
    length: 32
  });
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  await authService.storeTOTPSecret(userId, secret.base32);
  return {
    secret: secret.base32,
    qrCode
  };
}
async function verifyTOTP(userId, token) {
  const secret = await authService.getTOTPSecret(userId);
  if (!secret) {
    return false;
  }
  const verified = speakeasy.totp.verify({
    secret,
    token,
    window: 2,
    // Allow 2 time steps (60 seconds) tolerance
    encoding: "base32"
  });
  if (verified) {
    await authService.enableTwoFactor(userId);
  }
  return verified;
}
async function disable2FA(userId) {
  await authService.deleteTOTPSecret(userId);
  await authService.enableTwoFactor(userId);
}
async function parseBankSMS(messageBody, fromNumber) {
  const patterns = {
    // SBI pattern: "Rs.1000.00 debited from A/c **1234 on 01-Jan-23. UPI Ref 123456789."
    sbi: /Rs\.?([\d,]+\.?\d*)\s+(debited|credited)\s+.*A\/c\s+\*+(\d+)/i,
    // HDFC pattern: "INR 1000.00 debited from Ac **1234 on 01-Jan-23"
    hdfc: /INR\s+([\d,]+\.?\d*)\s+(debited|credited)\s+.*Ac\s+\*+(\d+)/i,
    // ICICI pattern: "Rs 1000.00 debited from account **1234"
    icici: /Rs\.?\s+([\d,]+\.?\d*)\s+(debited|credited)\s+.*account\s+\*+(\d+)/i,
    // Generic UPI pattern: "UPI/123456789/Payment to MERCHANT/Rs.1000"
    upi: /UPI\/\d+\/.*\/Rs\.?([\d,]+\.?\d*)/i
  };
  for (const [bank, pattern] of Object.entries(patterns)) {
    const match = messageBody.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ""));
      const type = match[2]?.toLowerCase() === "credited" ? "income" : "expense";
      const accountNumber = match[3] || "unknown";
      return {
        bank,
        amount,
        type,
        accountNumber,
        rawMessage: messageBody,
        timestamp: /* @__PURE__ */ new Date(),
        category: detectCategory(messageBody)
      };
    }
  }
  return null;
}
function detectCategory(message) {
  const categoryMap = {
    food: ["swiggy", "zomato", "restaurant", "food", "cafe"],
    transport: ["uber", "ola", "metro", "bus", "taxi", "petrol", "fuel"],
    shopping: ["amazon", "flipkart", "mall", "shopping", "store"],
    utilities: ["electricity", "water", "gas", "internet", "mobile", "recharge"],
    entertainment: ["movie", "netflix", "spotify", "game", "entertainment"],
    healthcare: ["hospital", "pharmacy", "medical", "doctor", "clinic"],
    salary: ["salary", "wages", "payroll"]
  };
  const lowerMessage = message.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return category;
    }
  }
  return "other";
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({
          message: "Email/mobile number and password are required"
        });
      }
      if (identifier === "+919876543210" && password === "demo123!") {
        const mockUser = {
          id: "demo-user",
          fullName: "Demo User",
          email: "demo@visor.app",
          mobileNumber: "+919876543210"
        };
        res.json({
          message: "Login successful",
          user: mockUser
        });
      } else {
        res.status(401).json({
          message: "Invalid credentials. Use +919876543210 and demo123!"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/auth/verify", async (req, res) => {
    const mockUser = {
      id: "demo-user",
      fullName: "Demo User",
      email: "demo@example.com",
      mobileNumber: "+919876543210",
      isVerified: true
    };
    res.json(mockUser);
  });
  app2.get("/api/logout", async (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
  });
  app2.post("/api/sms/parse", async (req, res) => {
    try {
      const { message, sender } = req.body;
      if (!message || !sender) {
        return res.status(400).json({
          message: "Message and sender are required"
        });
      }
      if (typeof message !== "string" || typeof sender !== "string") {
        return res.status(400).json({
          message: "Message and sender must be strings"
        });
      }
      const userId = "demo-user";
      const { processSMSTransaction: processSMSTransaction2 } = await Promise.resolve().then(() => (init_sms_parser(), sms_parser_exports));
      const success = await processSMSTransaction2(message, sender, userId);
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
      console.error("SMS parsing error:", error);
      res.status(500).json({ message: "Failed to process SMS" });
    }
  });
  app2.get("/api/sms/test", async (req, res) => {
    try {
      const { testSMSParsing: testSMSParsing2 } = await Promise.resolve().then(() => (init_sms_parser(), sms_parser_exports));
      testSMSParsing2();
      res.json({ message: "Check console for SMS parsing test results" });
    } catch (error) {
      console.error("SMS test error:", error);
      res.status(500).json({ message: "Failed to run SMS test" });
    }
  });
  app2.get("/api/transactions", async (req, res) => {
    try {
      const userId = "demo-user";
      const { type, category, startDate, endDate } = req.query;
      let transactions2;
      if (type) {
        transactions2 = await storage.getTransactionsByType(userId, type);
      } else if (category) {
        transactions2 = await storage.getTransactionsByCategory(userId, category);
      } else if (startDate && endDate) {
        transactions2 = await storage.getTransactionsByDateRange(
          userId,
          new Date(startDate),
          new Date(endDate)
        );
      } else {
        transactions2 = await storage.getTransactions(userId);
      }
      res.json(transactions2);
    } catch (error) {
      console.error("Fetch transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/transactions/:id", async (req, res) => {
    try {
      const userId = "demo-user";
      const transaction = await storage.getTransaction(req.params.id, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Fetch transaction error:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });
  app2.post("/api/transactions", async (req, res) => {
    try {
      const userId = "demo-user";
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({ ...validatedData, userId });
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });
  app2.put("/api/transactions/:id", async (req, res) => {
    try {
      const userId = "demo-user";
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, userId, validatedData);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Update transaction error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });
  app2.delete("/api/transactions/:id", async (req, res) => {
    try {
      const userId = "demo-user";
      const success = await storage.deleteTransaction(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });
  app2.get("/api/goals", async (req, res) => {
    try {
      const userId = "demo-user";
      const goals2 = await storage.getGoals(userId);
      res.json(goals2);
    } catch (error) {
      console.error("Fetch goals error:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });
  app2.post("/api/goals", async (req, res) => {
    try {
      const userId = "demo-user";
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal({ ...validatedData, userId });
      res.status(201).json(goal);
    } catch (error) {
      console.error("Create goal error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });
  app2.put("/api/goals/:id", async (req, res) => {
    try {
      const userId = "demo-user";
      const validatedData = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(req.params.id, userId, validatedData);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      console.error("Update goal error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update goal" });
    }
  });
  app2.delete("/api/goals/:id", async (req, res) => {
    try {
      const userId = "demo-user";
      const success = await storage.deleteGoal(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Delete goal error:", error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const userId = "demo-user";
      const settings2 = await storage.getSettings(userId);
      res.json(settings2);
    } catch (error) {
      console.error("Fetch settings error:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  app2.put("/api/settings", async (req, res) => {
    try {
      const userId = "demo-user";
      const validatedData = insertSettingsSchema.partial().parse(req.body);
      const settings2 = await storage.updateSettings(userId, validatedData);
      res.json(settings2);
    } catch (error) {
      console.error("Update settings error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  app2.get("/api/analytics/summary", async (req, res) => {
    try {
      const userId = "demo-user";
      const transactions2 = await storage.getTransactions(userId);
      const currentMonth = /* @__PURE__ */ new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      const monthlyTransactions = transactions2.filter(
        (t) => new Date(t.date) >= currentMonth
      );
      const monthlyIncome = monthlyTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const monthlyExpenses = monthlyTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const monthlyInvestments = monthlyTransactions.filter((t) => t.type === "investment").reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalInvestments = transactions2.filter((t) => t.type === "investment").reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const netSavings = monthlyIncome - monthlyExpenses;
      const savingsRate = monthlyIncome > 0 ? netSavings / monthlyIncome * 100 : 0;
      res.json({
        monthlyIncome,
        monthlyExpenses,
        monthlyInvestments,
        totalInvestments,
        netSavings,
        savingsRate
      });
    } catch (error) {
      console.error("Analytics summary error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.post("/api/auth/biometric/register/begin", async (req, res) => {
    try {
      const userId = "demo-user";
      const options = await generateBiometricRegistrationOptions(userId);
      res.json(options);
    } catch (error) {
      console.error("Biometric registration begin error:", error);
      res.status(500).json({ message: "Failed to generate registration options" });
    }
  });
  app2.post("/api/auth/biometric/register/complete", async (req, res) => {
    try {
      const userId = "demo-user";
      const verification = await verifyBiometricRegistration(userId, req.body);
      res.json({ verified: verification.verified });
    } catch (error) {
      console.error("Biometric registration complete error:", error);
      res.status(500).json({ message: "Failed to verify registration" });
    }
  });
  app2.post("/api/auth/biometric/authenticate/begin", async (req, res) => {
    try {
      const userId = "demo-user";
      const options = await generateBiometricAuthenticationOptions(userId);
      res.json(options);
    } catch (error) {
      console.error("Biometric authentication begin error:", error);
      res.status(500).json({ message: "Failed to generate authentication options" });
    }
  });
  app2.post("/api/auth/biometric/authenticate/complete", async (req, res) => {
    try {
      const userId = "demo-user";
      const verification = await verifyBiometricAuthentication(userId, req.body);
      res.json({ verified: verification.verified });
    } catch (error) {
      console.error("Biometric authentication complete error:", error);
      res.status(500).json({ message: "Failed to verify authentication" });
    }
  });
  app2.post("/api/auth/2fa/setup", async (req, res) => {
    try {
      const userId = "demo-user";
      const { secret, qrCode } = await generateTOTPSecret(userId);
      res.json({ secret, qrCode });
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });
  app2.post("/api/auth/2fa/verify", async (req, res) => {
    try {
      const userId = "demo-user";
      const { token } = req.body;
      const verified = await verifyTOTP(userId, token);
      res.json({ verified });
    } catch (error) {
      console.error("2FA verification error:", error);
      res.status(500).json({ message: "Failed to verify 2FA token" });
    }
  });
  app2.post("/api/auth/2fa/disable", async (req, res) => {
    try {
      const userId = "demo-user";
      await disable2FA(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("2FA disable error:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });
  app2.post("/api/auth/sms/send", async (req, res) => {
    try {
      const userId = "demo-user";
      const { mobileNumber } = req.body;
      if (!mobileNumber) {
        return res.status(400).json({ message: "Mobile number is required" });
      }
      const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
      let formattedTwilio = twilioNumber;
      if (twilioNumber && !twilioNumber.startsWith("+")) {
        formattedTwilio = twilioNumber.startsWith("91") ? "+" + twilioNumber : "+91" + twilioNumber;
      }
      let formattedMobile = mobileNumber;
      if (!formattedMobile.startsWith("+")) {
        formattedMobile = formattedMobile.startsWith("91") ? "+" + formattedMobile : "+91" + formattedMobile;
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
      console.error("SMS OTP send error:", error);
      res.status(500).json({ message: "Failed to send SMS OTP" });
    }
  });
  app2.post("/api/auth/sms/verify", async (req, res) => {
    try {
      const userId = "demo-user";
      const { code } = req.body;
      const verified = verifySMSOTP(userId, code);
      res.json({ verified });
    } catch (error) {
      console.error("SMS OTP verification error:", error);
      res.status(500).json({ message: "Failed to verify SMS OTP" });
    }
  });
  app2.post("/api/sms/parse", async (req, res) => {
    try {
      const { messageBody, fromNumber } = req.body;
      const transaction = await parseBankSMS(messageBody, fromNumber);
      if (transaction) {
        const userId = "demo-user";
        const createdTransaction = await storage.createTransaction({
          ...transaction,
          userId,
          title: `Auto: ${transaction.category}`,
          date: transaction.timestamp,
          notes: `Auto-parsed from SMS: ${transaction.bank}`
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
      console.error("SMS parsing error:", error);
      res.status(500).json({ message: "Failed to parse SMS" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
