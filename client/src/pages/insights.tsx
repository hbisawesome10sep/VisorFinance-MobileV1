import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  CheckCircle, 
  Shield,
  Heart,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  Award,
  AlertCircle,
  Info,
  BarChart3,
  Calculator,
  ArrowLeft,
  Calendar,
  Percent,
  CreditCard,
  Banknote,
  PiggyBank
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { 
  calculateFinancialSummary, 
  calculateFinancialHealthScore,
  formatCurrency
} from '@/lib/calculations';
import { type Transaction, type Goal } from '@shared/schema';

// Financial Health Calculation Functions
function calculateEMIToIncomeRatio(transactions: Transaction[]): number {
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const monthlyEMI = transactions
    .filter(t => t.type === 'expense' && (t.category?.toLowerCase().includes('loan') || t.category?.toLowerCase().includes('emi')))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  return monthlyIncome > 0 ? (monthlyEMI / monthlyIncome) * 100 : 0;
}

function calculateDebtToIncomeRatio(transactions: Transaction[]): number {
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const monthlyDebtPayments = transactions
    .filter(t => t.type === 'expense' && (
      t.category?.toLowerCase().includes('loan') || 
      t.category?.toLowerCase().includes('emi') ||
      t.category?.toLowerCase().includes('credit card')
    ))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  return monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;
}

function calculateInvestmentRatio(transactions: Transaction[]): number {
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const monthlyInvestments = transactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  return monthlyIncome > 0 ? (monthlyInvestments / monthlyIncome) * 100 : 0;
}

function calculateLiquidityRatio(transactions: Transaction[]): number {
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  // Assuming liquid savings as 20% of total income (simplified)
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const liquidSavings = monthlyIncome * 0.2; // Simplified calculation
  
  return monthlyExpenses > 0 ? liquidSavings / monthlyExpenses : 0;
}

// Indian Benchmarks (from research data)
const INDIAN_BENCHMARKS = {
  emiToIncome: {
    excellent: 20,
    good: 30,
    average: 40,
    poor: 50,
    national: 33 // Current Indian average
  },
  debtToIncome: {
    excellent: 20,
    good: 30,
    average: 40,
    poor: 50,
    national: 39.1 // Current Indian household debt to GDP
  },
  savingsRate: {
    excellent: 30,
    good: 20,
    average: 15,
    poor: 10,
    national: 5.1 // Current Indian household financial savings rate
  },
  investmentRatio: {
    excellent: 100, // Allow for large investment months (like SIP, stock purchases)
    good: 50,
    average: 25,
    poor: 15,
    national: 11.4 // Current Indian household financial assets
  }
};

// Health Score Component
function HealthScoreCard({ title, score, benchmark, icon: Icon, description, comparison }: {
  title: string;
  score: number;
  benchmark: any;
  icon: any;
  description: string;
  comparison: string;
}) {
  const getScoreColor = () => {
    if (score <= benchmark.excellent) return 'text-green-600';
    if (score <= benchmark.good) return 'text-blue-600';
    if (score <= benchmark.average) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = () => {
    if (score <= benchmark.excellent) return { label: 'Excellent', bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800/50' };
    if (score <= benchmark.good) return { label: 'Good', bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800/50' };
    if (score <= benchmark.average) return { label: 'Average', bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800/50' };
    return { label: 'Needs Improvement', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800/50' };
  };

  const status = getScoreStatus();

  return (
    <Card className={`card-shadow border-2 ${status.border} rounded-2xl ${status.bg}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${status.bg} rounded-2xl flex items-center justify-center border ${status.border}`}>
              <Icon className={`w-5 h-5 ${getScoreColor()}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant="secondary" className="mt-1">{status.label}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor()}`}>
              {score.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Your Score</span>
            <span className={getScoreColor()}>{score.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>National Average</span>
            <span className="text-muted-foreground">{benchmark.national}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Benchmark</span>
            <span className="text-green-600">&lt;{benchmark.excellent}% (Excellent)</span>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-xl bg-muted/50">
          <p className="text-xs text-muted-foreground">{comparison}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Flip Card Component
interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
}

function FlipCard({ frontContent, backContent, className = "" }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className={`${className}`} style={{ minHeight: '400px' }}>
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '400px',
          cursor: 'pointer'
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          <div 
            style={{
              width: '100%',
              height: '100%',
              transition: 'all 0.3s ease'
            }}
          >
            {frontContent}
          </div>
        ) : (
          <div 
            style={{
              width: '100%',
              height: '100%',
              transition: 'all 0.3s ease'
            }}
          >
            {backContent}
          </div>
        )}
      </div>
    </div>
  );
}

// Historical trend data for Indian financial metrics (simulated but based on real trends)
const getHistoricalTrendData = (metricType: string) => {
  const baseData = [
    { year: '2020', value: 0 },
    { year: '2021', value: 0 },
    { year: '2022', value: 0 },
    { year: '2023', value: 0 },
    { year: '2024', value: 0 },
    { year: '2025', value: 0 }
  ];

  switch (metricType) {
    case 'savings':
      return baseData.map((item, index) => ({
        ...item,
        national: [4.8, 4.9, 5.0, 5.1, 5.1, 5.2][index],
        target: [15, 15, 15, 15, 15, 15][index]
      }));
    case 'emi':
      return baseData.map((item, index) => ({
        ...item,
        national: [30, 31, 32, 33, 33, 34][index],
        target: [20, 20, 20, 20, 20, 20][index]
      }));
    case 'investment':
      return baseData.map((item, index) => ({
        ...item,
        national: [10.5, 10.8, 11.0, 11.2, 11.4, 11.6][index],
        target: [25, 25, 25, 25, 25, 25][index]
      }));
    case 'debt':
      return baseData.map((item, index) => ({
        ...item,
        national: [37.2, 38.1, 38.8, 39.1, 39.1, 39.5][index],
        target: [20, 20, 20, 20, 20, 20][index]
      }));
    default:
      return baseData;
  }
};

// Main Component
export default function Insights() {
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['/api/analytics/summary'],
  });

  const summary = analyticsData || calculateFinancialSummary(transactions);
  
  // Calculate proper financial health metrics using actual user data  
  const monthlyIncome = (summary as any)?.monthlyIncome || 0;
  const monthlyExpenses = (summary as any)?.monthlyExpenses || 0;
  const monthlyInvestments = (summary as any)?.monthlyInvestments || 0;
  const totalInvestments = (summary as any)?.totalInvestments || 0;
  
  // Calculate accurate ratios based on real user data
  const savingsRate = monthlyIncome > 0 ? Math.max(0, ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;
  const investmentAllocation = monthlyIncome > 0 ? (monthlyInvestments / monthlyIncome) * 100 : 0;
  const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
  const emergencyFundMonths = monthlyExpenses > 0 ? totalInvestments / monthlyExpenses : 0;
  
  // Calculate all financial health ratios
  const emiToIncomeRatio = calculateEMIToIncomeRatio(transactions);
  const debtToIncomeRatio = calculateDebtToIncomeRatio(transactions);
  const liquidityRatio = calculateLiquidityRatio(transactions);
  
  // Additional variables for the new card design
  const emiRatio = emiToIncomeRatio;
  const investmentRate = investmentAllocation; 
  const debtRatio = debtToIncomeRatio;

  // Calculate overall financial health score
  const financialHealthScore = calculateFinancialHealthScore(
    savingsRate,
    (summary as any)?.monthlyExpenses || 0,
    (summary as any)?.monthlyIncome || 0
  );

  // Performance vs benchmarks data for chart
  const benchmarkData = [
    {
      name: 'EMI Ratio',
      yourScore: emiToIncomeRatio,
      benchmark: INDIAN_BENCHMARKS.emiToIncome.excellent,
      national: INDIAN_BENCHMARKS.emiToIncome.national,
    },
    {
      name: 'Debt Ratio',
      yourScore: debtToIncomeRatio,
      benchmark: INDIAN_BENCHMARKS.debtToIncome.excellent,
      national: INDIAN_BENCHMARKS.debtToIncome.national,
    },
    {
      name: 'Savings Rate',
      yourScore: savingsRate,
      benchmark: INDIAN_BENCHMARKS.savingsRate.excellent,
      national: INDIAN_BENCHMARKS.savingsRate.national,
    },
    {
      name: 'Investment Rate',
      yourScore: investmentAllocation,
      benchmark: INDIAN_BENCHMARKS.investmentRatio.excellent,
      national: INDIAN_BENCHMARKS.investmentRatio.national,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-800 dark:via-emerald-800/30 dark:to-teal-800/30 oled:from-black oled:via-emerald-950/20 oled:to-teal-950/20">
      {/* Modern Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 shadow-lg shadow-black/5">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                AI Financial Insights
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">Advanced financial health analysis powered by real-time Indian data</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        
        {/* Financial Health Score */}
        <Card className="card-shadow border-2 border-border/50 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Financial Health Score</CardTitle>
                  <p className="text-muted-foreground">Based on Indian financial standards and RBI guidelines</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">{financialHealthScore}/100</div>
                <p className="text-sm text-muted-foreground">
                  {financialHealthScore >= 80 ? 'Excellent' : 
                   financialHealthScore >= 60 ? 'Good' : 
                   financialHealthScore >= 40 ? 'Average' : 'Needs Improvement'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={financialHealthScore} className="h-3 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{savingsRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Savings Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{emiToIncomeRatio.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">EMI Ratio</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{investmentAllocation.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Investment Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{liquidityRatio.toFixed(1)}x</div>
                <div className="text-xs text-muted-foreground">Liquidity Ratio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Statistical Insights with Flip Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Monthly Savings Analysis with Flip Card */}
          <FlipCard
            frontContent={
              <Card className="card-shadow border-2 border-green-200 dark:border-green-800/50 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center border border-green-200 dark:border-green-800/50">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Savings Rate</CardTitle>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">Higher percentage builds stronger emergency fund and long-term financial stability</p>
                        <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {savingsRate > 20 ? 'Excellent' : savingsRate > 10 ? 'Good' : savingsRate > 0 ? 'Fair' : 'Critical'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {savingsRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-600">of income</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Savings</span>
                      <span className="font-medium text-green-600">₹{((monthlyIncome - monthlyExpenses) / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>National Average</span>
                      <span className="text-muted-foreground">5.1%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Recommended Target</span>
                      <span className="text-blue-600">20%+</span>
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Click to see detailed analysis and trends
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
            backContent={
              <Card className="card-shadow border-2 border-green-200 dark:border-green-800/50 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center border border-green-200 dark:border-green-800/50">
                        <Calculator className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">How It's Calculated</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Formula & Trends
                        </Badge>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                      <h4 className="font-semibold text-sm mb-2">Calculation</h4>
                      <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                        (Monthly Income - Monthly Expenses) ÷ Monthly Income × 100
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Your: (₹{(monthlyIncome/1000).toFixed(0)}k - ₹{(monthlyExpenses/1000).toFixed(0)}k) ÷ ₹{(monthlyIncome/1000).toFixed(0)}k = {savingsRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getHistoricalTrendData('savings')}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="year" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip formatter={(value: any, name: string) => [`${value}%`, name === 'national' ? 'National Avg' : 'Target']} />
                          <Line dataKey="national" stroke="#ef4444" strokeWidth={2} />
                          <Line dataKey="target" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on RBI data. Indian household savings rate has remained around 5.1% while experts recommend 20%+.
                    </p>
                  </div>
                </CardContent>
              </Card>
            }
          />

          {/* Investment Activity with Flip Card */}
          <FlipCard
            frontContent={
              <Card className="card-shadow border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Investment Rate</CardTitle>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Higher allocation accelerates wealth creation and long-term financial growth</p>
                        <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {investmentAllocation > 25 ? 'Excellent' : investmentAllocation > 15 ? 'Good' : investmentAllocation > 5 ? 'Fair' : 'Low'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {investmentAllocation.toFixed(1)}%
                      </div>
                      <div className="text-sm text-blue-600">of income</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Investment</span>
                      <span className="font-medium text-blue-600">₹{(monthlyInvestments / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>National Average</span>
                      <span className="text-muted-foreground">11.4%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Recommended Target</span>
                      <span className="text-emerald-600">25%+</span>
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Click to see wealth-building analysis and trends
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
            backContent={
              <Card className="card-shadow border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
                        <Calculator className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Investment Analysis</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Wealth Building
                        </Badge>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-semibold text-sm mb-2">Calculation</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                        Monthly Investments ÷ Monthly Income × 100
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Your: ₹{(monthlyInvestments/1000).toFixed(1)}k ÷ ₹{(monthlyIncome/1000).toFixed(0)}k = {investmentAllocation.toFixed(1)}%
                      </p>
                    </div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getHistoricalTrendData('investment')}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="year" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip formatter={(value: any, name: string) => [`${value}%`, name === 'national' ? 'National Avg' : 'Target']} />
                          <Line dataKey="national" stroke="#ef4444" strokeWidth={2} />
                          <Line dataKey="target" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Regular investing (15-25% of income) is key to long-term wealth creation in India.
                    </p>
                  </div>
                </CardContent>
              </Card>
            }
          />

          {/* EMI to Income Ratio with Flip Card */}
          <FlipCard
            frontContent={
              <Card className="card-shadow border-2 border-orange-200 dark:border-orange-800/50 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center border border-orange-200 dark:border-orange-800/50">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">EMI Burden</CardTitle>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Lower percentage indicates more disposable income and financial flexibility</p>
                        <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          {emiToIncomeRatio < 20 ? 'Excellent' : emiToIncomeRatio < 30 ? 'Good' : emiToIncomeRatio < 40 ? 'Fair' : 'High Risk'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-600">
                        {emiToIncomeRatio.toFixed(1)}%
                      </div>
                      <div className="text-sm text-orange-600">of income</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Monthly EMI</span>
                      <span className="font-medium text-orange-600">₹{(monthlyIncome * emiToIncomeRatio / 100 / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>National Average</span>
                      <span className="text-muted-foreground">33%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Safe Limit</span>
                      <span className="text-green-600">&lt;30%</span>
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Click to see debt management analysis
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
            backContent={
              <Card className="card-shadow border-2 border-orange-200 dark:border-orange-800/50 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center border border-orange-200 dark:border-orange-800/50">
                        <Calculator className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">EMI Analysis</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          Debt Management
                        </Badge>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                      <h4 className="font-semibold text-sm mb-2">Calculation</h4>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">
                        Total Monthly EMI ÷ Monthly Income × 100
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        RBI recommends keeping EMI burden below 30% for financial health
                      </p>
                    </div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getHistoricalTrendData('emi')}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="year" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip formatter={(value: any, name: string) => [`${value}%`, name === 'national' ? 'National Avg' : 'Safe Limit']} />
                          <Line dataKey="national" stroke="#ef4444" strokeWidth={2} />
                          <Line dataKey="target" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Indian EMI burden has increased from 30% to 33%. Keep yours below 30% for safety.
                    </p>
                  </div>
                </CardContent>
              </Card>
            }
          />

          {/* Spending Velocity (New Insight) */}
          <FlipCard
            frontContent={
              <Card className="card-shadow border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center border border-purple-200 dark:border-purple-800/50">
                        <Activity className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Spending Velocity</CardTitle>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Lower percentage leaves more room for savings and investments</p>
                        <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          {expenseRatio < 70 ? 'Controlled' : expenseRatio < 85 ? 'Moderate' : 'High'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-600">
                        {expenseRatio.toFixed(1)}%
                      </div>
                      <div className="text-sm text-purple-600">of income</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Expenses</span>
                      <span className="font-medium text-purple-600">₹{(monthlyExpenses / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average for Income</span>
                      <span className="text-muted-foreground">75-80%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Optimal Range</span>
                      <span className="text-green-600">&lt;70%</span>
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Click to see spending pattern analysis
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
            backContent={
              <Card className="card-shadow border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center border border-purple-200 dark:border-purple-800/50">
                        <Calculator className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Spending Analysis</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          Cash Flow Control
                        </Badge>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                      <h4 className="font-semibold text-sm mb-2">Calculation</h4>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                        Monthly Expenses ÷ Monthly Income × 100
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        Your: ₹{(monthlyExpenses/1000).toFixed(1)}k ÷ ₹{(monthlyIncome/1000).toFixed(0)}k = {expenseRatio.toFixed(1)}%
                      </p>
                    </div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { category: 'Food', value: 25, ideal: 20 },
                          { category: 'Housing', value: 35, ideal: 30 },
                          { category: 'Transport', value: 15, ideal: 15 },
                          { category: 'Utilities', value: 10, ideal: 10 },
                          { category: 'Others', value: 15, ideal: 25 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="category" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip formatter={(value: any, name: string) => [`${value}%`, name === 'value' ? 'Your %' : 'Ideal %']} />
                          <Area dataKey="value" stackId="1" stroke="#9333ea" fill="#9333ea" fillOpacity={0.6} />
                          <Area dataKey="ideal" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optimal spending: 30% housing, 20% food, 15% transport, 10% utilities, 25% savings/investments.
                    </p>
                  </div>
                </CardContent>
              </Card>
            }
          />

          {/* Financial Runway (New Comprehensive Insight) */}
          <FlipCard
            frontContent={
              <Card className="card-shadow border-2 border-cyan-200 dark:border-cyan-800/50 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center border border-cyan-200 dark:border-cyan-800/50">
                        <Calendar className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Financial Runway</CardTitle>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Higher months provide better security during income interruptions</p>
                        <Badge variant="secondary" className="mt-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                          {emergencyFundMonths >= 6 ? 'Secure' : emergencyFundMonths >= 3 ? 'Protected' : 'Build Needed'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-cyan-600">
                        {emergencyFundMonths.toFixed(1)}
                      </div>
                      <div className="text-sm text-cyan-600">months</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Emergency Fund</span>
                      <span className="font-medium text-cyan-600">₹{(totalInvestments / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Monthly Burn Rate</span>
                      <span className="text-muted-foreground">₹{(monthlyExpenses / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target (6 months)</span>
                      <span className="text-green-600">₹{(monthlyExpenses * 6 / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20">
                      <p className="text-xs text-cyan-700 dark:text-cyan-300">
                        Click to see detailed runway analysis
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
            backContent={
              <Card className="card-shadow border-2 border-cyan-200 dark:border-cyan-800/50 rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center border border-cyan-200 dark:border-cyan-800/50">
                        <Calculator className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Runway Analysis</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                          Survival Planning
                        </Badge>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20">
                      <h4 className="font-semibold text-sm mb-2">Calculation</h4>
                      <p className="text-xs text-cyan-700 dark:text-cyan-300 mb-2">
                        Emergency Fund ÷ Monthly Expenses
                      </p>
                      <p className="text-xs text-cyan-700 dark:text-cyan-300">
                        ₹{(totalInvestments/1000).toFixed(1)}k ÷ ₹{(monthlyExpenses/1000).toFixed(1)}k = {emergencyFundMonths.toFixed(1)} months
                      </p>
                    </div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { scenario: '3 Months', current: emergencyFundMonths > 3 ? 3 : emergencyFundMonths, target: 3 },
                          { scenario: '6 Months', current: emergencyFundMonths > 6 ? 6 : emergencyFundMonths, target: 6 },
                          { scenario: '12 Months', current: emergencyFundMonths > 12 ? 12 : emergencyFundMonths, target: 12 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="scenario" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip formatter={(value: any, name: string) => [`${value} months`, name === 'current' ? 'Your Level' : 'Target']} />
                          <Area dataKey="current" stackId="1" stroke="#0891b2" fill="#0891b2" fillOpacity={0.6} />
                          <Area dataKey="target" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Financial experts recommend 3-6 months emergency fund. Ultra-safe is 12 months for entrepreneurs.
                    </p>
                  </div>
                </CardContent>
              </Card>
            }
          />

          {/* Wealth Accumulation Rate (New Insight) */}
          <FlipCard
            frontContent={
              <Card className="card-shadow border-2 border-indigo-200 dark:border-indigo-800/50 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Wealth Velocity</CardTitle>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Combined savings and investment rate shows wealth accumulation speed</p>
                        <Badge variant="secondary" className="mt-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {(savingsRate + investmentAllocation) > 40 ? 'Rapid' : (savingsRate + investmentAllocation) > 25 ? 'Strong' : (savingsRate + investmentAllocation) > 15 ? 'Steady' : 'Slow'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-indigo-600">
                        {(savingsRate + investmentAllocation).toFixed(1)}%
                      </div>
                      <div className="text-sm text-indigo-600">accumulation</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Wealth Build</span>
                      <span className="font-medium text-indigo-600">₹{((monthlyIncome - monthlyExpenses + monthlyInvestments) / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Annual Projection</span>
                      <span className="text-muted-foreground">₹{((monthlyIncome - monthlyExpenses + monthlyInvestments) * 12 / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target Rate</span>
                      <span className="text-green-600">30%+</span>
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">
                        Click to see wealth-building projection
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
            backContent={
              <Card className="card-shadow border-2 border-indigo-200 dark:border-indigo-800/50 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
                        <Calculator className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Wealth Projection</CardTitle>
                        <Badge variant="secondary" className="mt-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          Future Value
                        </Badge>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                      <h4 className="font-semibold text-sm mb-2">Calculation</h4>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-2">
                        (Savings + Investments) ÷ Income × 100
                      </p>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">
                        At current rate: ₹{((monthlyIncome - monthlyExpenses + monthlyInvestments) * 12 * 10 / 100000).toFixed(1)}L in 10 years
                      </p>
                    </div>
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { year: 1, value: (monthlyIncome - monthlyExpenses + monthlyInvestments) * 12 / 100000 },
                          { year: 5, value: (monthlyIncome - monthlyExpenses + monthlyInvestments) * 12 * 5 / 100000 },
                          { year: 10, value: (monthlyIncome - monthlyExpenses + monthlyInvestments) * 12 * 10 / 100000 },
                          { year: 15, value: (monthlyIncome - monthlyExpenses + monthlyInvestments) * 12 * 15 / 100000 },
                          { year: 20, value: (monthlyIncome - monthlyExpenses + monthlyInvestments) * 12 * 20 / 100000 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="year" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip formatter={(value: any) => [`₹${value.toFixed(1)}L`, 'Wealth']} />
                          <Line dataKey="value" stroke="#4f46e5" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Linear projection assuming consistent savings/investment rate. Actual returns may vary with compound growth.
                    </p>
                  </div>
                </CardContent>
              </Card>
            }
          />
        </div>

        {/* FOIR Ratio Card */}
        <Card className="card-shadow border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50">
                  <Calculator className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Your FOIR Ratio</CardTitle>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Fixed Obligations to Income Ratio - Banks use this to approve your loans</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                Bank Standard
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* FOIR Display */}
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  {((monthlyExpenses / monthlyIncome) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Your current FOIR</p>
              </div>

              {/* FOIR Status */}
              <div className="flex justify-center">
                {((monthlyExpenses / monthlyIncome) * 100) <= 50 ? (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-300 font-medium">Excellent - Banks will approve your loans easily</span>
                  </div>
                ) : ((monthlyExpenses / monthlyIncome) * 100) <= 60 ? (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-800 dark:text-yellow-300 font-medium">Moderate - Some banks may approve with conditions</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800 dark:text-red-300 font-medium">High Risk - Banks may reject loan applications</span>
                  </div>
                )}
              </div>

              {/* FOIR Breakdown */}
              <div className="bg-white dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/50">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3">FOIR Calculation Breakdown:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monthly Fixed Obligations:</span>
                    <span className="font-medium">₹{(monthlyExpenses/1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monthly Gross Income:</span>
                    <span className="font-medium">₹{(monthlyIncome/1000).toFixed(1)}k</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-semibold">
                    <span>FOIR Ratio:</span>
                    <span className="text-emerald-600">{((monthlyExpenses / monthlyIncome) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* What This Means */}
              <div className="space-y-3">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">What FOIR Means for You:</h4>
                <div className="space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Bank Loans:</strong> Lower FOIR = higher chances of getting home loans, personal loans, and credit cards approved</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Interest Rates:</strong> Good FOIR can help you negotiate better interest rates with banks</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Financial Health:</strong> FOIR below 50% indicates you have good control over your fixed expenses</p>
                  </div>
                </div>
              </div>

              {/* Bank Standards */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/50">
                <h5 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">Indian Bank Standards:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="text-center p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
                    <div className="font-bold text-green-800 dark:text-green-300">≤ 50%</div>
                    <div className="text-green-700 dark:text-green-400">Excellent</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                    <div className="font-bold text-yellow-800 dark:text-yellow-300">50-60%</div>
                    <div className="text-yellow-700 dark:text-yellow-400">Acceptable</div>
                  </div>
                  <div className="text-center p-2 bg-red-100 dark:bg-red-900/20 rounded-xl">
                    <div className="font-bold text-red-800 dark:text-red-300">&gt; 60%</div>
                    <div className="text-red-700 dark:text-red-400">High Risk</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Comparison Chart */}
        <Card className="card-shadow border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Are You Doing Better Than Most Indians?</CardTitle>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">See where you stand compared to average Indians and financial experts' recommendations</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                Comparative Analysis
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Modern Metric Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Savings Rate Card */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                      <PiggyBank className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">Savings Rate</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Monthly savings vs income</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Higher percentage means better financial security and wealth building potential</p>
                    </div>
                  </div>
                  <Badge className={`${savingsRate >= 20 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                    savingsRate >= 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Needs Work'}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-end space-x-2 mb-2">
                    <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">{savingsRate.toFixed(1)}%</span>
                    <span className="text-sm text-muted-foreground mb-1">of income</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((savingsRate / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>Expert: 20%+</span>
                      <span>30%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">You</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">{savingsRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Indian</span>
                    <span className="text-sm text-red-600">5.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Expert Target</span>
                    <span className="text-sm text-green-600">20%+</span>
                  </div>
                </div>
              </div>

              {/* EMI Ratio Card */}
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-2xl border border-orange-200 dark:border-orange-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">EMI Burden</h3>
                      <p className="text-sm text-orange-700 dark:text-orange-300">Loan payments vs income</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Lower percentage indicates more disposable income and financial flexibility</p>
                    </div>
                  </div>
                  <Badge className={`${emiRatio <= 30 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                    emiRatio <= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {emiRatio <= 30 ? 'Healthy' : emiRatio <= 40 ? 'Moderate' : 'High Risk'}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-end space-x-2 mb-2">
                    <span className="text-3xl font-bold text-orange-900 dark:text-orange-100">{emiRatio.toFixed(1)}%</span>
                    <span className="text-sm text-muted-foreground mb-1">of income</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-orange-100 dark:bg-orange-900/20 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 ${
                          emiRatio <= 30 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          emiRatio <= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${Math.min((emiRatio / 60) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>Safe: &lt;30%</span>
                      <span>60%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">You</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">{emiRatio.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Indian</span>
                    <span className="text-sm text-red-600">33%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Safe Limit</span>
                    <span className="text-sm text-green-600">&lt;30%</span>
                  </div>
                </div>
              </div>

              {/* Investment Rate Card */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl border border-green-200 dark:border-green-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100">Investment Rate</h3>
                      <p className="text-sm text-green-700 dark:text-green-300">Monthly investments vs income</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">Higher allocation accelerates wealth creation and long-term financial growth</p>
                    </div>
                  </div>
                  <Badge className={`${investmentRate >= 15 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                    investmentRate >= 8 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {investmentRate >= 15 ? 'Strong' : investmentRate >= 8 ? 'Building' : 'Start Now'}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-end space-x-2 mb-2">
                    <span className="text-3xl font-bold text-green-900 dark:text-green-100">{investmentRate.toFixed(1)}%</span>
                    <span className="text-sm text-muted-foreground mb-1">of income</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-green-100 dark:bg-green-900/20 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((investmentRate / 25) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>Goal: 15%+</span>
                      <span>25%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">You</span>
                    <span className="font-medium text-green-900 dark:text-green-100">{investmentRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Indian</span>
                    <span className="text-sm text-red-600">3.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wealth Building</span>
                    <span className="text-sm text-green-600">15%+</span>
                  </div>
                </div>
              </div>

              {/* Debt Ratio Card */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 rounded-2xl border border-purple-200 dark:border-purple-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">Debt Burden</h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Total debt vs annual income</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Lower ratio means healthier finances and reduced risk of financial stress</p>
                    </div>
                  </div>
                  <Badge className={`${debtRatio <= 200 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                    debtRatio <= 400 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {debtRatio <= 200 ? 'Manageable' : debtRatio <= 400 ? 'Moderate' : 'High Risk'}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-end space-x-2 mb-2">
                    <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">{debtRatio.toFixed(0)}%</span>
                    <span className="text-sm text-muted-foreground mb-1">of annual income</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-purple-100 dark:bg-purple-900/20 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 ${
                          debtRatio <= 200 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          debtRatio <= 400 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${Math.min((debtRatio / 600) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>Safe: &lt;200%</span>
                      <span>600%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">You</span>
                    <span className="font-medium text-purple-900 dark:text-purple-100">{debtRatio.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Indian</span>
                    <span className="text-sm text-red-600">391%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Safe Range</span>
                    <span className="text-sm text-green-600">&lt;200%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* What This Means for You */}
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3">What This Chart Tells You:</h4>
              <div className="space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Savings Rate:</strong> How much of your income you save each month (higher = better financial future)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>EMI Ratio:</strong> What percentage of income goes to loan payments (lower = more financial freedom)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Investment Rate:</strong> How much you invest for long-term wealth (higher = better retirement planning)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong>Debt Ratio:</strong> Total debt compared to your income (lower = healthier finances)</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white dark:bg-emerald-950/30 rounded-xl border border-emerald-300 dark:border-emerald-700/50">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  💡 <strong>Quick Tip:</strong> If your blue line is above the red line, you're doing better than most Indians! 
                  If it's above the green line, you're following expert recommendations. Keep it up!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actionable Recommendations */}
        <Card className="card-shadow border-2 border-teal-200 dark:border-teal-800/50 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center border border-teal-200 dark:border-teal-800/50">
                  <Heart className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Your Next Financial Steps</CardTitle>
                  <p className="text-sm text-teal-700 dark:text-teal-300">Practical advice based on your current financial situation</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">
                Action Plan
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsRate <= 0 && (
                <div className="flex items-start space-x-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800 dark:text-red-300">Immediate Action Required</h4>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      You're spending ₹{((monthlyExpenses - monthlyIncome)/1000).toFixed(1)}k more than you earn monthly. Review and cut non-essential expenses immediately.
                    </p>
                  </div>
                </div>
              )}
              
              {emergencyFundMonths < 3 && savingsRate > 0 && (
                <div className="flex items-start space-x-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50">
                  <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300">Priority: Build Emergency Fund</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                      Save ₹{((monthlyExpenses * 6 - totalInvestments)/1000).toFixed(0)}k more to reach 6 months of expenses (₹{((monthlyExpenses * 6)/1000).toFixed(0)}k total).
                    </p>
                  </div>
                </div>
              )}
              
              {monthlyInvestments === 0 && savingsRate > 15 && emergencyFundMonths >= 3 && (
                <div className="flex items-start space-x-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Ready to Invest</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Great job on savings! Consider starting SIP investments with ₹{((monthlyIncome - monthlyExpenses) * 0.5 / 1000).toFixed(1)}k monthly for wealth building.
                    </p>
                  </div>
                </div>
              )}
              
              {savingsRate > 0 && savingsRate < 15 && (
                <div className="flex items-start space-x-4 p-4 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50">
                  <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">Increase Your Savings</h4>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      You're saving ₹{((monthlyIncome - monthlyExpenses)/1000).toFixed(1)}k monthly. Try to save ₹{((monthlyIncome * 0.2)/1000).toFixed(1)}k (20% of income) for better financial health.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="card-shadow border-2 border-slate-200 dark:border-slate-800/50 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-900/20 dark:to-emerald-900/20">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900/30 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800/50">
                <Info className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-sm">Data Sources & Methodology</CardTitle>
                <p className="text-xs text-slate-600 dark:text-slate-400">Authenticated financial data from RBI and Indian institutions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <h5 className="font-semibold mb-2">Indian Financial Data Sources:</h5>
                <ul className="space-y-1">
                  <li>• Reserve Bank of India (RBI) - Household Financial Savings Data</li>
                  <li>• CEIC Data - Household Debt Statistics (March 2024)</li>
                  <li>• Business Standard - EMI to Income Study (2024)</li>
                  <li>• Motilal Oswal Research - Debt Analysis</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Benchmark Standards:</h5>
                <ul className="space-y-1">
                  <li>• National average EMI ratio: 33% (2024)</li>
                  <li>• Household debt to GDP: 39.1% (Q4 2024)</li>
                  <li>• Financial savings rate: 5.1% of GDP (2024)</li>
                  <li>• RBI lending guidelines and financial health standards</li>
                </ul>
              </div>
            </div>
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground">
              All financial ratios and benchmarks are based on latest available data from Indian financial institutions and regulatory bodies. 
              Last updated: January 2025. Data reflects current Indian market conditions and RBI guidelines.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}