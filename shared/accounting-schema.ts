import { z } from 'zod';
import { pgTable, varchar, decimal, timestamp, text, jsonb, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

// Chart of Accounts following Indian Accounting Standards
export const chartOfAccounts = pgTable('chart_of_accounts', {
  id: varchar('id').primaryKey(),
  code: varchar('code').notNull().unique(),
  name: varchar('name').notNull(),
  type: varchar('type').notNull(), // ASSET, LIABILITY, EQUITY, INCOME, EXPENSE
  subType: varchar('sub_type'), // CURRENT_ASSET, FIXED_ASSET, CURRENT_LIABILITY, etc.
  parentId: varchar('parent_id'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Journal Entries following Double Entry System
export const journalEntries = pgTable('journal_entries', {
  id: varchar('id').primaryKey(),
  entryNumber: varchar('entry_number').notNull().unique(),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  reference: varchar('reference'), // Transaction ID reference
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  isPosted: boolean('is_posted').default(false),
  createdBy: varchar('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Journal Entry Line Items (Debit/Credit entries)
export const journalEntryLines = pgTable('journal_entry_lines', {
  id: varchar('id').primaryKey(),
  journalEntryId: varchar('journal_entry_id').notNull(),
  accountId: varchar('account_id').notNull(),
  accountCode: varchar('account_code').notNull(),
  accountName: varchar('account_name').notNull(),
  debitAmount: decimal('debit_amount', { precision: 15, scale: 2 }).default('0'),
  creditAmount: decimal('credit_amount', { precision: 15, scale: 2 }).default('0'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Ledger balances for quick access
export const ledgerBalances = pgTable('ledger_balances', {
  id: varchar('id').primaryKey(),
  accountId: varchar('account_id').notNull(),
  accountCode: varchar('account_code').notNull(),
  accountName: varchar('account_name').notNull(),
  debitBalance: decimal('debit_balance', { precision: 15, scale: 2 }).default('0'),
  creditBalance: decimal('credit_balance', { precision: 15, scale: 2 }).default('0'),
  netBalance: decimal('net_balance', { precision: 15, scale: 2 }).default('0'),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

// Types
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = typeof chartOfAccounts.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;
export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type InsertJournalEntryLine = typeof journalEntryLines.$inferInsert;
export type LedgerBalance = typeof ledgerBalances.$inferSelect;
export type InsertLedgerBalance = typeof ledgerBalances.$inferInsert;

// Zod schemas
export const insertChartOfAccountSchema = createInsertSchema(chartOfAccounts);
export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const insertJournalEntryLineSchema = createInsertSchema(journalEntryLines);
export const insertLedgerBalanceSchema = createInsertSchema(ledgerBalances);

// Account Types following Indian Accounting Standards
export const ACCOUNT_TYPES = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY', 
  EQUITY: 'EQUITY',
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
} as const;

export const ACCOUNT_SUB_TYPES = {
  // Assets
  CURRENT_ASSET: 'CURRENT_ASSET',
  FIXED_ASSET: 'FIXED_ASSET',
  INTANGIBLE_ASSET: 'INTANGIBLE_ASSET',
  INVESTMENT: 'INVESTMENT',
  
  // Liabilities
  CURRENT_LIABILITY: 'CURRENT_LIABILITY',
  NON_CURRENT_LIABILITY: 'NON_CURRENT_LIABILITY',
  
  // Equity
  SHARE_CAPITAL: 'SHARE_CAPITAL',
  RETAINED_EARNINGS: 'RETAINED_EARNINGS',
  RESERVES: 'RESERVES',
  
  // Income
  OPERATING_INCOME: 'OPERATING_INCOME',
  NON_OPERATING_INCOME: 'NON_OPERATING_INCOME',
  
  // Expenses
  OPERATING_EXPENSE: 'OPERATING_EXPENSE',
  NON_OPERATING_EXPENSE: 'NON_OPERATING_EXPENSE',
  FINANCE_COST: 'FINANCE_COST'
} as const;

// Standard Chart of Accounts for Indian businesses
export const STANDARD_ACCOUNTS = [
  // Assets
  { code: '1000', name: 'Current Assets', type: 'ASSET', subType: 'CURRENT_ASSET' },
  { code: '1100', name: 'Cash and Cash Equivalents', type: 'ASSET', subType: 'CURRENT_ASSET', parentId: '1000' },
  { code: '1110', name: 'Cash in Hand', type: 'ASSET', subType: 'CURRENT_ASSET', parentId: '1100' },
  { code: '1120', name: 'Bank Account - Current', type: 'ASSET', subType: 'CURRENT_ASSET', parentId: '1100' },
  { code: '1130', name: 'Bank Account - Savings', type: 'ASSET', subType: 'CURRENT_ASSET', parentId: '1100' },
  { code: '1200', name: 'Investments', type: 'ASSET', subType: 'INVESTMENT', parentId: '1000' },
  { code: '1210', name: 'Mutual Funds', type: 'ASSET', subType: 'INVESTMENT', parentId: '1200' },
  { code: '1220', name: 'Stocks', type: 'ASSET', subType: 'INVESTMENT', parentId: '1200' },
  { code: '1230', name: 'Fixed Deposits', type: 'ASSET', subType: 'INVESTMENT', parentId: '1200' },
  
  // Liabilities
  { code: '2000', name: 'Current Liabilities', type: 'LIABILITY', subType: 'CURRENT_LIABILITY' },
  { code: '2100', name: 'Loans and Borrowings', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', parentId: '2000' },
  { code: '2110', name: 'Credit Card Payables', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', parentId: '2100' },
  { code: '2120', name: 'Personal Loans', type: 'LIABILITY', subType: 'CURRENT_LIABILITY', parentId: '2100' },
  { code: '2200', name: 'Non-Current Liabilities', type: 'LIABILITY', subType: 'NON_CURRENT_LIABILITY' },
  { code: '2210', name: 'Home Loan', type: 'LIABILITY', subType: 'NON_CURRENT_LIABILITY', parentId: '2200' },
  { code: '2220', name: 'Car Loan', type: 'LIABILITY', subType: 'NON_CURRENT_LIABILITY', parentId: '2200' },
  
  // Equity
  { code: '3000', name: 'Equity', type: 'EQUITY', subType: 'SHARE_CAPITAL' },
  { code: '3100', name: 'Opening Balance Equity', type: 'EQUITY', subType: 'SHARE_CAPITAL', parentId: '3000' },
  { code: '3200', name: 'Retained Earnings', type: 'EQUITY', subType: 'RETAINED_EARNINGS', parentId: '3000' },
  
  // Income
  { code: '4000', name: 'Income', type: 'INCOME', subType: 'OPERATING_INCOME' },
  { code: '4100', name: 'Salary Income', type: 'INCOME', subType: 'OPERATING_INCOME', parentId: '4000' },
  { code: '4200', name: 'Business Income', type: 'INCOME', subType: 'OPERATING_INCOME', parentId: '4000' },
  { code: '4300', name: 'Investment Income', type: 'INCOME', subType: 'NON_OPERATING_INCOME', parentId: '4000' },
  { code: '4310', name: 'Dividend Income', type: 'INCOME', subType: 'NON_OPERATING_INCOME', parentId: '4300' },
  { code: '4320', name: 'Interest Income', type: 'INCOME', subType: 'NON_OPERATING_INCOME', parentId: '4300' },
  
  // Expenses
  { code: '5000', name: 'Expenses', type: 'EXPENSE', subType: 'OPERATING_EXPENSE' },
  { code: '5100', name: 'Food & Dining', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', parentId: '5000' },
  { code: '5200', name: 'Transportation', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', parentId: '5000' },
  { code: '5300', name: 'Utilities', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', parentId: '5000' },
  { code: '5400', name: 'Entertainment', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', parentId: '5000' },
  { code: '5500', name: 'Shopping', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', parentId: '5000' },
  { code: '5600', name: 'Healthcare', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', parentId: '5000' },
  { code: '5700', name: 'Education', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', parentId: '5000' },
  { code: '5800', name: 'Insurance', type: 'EXPENSE', subType: 'OPERATING_EXPENSE', parentId: '5000' },
  { code: '5900', name: 'Financial Charges', type: 'EXPENSE', subType: 'FINANCE_COST', parentId: '5000' },
  { code: '5910', name: 'Bank Charges', type: 'EXPENSE', subType: 'FINANCE_COST', parentId: '5900' },
  { code: '5920', name: 'Interest Expense', type: 'EXPENSE', subType: 'FINANCE_COST', parentId: '5900' },
];