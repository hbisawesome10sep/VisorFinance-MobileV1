import { type Transaction } from '@shared/schema';
import { STANDARD_ACCOUNTS, ACCOUNT_TYPES } from '@shared/accounting-schema';

// Map transaction categories to account codes
export const CATEGORY_ACCOUNT_MAPPING: Record<string, string> = {
  // Income categories
  'Salary': '4100',
  'Business': '4200',
  'Investment': '4300',
  'Dividend': '4310',
  'Interest': '4320',
  'Other Income': '4000',
  
  // Expense categories
  'Food': '5100',
  'Dining': '5100',
  'Transportation': '5200',
  'Fuel': '5200',
  'Utilities': '5300',
  'Entertainment': '5400',
  'Shopping': '5500',
  'Healthcare': '5600',
  'Medical': '5600',
  'Education': '5700',
  'Insurance': '5800',
  'Banking': '5910',
  'Finance': '5920',
  'Other': '5000',
};

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: Date;
  description: string;
  reference?: string;
  lines: JournalEntryLine[];
  totalAmount: number;
}

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
}

export interface LedgerAccount {
  code: string;
  name: string;
  type: string;
  subType?: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
  transactions: LedgerTransaction[];
}

export interface LedgerTransaction {
  date: Date;
  description: string;
  reference: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
}

export interface FinancialStatement {
  period: {
    from: Date;
    to: Date;
  };
  data: any;
}

export interface IncomeStatement extends FinancialStatement {
  data: {
    income: {
      operatingIncome: number;
      nonOperatingIncome: number;
      totalIncome: number;
    };
    expenses: {
      operatingExpenses: number;
      financeCosts: number;
      totalExpenses: number;
    };
    netIncome: number;
  };
}

export interface BalanceSheet extends FinancialStatement {
  data: {
    assets: {
      currentAssets: number;
      fixedAssets: number;
      investments: number;
      totalAssets: number;
    };
    liabilities: {
      currentLiabilities: number;
      nonCurrentLiabilities: number;
      totalLiabilities: number;
    };
    equity: {
      shareCapital: number;
      retainedEarnings: number;
      totalEquity: number;
    };
  };
}

export interface CashFlowStatement extends FinancialStatement {
  data: {
    operatingActivities: {
      netIncome: number;
      adjustments: number;
      cashFromOperations: number;
    };
    investingActivities: {
      investments: number;
      cashFromInvesting: number;
    };
    financingActivities: {
      loans: number;
      cashFromFinancing: number;
    };
    netCashFlow: number;
    openingCash: number;
    closingCash: number;
  };
}

// Convert transaction to journal entry using double-entry bookkeeping
export function createJournalEntryFromTransaction(transaction: Transaction): JournalEntry {
  const lines: JournalEntryLine[] = [];
  const amount = parseFloat(transaction.amount);
  
  // Get account code for the transaction category
  const categoryAccountCode = CATEGORY_ACCOUNT_MAPPING[transaction.category || 'Other'] || '5000';
  const categoryAccount = STANDARD_ACCOUNTS.find(acc => acc.code === categoryAccountCode);
  
  if (transaction.type === 'income') {
    // Debit: Cash/Bank Account (Asset increases)
    lines.push({
      id: `${transaction.id}-cash`,
      accountCode: '1120',
      accountName: 'Bank Account - Current',
      debitAmount: amount,
      creditAmount: 0,
      description: `${transaction.title} - Cash received`
    });
    
    // Credit: Income Account (Income increases)
    lines.push({
      id: `${transaction.id}-income`,
      accountCode: categoryAccountCode,
      accountName: categoryAccount?.name || 'Income',
      debitAmount: 0,
      creditAmount: amount,
      description: `${transaction.title} - Income earned`
    });
  } else if (transaction.type === 'expense') {
    // Debit: Expense Account (Expense increases)
    lines.push({
      id: `${transaction.id}-expense`,
      accountCode: categoryAccountCode,
      accountName: categoryAccount?.name || 'Expense',
      debitAmount: amount,
      creditAmount: 0,
      description: `${transaction.title} - Expense incurred`
    });
    
    // Credit: Cash/Bank Account (Asset decreases)
    lines.push({
      id: `${transaction.id}-cash`,
      accountCode: '1120',
      accountName: 'Bank Account - Current',
      debitAmount: 0,
      creditAmount: amount,
      description: `${transaction.title} - Cash paid`
    });
  } else if (transaction.type === 'investment') {
    // Debit: Investment Account (Asset increases)
    lines.push({
      id: `${transaction.id}-investment`,
      accountCode: '1210',
      accountName: 'Mutual Funds',
      debitAmount: amount,
      creditAmount: 0,
      description: `${transaction.title} - Investment made`
    });
    
    // Credit: Cash/Bank Account (Asset decreases)
    lines.push({
      id: `${transaction.id}-cash`,
      accountCode: '1120',
      accountName: 'Bank Account - Current',
      debitAmount: 0,
      creditAmount: amount,
      description: `${transaction.title} - Cash invested`
    });
  }
  
  return {
    id: `JE-${transaction.id}`,
    entryNumber: `JE${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
    date: new Date(transaction.date),
    description: transaction.title,
    reference: transaction.id,
    lines,
    totalAmount: amount
  };
}

// Generate ledger accounts from journal entries
export function generateLedgers(journalEntries: JournalEntry[]): LedgerAccount[] {
  const ledgers = new Map<string, LedgerAccount>();
  
  // Initialize all standard accounts
  STANDARD_ACCOUNTS.forEach(account => {
    ledgers.set(account.code, {
      code: account.code,
      name: account.name,
      type: account.type,
      subType: account.subType,
      debitBalance: 0,
      creditBalance: 0,
      netBalance: 0,
      transactions: []
    });
  });
  
  // Process journal entries
  journalEntries.forEach(entry => {
    entry.lines.forEach(line => {
      const ledger = ledgers.get(line.accountCode);
      if (ledger) {
        ledger.debitBalance += line.debitAmount;
        ledger.creditBalance += line.creditAmount;
        
        // Calculate net balance based on account type
        if (ledger.type === 'ASSET' || ledger.type === 'EXPENSE') {
          ledger.netBalance = ledger.debitBalance - ledger.creditBalance;
        } else {
          ledger.netBalance = ledger.creditBalance - ledger.debitBalance;
        }
        
        ledger.transactions.push({
          date: entry.date,
          description: entry.description,
          reference: entry.entryNumber,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          balance: ledger.netBalance
        });
      }
    });
  });
  
  return Array.from(ledgers.values()).filter(ledger => 
    ledger.debitBalance > 0 || ledger.creditBalance > 0
  );
}

// Generate Income Statement
export function generateIncomeStatement(
  ledgers: LedgerAccount[], 
  fromDate: Date, 
  toDate: Date
): IncomeStatement {
  const incomeLedgers = ledgers.filter(l => l.type === 'INCOME');
  const expenseLedgers = ledgers.filter(l => l.type === 'EXPENSE');
  
  const operatingIncome = incomeLedgers
    .filter(l => l.subType === 'OPERATING_INCOME')
    .reduce((sum, l) => sum + l.netBalance, 0);
    
  const nonOperatingIncome = incomeLedgers
    .filter(l => l.subType === 'NON_OPERATING_INCOME')
    .reduce((sum, l) => sum + l.netBalance, 0);
    
  const operatingExpenses = expenseLedgers
    .filter(l => l.subType === 'OPERATING_EXPENSE')
    .reduce((sum, l) => sum + l.netBalance, 0);
    
  const financeCosts = expenseLedgers
    .filter(l => l.subType === 'FINANCE_COST')
    .reduce((sum, l) => sum + l.netBalance, 0);
  
  const totalIncome = operatingIncome + nonOperatingIncome;
  const totalExpenses = operatingExpenses + financeCosts;
  const netIncome = totalIncome - totalExpenses;
  
  return {
    period: { from: fromDate, to: toDate },
    data: {
      income: {
        operatingIncome,
        nonOperatingIncome,
        totalIncome
      },
      expenses: {
        operatingExpenses,
        financeCosts,
        totalExpenses
      },
      netIncome
    }
  };
}

// Generate Balance Sheet
export function generateBalanceSheet(
  ledgers: LedgerAccount[], 
  asOfDate: Date
): BalanceSheet {
  const assetLedgers = ledgers.filter(l => l.type === 'ASSET');
  const liabilityLedgers = ledgers.filter(l => l.type === 'LIABILITY');
  const equityLedgers = ledgers.filter(l => l.type === 'EQUITY');
  
  const currentAssets = assetLedgers
    .filter(l => l.subType === 'CURRENT_ASSET')
    .reduce((sum, l) => sum + l.netBalance, 0);
    
  const fixedAssets = assetLedgers
    .filter(l => l.subType === 'FIXED_ASSET')
    .reduce((sum, l) => sum + l.netBalance, 0);
    
  const investments = assetLedgers
    .filter(l => l.subType === 'INVESTMENT')
    .reduce((sum, l) => sum + l.netBalance, 0);
    
  const currentLiabilities = liabilityLedgers
    .filter(l => l.subType === 'CURRENT_LIABILITY')
    .reduce((sum, l) => sum + l.netBalance, 0);
    
  const nonCurrentLiabilities = liabilityLedgers
    .filter(l => l.subType === 'NON_CURRENT_LIABILITY')
    .reduce((sum, l) => sum + l.netBalance, 0);
    
  const shareCapital = equityLedgers
    .filter(l => l.subType === 'SHARE_CAPITAL')
    .reduce((sum, l) => sum + l.netBalance, 0);
    
  const retainedEarnings = equityLedgers
    .filter(l => l.subType === 'RETAINED_EARNINGS')
    .reduce((sum, l) => sum + l.netBalance, 0);
  
  const totalAssets = currentAssets + fixedAssets + investments;
  const totalLiabilities = currentLiabilities + nonCurrentLiabilities;
  const totalEquity = shareCapital + retainedEarnings;
  
  return {
    period: { from: asOfDate, to: asOfDate },
    data: {
      assets: {
        currentAssets,
        fixedAssets,
        investments,
        totalAssets
      },
      liabilities: {
        currentLiabilities,
        nonCurrentLiabilities,
        totalLiabilities
      },
      equity: {
        shareCapital,
        retainedEarnings,
        totalEquity
      }
    }
  };
}

// Generate Cash Flow Statement
export function generateCashFlowStatement(
  transactions: Transaction[],
  fromDate: Date,
  toDate: Date
): CashFlowStatement {
  const periodTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= fromDate && tDate <= toDate;
  });
  
  const income = periodTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const expenses = periodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
  const investments = periodTransactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const netIncome = income - expenses;
  const cashFromOperations = netIncome;
  const cashFromInvesting = -investments;
  const cashFromFinancing = 0; // Add loan transactions here
  
  const netCashFlow = cashFromOperations + cashFromInvesting + cashFromFinancing;
  const openingCash = 0; // Calculate from previous period
  const closingCash = openingCash + netCashFlow;
  
  return {
    period: { from: fromDate, to: toDate },
    data: {
      operatingActivities: {
        netIncome,
        adjustments: 0,
        cashFromOperations
      },
      investingActivities: {
        investments: -investments,
        cashFromInvesting
      },
      financingActivities: {
        loans: 0,
        cashFromFinancing
      },
      netCashFlow,
      openingCash,
      closingCash
    }
  };
}