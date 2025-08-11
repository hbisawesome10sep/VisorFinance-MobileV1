import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, Building, PiggyBank, Target, BarChart3, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PortfolioChart } from '@/components/investments/portfolio-chart';
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal';
import { RiskAssessment, RiskProfileDisplay, type RiskProfile } from '@/components/investments/risk-assessment';
import { InvestmentStrategy } from '@/components/investments/investment-strategy';

import { formatCurrency, calculateFinancialSummary, calculateInvestmentPortfolio } from '@/lib/calculations';
import { apiRequest } from '@/lib/queryClient';
import { type Transaction, type Goal, type InsertTransaction } from '@shared/schema';
import { format } from 'date-fns';

export default function Investments() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'assessment'>('overview');
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['/api/analytics/summary'],
  });

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const createTransactionMutation = useMutation({
    mutationFn: (transaction: InsertTransaction) => 
      apiRequest('POST', '/api/transactions', transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      setIsAddModalOpen(false);
    },
  });

  const summary = analyticsData || calculateFinancialSummary(transactions);
  
  // Safely access summary properties with defaults
  const safeSummary = {
    totalInvestments: (summary as any)?.totalInvestments || 0,
    monthlyInvestments: (summary as any)?.monthlyInvestments || 0,
  };
  const investmentTransactions = transactions.filter((t: Transaction) => t.type === 'investment');
  const portfolioBreakdown = calculateInvestmentPortfolio(transactions);
  
  // Map portfolio breakdown to chart data with colors
  const portfolioData = portfolioBreakdown.map((item, index) => ({
    name: item.category,
    value: item.amount,
    color: `hsl(${(index * 45) % 360}, 70%, ${document.documentElement.classList.contains('dark') ? '60%' : '50%'})`
  }));

  // Mock investment goals (in real app, these would come from API)
  const investmentGoals = [
    {
      id: '1',
      name: 'Retirement Fund',
      current: 250000,
      target: 10000000,
      targetDate: '2059',
      category: 'retirement'
    },
    {
      id: '2', 
      name: 'Home Purchase',
      current: 1200000,
      target: 3000000,
      targetDate: '2028',
      category: 'home'
    }
  ];

  const handleAddTransaction = (type: 'income' | 'expense' | 'investment') => {
    setIsAddModalOpen(true);
  };

  const handleTransactionSubmit = (transaction: InsertTransaction) => {
    createTransactionMutation.mutate({
      ...transaction,
      type: 'investment'
    });
  };

  const getInvestmentIcon = (category: string) => {
    switch (category) {
      case 'mutual_funds':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'stocks':
        return <Building className="w-5 h-5 text-green-600" />;
      case 'fixed_deposits':
        return <PiggyBank className="w-5 h-5 text-orange-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInvestmentColor = (category: string) => {
    switch (category) {
      case 'mutual_funds':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'stocks':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'fixed_deposits':
        return 'bg-orange-100 dark:bg-orange-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const handleRiskAssessmentComplete = (profile: RiskProfile) => {
    setRiskProfile(profile);
    setShowRiskAssessment(false);
    setActiveTab('strategy');
    
    // Update user settings with risk profile
    queryClient.setQueryData(['/api/settings'], (old: any) => ({
      ...old,
      riskTolerance: profile.riskTolerance,
      investmentStrategy: profile.investmentStrategy
    }));
  };

  const currentRiskTolerance = (settings as any)?.riskTolerance || 'moderate';
  const currentStrategy = (settings as any)?.investmentStrategy || 'balanced';

  if (showRiskAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-orange-900/20 p-6">
        <RiskAssessment 
          onComplete={handleRiskAssessmentComplete}
          initialRiskTolerance={currentRiskTolerance}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 dark:from-slate-800 dark:via-orange-800/30 dark:to-red-800/30">
      {/* Modern Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 shadow-lg shadow-black/5">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Investment Portfolio
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">AI-powered investment strategies and portfolio management</p>
            </div>

          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="flex-1 sm:flex-none"
          >
            Portfolio Overview
          </Button>
          <Button
            variant={activeTab === 'strategy' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('strategy')}
            className="flex-1 sm:flex-none"
          >
            AI Investment Strategy
          </Button>
          <Button
            variant={activeTab === 'assessment' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('assessment')}
            className="flex-1 sm:flex-none"
          >
            Risk Assessment
          </Button>
        </div>

        {activeTab === 'strategy' && (
          <div className="space-y-6">
            {/* Risk Profile Display */}
            {riskProfile && <RiskProfileDisplay profile={riskProfile} />}
            
            {/* Current Strategy */}
            <InvestmentStrategy
              strategy={currentStrategy as any}
              riskTolerance={currentRiskTolerance as any}
            />
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => setActiveTab('assessment')} variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Take Risk Assessment
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Start Investing
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <RiskAssessment 
              onComplete={handleRiskAssessmentComplete}
              initialRiskTolerance={currentRiskTolerance}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto">
            {/* Portfolio Overview - Full Width Desktop Layout */}
        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-6">
          {/* Portfolio Summary Cards - Full responsive layout */}
          <div className="2xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Total Portfolio Value */}
            <Card className="card-shadow border-2 border-border/50 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                    +15.8%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Total Portfolio Value</p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {formatCurrency(safeSummary.totalInvestments)}
                  </p>
                  <div className="flex items-center mt-3">
                    <span className="text-sm text-green-600 font-medium">Overall growth</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* This Month Invested */}
            <Card className="card-shadow border-2 border-border/50 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <PiggyBank className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                    This Month
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Monthly Investment</p>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">
                    {formatCurrency(safeSummary.monthlyInvestments)}
                  </p>
                  <div className="flex items-center mt-3">
                    <span className="text-sm text-green-600 font-medium">+5.2% vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Returns */}
            <Card className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Returns</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(safeSummary.totalInvestments * 0.158)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-green-600 font-medium">+15.8%</span>
                    <span className="text-xs text-muted-foreground ml-1">annualized</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Breakdown Chart */}
          <PortfolioChart data={portfolioData} />
        </div>

        {/* Investment Transactions */}
        <div className="max-w-[1600px] mx-auto">
        <Card className="card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Investments</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {investmentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No investments yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start investing to build your financial future
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {investmentTransactions.slice(0, 5).map((transaction: Transaction) => (
                  <div key={transaction.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${getInvestmentColor(transaction.category)}`}>
                          {getInvestmentIcon(transaction.category)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{transaction.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.category} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {transaction.isRecurring && (
                              <Badge variant="secondary" className="text-xs bg-muted/50 dark:bg-muted/30 text-muted-foreground">
                                {transaction.recurrenceFrequency === 'monthly' ? 'Monthly SIP' : 'Weekly SIP'}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-600 dark:border-green-500">
                              +12.4% returns
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(parseFloat(transaction.amount))}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.isRecurring ? 'per month' : 'invested'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Goals */}
        <Card className="card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Investment Goals</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                Add Goal
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-6">
              {investmentGoals.map((goal) => {
                const progress = (goal.current / goal.target) * 100;
                
                return (
                  <div key={goal.id} className="p-4 border border-border rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-foreground">{goal.name}</h4>
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                        </span>
                        <span className="text-xs text-muted-foreground">{Math.round(progress)}% complete</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Target: {goal.targetDate} ({new Date(goal.targetDate).getFullYear() - new Date().getFullYear()} years remaining)
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </div>
          </div>
        )}
      </div>

      {/* Simple Fixed Floating Action Button - Hidden when modal is open */}
      <div className={`fixed bottom-20 right-4 transition-opacity duration-300 ${
        isAddModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`} style={{
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        zIndex: 99999
      }}>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center"
          style={{
            position: 'relative',
            zIndex: 99999,
            backgroundColor: '#2563eb'
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleTransactionSubmit}
        defaultType="investment"
      />
    </div>
  );
}
