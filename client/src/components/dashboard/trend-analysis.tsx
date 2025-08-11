import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { type Transaction } from '@shared/schema';

interface TrendAnalysisProps {
  transactions: Transaction[];
  timeFrequency: 'quarter' | 'month' | 'year';
}

export function TrendAnalysis({ transactions, timeFrequency }: TrendAnalysisProps) {
  
  // Skip rendering if no transactions
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No transaction data available for trend analysis
          </div>
        </CardContent>
      </Card>
    );
  }
  // Generate trend data based on frequency
  const generateTrendData = () => {
    const now = new Date();
    const data = [];
    
    if (timeFrequency === 'quarter') {
      // Last 4 quarters
      for (let i = 3; i >= 0; i--) {
        const quarterStart = new Date(now.getFullYear(), now.getMonth() - (i * 3), 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        
        const quarterTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= quarterStart && tDate <= quarterEnd;
        });
        
        const income = quarterTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = quarterTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const investments = quarterTransactions
          .filter(t => t.type === 'investment')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        data.push({
          period: `Q${Math.floor(quarterStart.getMonth() / 3) + 1} ${quarterStart.getFullYear()}`,
          income,
          expenses,
          investments,
          netSavings: income - expenses,
          savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0
        });
      }
    } else if (timeFrequency === 'year') {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const yearTransactions = transactions.filter(t => 
          new Date(t.date).getFullYear() === year
        );
        
        const income = yearTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = yearTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const investments = yearTransactions
          .filter(t => t.type === 'investment')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        data.push({
          period: year.toString(),
          income,
          expenses,
          investments,
          netSavings: income - expenses,
          savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0
        });
      }
    } else {
      // Monthly data (last 12 months)
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === monthDate.getMonth() && 
                 tDate.getFullYear() === monthDate.getFullYear();
        });
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const investments = monthTransactions
          .filter(t => t.type === 'investment')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        data.push({
          period: monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          income,
          expenses,
          investments,
          netSavings: income - expenses,
          savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0
        });
      }
    }
    
    return data;
  };

  const trendData = generateTrendData();
  
  // Calculate insights
  const calculateInsights = () => {
    if (trendData.length < 2) return null;
    
    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    
    const incomeChange = ((latest.income - previous.income) / (previous.income || 1)) * 100;
    const expenseChange = ((latest.expenses - previous.expenses) / (previous.expenses || 1)) * 100;
    const savingsChange = latest.savingsRate - previous.savingsRate;
    
    const avgSavingsRate = trendData.reduce((sum, d) => sum + d.savingsRate, 0) / trendData.length;
    const consistentSavings = trendData.filter(d => d.savingsRate > 10).length;
    
    return {
      incomeChange,
      expenseChange,
      savingsChange,
      avgSavingsRate,
      consistentSavings,
      isImproving: incomeChange > 0 && expenseChange < incomeChange,
      period: timeFrequency === 'quarter' ? 'quarter' : timeFrequency === 'year' ? 'year' : 'month'
    };
  };

  const insights = calculateInsights();
  
  if (timeFrequency === 'month') {
    return null; // Don't show trend analysis for monthly view
  }

  return (
    <div className="space-y-6">
      {/* Financial Trend Overview */}
      <Card className="card-shadow border-2 border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <span>Financial Trend Analysis - {timeFrequency === 'quarter' ? 'Quarterly' : 'Annual'} View</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="period" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    `₹${value.toLocaleString()}`, 
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#ef4444', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="netSavings" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Savings Rate Trend */}
      <Card className="card-shadow border-2 border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span>Savings Rate Progression</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="period" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any) => [`${value.toFixed(1)}%`, 'Savings Rate']}
                />
                <Area 
                  type="monotone" 
                  dataKey="savingsRate" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      {insights && (
        <Card className="card-shadow border-2 border-border/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <span>Financial Insights & Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Income Trend */}
              <div className="p-4 rounded-xl border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    insights.incomeChange > 0 ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800'
                  }`}>
                    {insights.incomeChange > 0 ? 
                      <TrendingUp className="w-4 h-4 text-green-700 dark:text-green-300" /> :
                      <TrendingDown className="w-4 h-4 text-red-700 dark:text-red-300" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium">Income Trend</p>
                    <p className={`text-lg font-bold ${
                      insights.incomeChange > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                    }`}>
                      {insights.incomeChange > 0 ? '+' : ''}{insights.incomeChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Expense Trend */}
              <div className="p-4 rounded-xl border bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    insights.expenseChange < 0 ? 'bg-green-200 dark:bg-green-800' : 'bg-yellow-200 dark:bg-yellow-800'
                  }`}>
                    {insights.expenseChange < 0 ? 
                      <TrendingDown className="w-4 h-4 text-green-700 dark:text-green-300" /> :
                      <TrendingUp className="w-4 h-4 text-yellow-700 dark:text-yellow-300" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium">Expense Change</p>
                    <p className={`text-lg font-bold ${
                      insights.expenseChange < 0 ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {insights.expenseChange > 0 ? '+' : ''}{insights.expenseChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Average Savings Rate */}
              <div className="p-4 rounded-xl border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    insights.avgSavingsRate > 20 ? 'bg-green-200 dark:bg-green-800' : 
                    insights.avgSavingsRate > 10 ? 'bg-yellow-200 dark:bg-yellow-800' : 'bg-red-200 dark:bg-red-800'
                  }`}>
                    {insights.avgSavingsRate > 20 ? 
                      <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-300" /> :
                      insights.avgSavingsRate > 10 ?
                      <Target className="w-4 h-4 text-yellow-700 dark:text-yellow-300" /> :
                      <AlertTriangle className="w-4 h-4 text-red-700 dark:text-red-300" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium">Avg Savings Rate</p>
                    <p className={`text-lg font-bold ${
                      insights.avgSavingsRate > 20 ? 'text-green-700 dark:text-green-300' : 
                      insights.avgSavingsRate > 10 ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'
                    }`}>
                      {insights.avgSavingsRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="pt-4 border-t">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  insights.isImproving ? 'bg-green-200 dark:bg-green-800' : 'bg-yellow-200 dark:bg-yellow-800'
                }`}>
                  {insights.isImproving ? 
                    <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-300" /> :
                    <AlertTriangle className="w-4 h-4 text-yellow-700 dark:text-yellow-300" />
                  }
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">
                    {insights.isImproving ? 'Financial Health Improving' : 'Focus Areas Identified'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {insights.isImproving 
                      ? `Your financial position has strengthened over the past ${insights.period}. Income growth is outpacing expense increases, contributing to better savings performance.`
                      : `Consider reviewing your expense patterns and exploring opportunities to increase income. Your current average savings rate of ${insights.avgSavingsRate.toFixed(1)}% has room for improvement.`
                    }
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant={insights.consistentSavings > trendData.length / 2 ? "default" : "secondary"}>
                      {insights.consistentSavings}/{trendData.length} periods with 10%+ savings
                    </Badge>
                    <Badge variant={insights.savingsChange > 0 ? "default" : "secondary"}>
                      {insights.savingsChange > 0 ? '+' : ''}{insights.savingsChange.toFixed(1)}% savings rate change
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}