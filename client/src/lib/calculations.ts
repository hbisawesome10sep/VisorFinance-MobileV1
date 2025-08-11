import { type Transaction } from "@shared/schema";

export interface FinancialSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyInvestments: number;
  netSavings: number;
  savingsRate: number;
  totalInvestments: number;
}

export interface InsightScore {
  score: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
}

export const calculateFinancialSummary = (transactions: Transaction[]): FinancialSummary => {
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  
  const monthlyTransactions = transactions.filter(t => 
    new Date(t.date) >= currentMonth
  );

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const monthlyInvestments = monthlyTransactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalInvestments = transactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyInvestments,
    netSavings,
    savingsRate,
    totalInvestments,
  };
};

export const calculateSavingsRateScore = (savingsRate: number): InsightScore => {
  if (savingsRate >= 30) {
    return { score: 95, category: 'excellent', color: 'hsl(142, 76%, 36%)' };
  } else if (savingsRate >= 20) {
    return { score: 80, category: 'good', color: 'hsl(142, 76%, 36%)' };
  } else if (savingsRate >= 10) {
    return { score: 60, category: 'fair', color: 'hsl(38, 92%, 50%)' };
  } else {
    return { score: 30, category: 'poor', color: 'hsl(1, 83%, 63%)' };
  }
};

export const calculateEmergencyFundScore = (
  currentAmount: number, 
  monthlyExpenses: number
): InsightScore => {
  const months = monthlyExpenses > 0 ? currentAmount / monthlyExpenses : 0;
  
  if (months >= 6) {
    return { score: 95, category: 'excellent', color: 'hsl(142, 76%, 36%)' };
  } else if (months >= 3) {
    return { score: 75, category: 'good', color: 'hsl(38, 92%, 50%)' };
  } else if (months >= 1) {
    return { score: 50, category: 'fair', color: 'hsl(38, 92%, 50%)' };
  } else {
    return { score: 20, category: 'poor', color: 'hsl(1, 83%, 63%)' };
  }
};

export const calculateFinancialHealthScore = (
  savingsRate: number,
  emergencyFundMonths: number,
  investmentRatio: number
): number => {
  const savingsScore = calculateSavingsRateScore(savingsRate).score;
  const emergencyScore = calculateEmergencyFundScore(emergencyFundMonths * 1000, 1000).score; // Mock calculation
  const investmentScore = Math.min(investmentRatio * 100, 100);
  
  return Math.round((savingsScore * 0.4 + emergencyScore * 0.3 + investmentScore * 0.3));
};

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  return `${symbol}${amount.toLocaleString('en-IN')}`;
};

export const formatAmount = (amount: string): string => {
  return parseFloat(amount).toLocaleString('en-IN');
};

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export const calculateCategoryBreakdown = (
  transactions: Transaction[], 
  type: 'income' | 'expense' | 'investment'
): CategoryBreakdown[] => {
  const filteredTransactions = transactions.filter(t => t.type === type);
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const categoryMap = new Map<string, { amount: number; count: number }>();
  
  filteredTransactions.forEach(transaction => {
    const existing = categoryMap.get(transaction.category) || { amount: 0, count: 0 };
    categoryMap.set(transaction.category, {
      amount: existing.amount + parseFloat(transaction.amount),
      count: existing.count + 1
    });
  });
  
  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const calculateMonthlyTrend = (transactions: Transaction[], type: 'income' | 'expense' | 'investment'): Array<{month: string; amount: number}> => {
  const monthlyData = new Map<string, number>();
  const now = new Date();
  
  // Get last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyData.set(monthKey, 0);
  }
  
  transactions
    .filter(t => t.type === type)
    .forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, monthlyData.get(monthKey)! + parseFloat(transaction.amount));
      }
    });
  
  return Array.from(monthlyData.entries()).map(([month, amount]) => ({ month, amount }));
};

export const getTopCategories = (transactions: Transaction[], type: 'expense' | 'income', limit: number = 5): CategoryBreakdown[] => {
  return calculateCategoryBreakdown(transactions, type).slice(0, limit);
};

export const calculateInvestmentPortfolio = (transactions: Transaction[]): CategoryBreakdown[] => {
  return calculateCategoryBreakdown(transactions, 'investment');
};
