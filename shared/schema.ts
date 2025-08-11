import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
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
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'income' | 'expense' | 'investment'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceFrequency: text("recurrence_frequency"), // 'weekly' | 'monthly'
  recurrenceCount: integer("recurrence_count"),
  isSplit: boolean("is_split").default(false),
  splitCount: integer("split_count"),
  splitWith: text("split_with").array(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  targetDate: timestamp("target_date"),
  category: text("category").notNull(), // 'emergency' | 'travel' | 'home' | 'retirement'
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  theme: text("theme").default("light"), // 'light' | 'dark'
  currency: text("currency").default("INR"),
  savingsTarget: integer("savings_target").default(30), // percentage
  biometricEnabled: boolean("biometric_enabled").default(false),
  smsParsingEnabled: boolean("sms_parsing_enabled").default(true),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  dataExportEnabled: boolean("data_export_enabled").default(true),
  riskTolerance: text("risk_tolerance").default("moderate"), // 'conservative' | 'moderate' | 'aggressive'
  investmentStrategy: text("investment_strategy").default("balanced"), // 'conservative' | 'balanced' | 'growth' | 'aggressive'
  autoInvestEnabled: boolean("auto_invest_enabled").default(false),
  autoInvestAmount: decimal("auto_invest_amount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Investment categories
export const investmentCategories = pgTable("investment_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  riskLevel: text("risk_level").notNull(), // 'low' | 'medium' | 'high'
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Investment recommendations
export const investmentRecommendations = pgTable("investment_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: varchar("category_id").references(() => investmentCategories.id).notNull(),
  recommendedAmount: decimal("recommended_amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  priority: integer("priority").default(1), // 1 = high, 2 = medium, 3 = low
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Biometric credentials for WebAuthn
export const biometricCredentials = pgTable("biometric_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  credentialID: text("credential_id").notNull().unique(),
  credentialPublicKey: text("credential_public_key").notNull(),
  counter: integer("counter").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// 2FA secrets
export const twoFactorSecrets = pgTable("two_factor_secrets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  secret: text("secret").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Insert schemas
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  amount: z.coerce.number().min(1, "Amount must be at least ₹1"),
  type: z.enum(["income", "expense", "investment"]),
  date: z.coerce.date(),
  recurrenceFrequency: z.enum(["weekly", "monthly"]).optional(),
  recurrenceCount: z.coerce.number().min(2).max(299).optional(),
  splitCount: z.coerce.number().min(2).max(50).optional(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  targetAmount: z.coerce.number().min(1),
  currentAmount: z.coerce.number().min(0).optional(),
  targetDate: z.coerce.date().optional(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  otpCode: true,
  otpExpiry: true,
  isVerified: true,
}).extend({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format").optional(),
  mobileNumber: z.string().regex(/^\+91\d{10}$/, "Mobile number must be 10 digits with +91 prefix"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN must be 10 characters: 5 letters + 4 numbers + 1 letter"),
  aadhaarNumber: z.string().regex(/^\d{4}-\d{4}-\d{4}$/, "Aadhaar must be 12 digits with dashes (xxxx-xxxx-xxxx)").optional(),
  dateOfBirth: z.date().max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), "Must be at least 18 years old"),
  passwordHash: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or mobile number is required"),
  password: z.string().min(1, "Password is required"),
  loginMethod: z.enum(["password", "otp"]).default("password"),
});

export const otpVerificationSchema = z.object({
  identifier: z.string().min(1, "Email or mobile number is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// Types
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type OtpVerificationRequest = z.infer<typeof otpVerificationSchema>;
export type Session = typeof sessions.$inferSelect;
