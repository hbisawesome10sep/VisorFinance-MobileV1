import { 
  transactions,
  goals,
  settings,
  users,
  biometricCredentials,
  twoFactorSecrets,
  type Transaction, 
  type InsertTransaction, 
  type Goal, 
  type InsertGoal,
  type Settings,
  type InsertSettings,
  type User,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, or, and, gte, lte } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUserByEmailOrMobile(identifier: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Transactions
  getTransactions(userId: string): Promise<Transaction[]>;
  getTransaction(id: string, userId: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction>;
  updateTransaction(id: string, userId: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string, userId: string): Promise<boolean>;
  getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  getTransactionsByType(userId: string, type: string): Promise<Transaction[]>;
  getTransactionsByCategory(userId: string, category: string): Promise<Transaction[]>;

  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  getGoal(id: string, userId: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal & { userId: string }): Promise<Goal>;
  updateGoal(id: string, userId: string, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: string, userId: string): Promise<boolean>;

  // Settings
  getSettings(userId: string): Promise<Settings>;
  updateSettings(userId: string, settingsData: Partial<InsertSettings>): Promise<Settings>;

  // Biometric Authentication
  storeBiometricCredential(userId: string, credential: any): Promise<void>;
  getBiometricCredentials(userId: string): Promise<any[]>;
  getBiometricCredential(userId: string, credentialId: string): Promise<any>;
  updateBiometricCredential(userId: string, credentialId: string, data: any): Promise<void>;
  deleteBiometricCredentials(userId: string): Promise<void>;

  // 2FA
  storeTOTPSecret(userId: string, secret: string): Promise<void>;
  getTOTPSecret(userId: string): Promise<string | null>;
  deleteTOTPSecret(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUserByEmailOrMobile(identifier: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.mobileNumber, identifier)))
      .limit(1);
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async getTransaction(id: string, userId: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1);
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: string, userId: string, transactionData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transactionData)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
    return result.rowCount > 0;
  }

  async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      ));
  }

  async getTransactionsByType(userId: string, type: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, type)));
  }

  async getTransactionsByCategory(userId: string, category: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.category, category)));
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async getGoal(id: string, userId: string): Promise<Goal | undefined> {
    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .limit(1);
    return goal;
  }

  async createGoal(goal: InsertGoal & { userId: string }): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: string, userId: string, goalData: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updatedGoal] = await db
      .update(goals)
      .set(goalData)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return updatedGoal;
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));
    return result.rowCount > 0;
  }

  // Settings
  async getSettings(userId: string): Promise<Settings> {
    const [userSettings] = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userId))
      .limit(1);

    if (!userSettings) {
      // Create default settings for new user
      const [newSettings] = await db
        .insert(settings)
        .values({
          userId,
          theme: "light",
          currency: "INR",
          savingsTarget: 30,
          biometricEnabled: false,
          smsParsingEnabled: true,
        })
        .returning();
      return newSettings;
    }

    return userSettings;
  }

  async updateSettings(userId: string, settingsData: Partial<InsertSettings>): Promise<Settings> {
    const [updatedSettings] = await db
      .update(settings)
      .set(settingsData)
      .where(eq(settings.userId, userId))
      .returning();
    return updatedSettings;
  }

  // Biometric Authentication
  async storeBiometricCredential(userId: string, credential: any): Promise<void> {
    await db.insert(biometricCredentials).values({
      userId,
      credentialID: credential.credentialID.toString(),
      credentialPublicKey: Buffer.from(credential.credentialPublicKey).toString('base64'),
      counter: credential.counter,
    });
  }

  async getBiometricCredentials(userId: string): Promise<any[]> {
    const credentials = await db
      .select()
      .from(biometricCredentials)
      .where(eq(biometricCredentials.userId, userId));

    return credentials.map(cred => ({
      credentialID: Buffer.from(cred.credentialID, 'base64'),
      credentialPublicKey: Buffer.from(cred.credentialPublicKey, 'base64'),
      counter: cred.counter,
    }));
  }

  async getBiometricCredential(userId: string, credentialId: string): Promise<any> {
    const [credential] = await db
      .select()
      .from(biometricCredentials)
      .where(and(
        eq(biometricCredentials.userId, userId),
        eq(biometricCredentials.credentialID, credentialId)
      ));

    if (!credential) return null;

    return {
      credentialID: Buffer.from(credential.credentialID, 'base64'),
      credentialPublicKey: Buffer.from(credential.credentialPublicKey, 'base64'),
      counter: credential.counter,
    };
  }

  async updateBiometricCredential(userId: string, credentialId: string, data: any): Promise<void> {
    await db
      .update(biometricCredentials)
      .set({ counter: data.counter })
      .where(and(
        eq(biometricCredentials.userId, userId),
        eq(biometricCredentials.credentialID, credentialId)
      ));
  }

  async deleteBiometricCredentials(userId: string): Promise<void> {
    await db
      .delete(biometricCredentials)
      .where(eq(biometricCredentials.userId, userId));
  }

  // 2FA
  async storeTOTPSecret(userId: string, secret: string): Promise<void> {
    await db.insert(twoFactorSecrets).values({
      userId,
      secret,
    }).onConflictDoUpdate({
      target: twoFactorSecrets.userId,
      set: { secret }
    });
  }

  async getTOTPSecret(userId: string): Promise<string | null> {
    const [result] = await db
      .select()
      .from(twoFactorSecrets)
      .where(eq(twoFactorSecrets.userId, userId));

    return result?.secret || null;
  }

  async deleteTOTPSecret(userId: string): Promise<void> {
    await db
      .delete(twoFactorSecrets)
      .where(eq(twoFactorSecrets.userId, userId));
  }
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction> = new Map();
  private goals: Map<string, Goal> = new Map();
  private users: Map<string, User> = new Map();
  private settingsMap: Map<string, Settings> = new Map();

  constructor() {

    // Initialize with sample goals
    const emergencyGoal: Goal = {
      id: randomUUID(),
      name: "Emergency Fund",
      targetAmount: "300000",
      currentAmount: "201000",
      targetDate: new Date("2025-12-31"),
      category: "emergency",
      createdAt: new Date(),
    };

    const travelGoal: Goal = {
      id: randomUUID(),
      name: "Travel Fund",
      targetAmount: "100000",
      currentAmount: "43000",
      targetDate: new Date("2025-06-30"),
      category: "travel",
      createdAt: new Date(),
    };

    this.goals.set(emergencyGoal.id, emergencyGoal);
    this.goals.set(travelGoal.id, travelGoal);
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      amount: insertTransaction.amount.toString(),
      date: new Date(insertTransaction.date),
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existing = this.transactions.get(id);
    if (!existing) return undefined;

    const updated: Transaction = {
      ...existing,
      ...updates,
      amount: updates.amount ? updates.amount.toString() : existing.amount,
      date: updates.date ? new Date(updates.date) : existing.date,
    };
    
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.type === type);
  }

  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.category === category);
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      ...insertGoal,
      id,
      targetAmount: insertGoal.targetAmount.toString(),
      currentAmount: insertGoal.currentAmount?.toString() || "0",
      targetDate: insertGoal.targetDate ? new Date(insertGoal.targetDate) : null,
      createdAt: new Date(),
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existing = this.goals.get(id);
    if (!existing) return undefined;

    const updated: Goal = {
      ...existing,
      ...updates,
      targetAmount: updates.targetAmount ? updates.targetAmount.toString() : existing.targetAmount,
      currentAmount: updates.currentAmount ? updates.currentAmount.toString() : existing.currentAmount,
      targetDate: updates.targetDate ? new Date(updates.targetDate) : existing.targetDate,
    };
    
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Settings
  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  // Biometric Authentication (stub for MemStorage)
  async storeBiometricCredential(userId: string, credential: any): Promise<void> {
    // Not implemented in memory storage
  }

  async getBiometricCredentials(userId: string): Promise<any[]> {
    return [];
  }

  async getBiometricCredential(userId: string, credentialId: string): Promise<any> {
    return null;
  }

  async updateBiometricCredential(userId: string, credentialId: string, data: any): Promise<void> {
    // Not implemented in memory storage
  }

  async deleteBiometricCredentials(userId: string): Promise<void> {
    // Not implemented in memory storage
  }

  // 2FA (stub for MemStorage)
  async storeTOTPSecret(userId: string, secret: string): Promise<void> {
    // Not implemented in memory storage
  }

  async getTOTPSecret(userId: string): Promise<string | null> {
    return null;
  }

  async deleteTOTPSecret(userId: string): Promise<void> {
    // Not implemented in memory storage
  }
}

export const storage = new DatabaseStorage();
