import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Moon, 
  Sun, 
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Calendar,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { SavingsRate } from '@/components/dashboard/savings-rate';
import { GoalsOverview } from '@/components/dashboard/goals-overview';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { TrendAnalysis } from '@/components/dashboard/trend-analysis';
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal';
import { AddGoalModal } from '@/components/dashboard/add-goal-modal';
import AccountingModal from '@/components/accounting/accounting-modal';
import { useTheme } from '@/components/common/theme-provider';
import { calculateFinancialSummary } from '@/lib/calculations';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/auth-context';
import { type Transaction, type Goal, type InsertTransaction, type InsertGoal } from '@shared/schema';

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  // Get time-based greeting using IST
  const getTimeBasedGreeting = () => {
    const now = new Date();
    // Get IST time (UTC + 5:30)
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const hour = istTime.getHours();
    
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Extract first name from full name
  const getFirstName = () => {
    if (!user?.fullName) return 'User';
    return user.fullName.split(' ')[0];
  };

  // Get period label for header
  const getSelectedPeriodLabel = () => {
    if (timeFrequency === 'month') {
      const monthName = new Date(selectedPeriod.year, selectedPeriod.month || 0).toLocaleDateString('en-IN', { 
        month: 'long', 
        year: 'numeric',
        timeZone: 'Asia/Kolkata' 
      });
      return monthName;
    } else if (timeFrequency === 'quarter') {
      return `Q${selectedPeriod.quarter || 1} ${selectedPeriod.year}`;
    } else {
      return selectedPeriod.year.toString();
    }
  };

  // Handle frequency change
  const handleFrequencyChange = (newFrequency: 'quarter' | 'month' | 'year') => {
    const now = new Date();
    setTimeFrequency(newFrequency);
    
    if (newFrequency === 'month') {
      setSelectedPeriod({ year: now.getFullYear(), month: now.getMonth() });
    } else if (newFrequency === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
      setSelectedPeriod({ year: now.getFullYear(), quarter: currentQuarter });
    } else {
      setSelectedPeriod({ year: now.getFullYear() });
    }
  };
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [defaultTransactionType, setDefaultTransactionType] = useState<'income' | 'expense' | 'investment'>('expense');
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isAccountingModalOpen, setIsAccountingModalOpen] = useState(false);
  const [timeFrequency, setTimeFrequency] = useState<'quarter' | 'month' | 'year'>('month');
  const [selectedPeriod, setSelectedPeriod] = useState<{
    month?: number;
    quarter?: number;
    year: number;
  }>({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const queryClient = useQueryClient();

  const { data: transactions = [], refetch: refetchTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['/api/analytics/summary', timeFrequency, selectedPeriod],
    queryFn: () => {
      const params = new URLSearchParams({
        frequency: timeFrequency,
        year: selectedPeriod.year.toString(),
        ...(selectedPeriod.month !== undefined && { month: selectedPeriod.month.toString() }),
        ...(selectedPeriod.quarter !== undefined && { quarter: selectedPeriod.quarter.toString() })
      });
      return fetch(`/api/analytics/summary?${params}`).then(res => res.json());
    },
  });

  const summary = analyticsData || calculateFinancialSummary(transactions);
  
  // Ensure summary has default values to prevent undefined errors
  const safeDataSummary = {
    monthlyIncome: (summary as any)?.monthlyIncome || 0,
    monthlyExpenses: (summary as any)?.monthlyExpenses || 0,
    totalInvestments: (summary as any)?.totalInvestments || 0,
    netSavings: (summary as any)?.netSavings || 0,
    savingsRate: (summary as any)?.savingsRate || 0,
  };

  const handleAddTransaction = (type: 'income' | 'expense' | 'investment') => {
    setDefaultTransactionType(type);
    setIsAddModalOpen(true);
    setIsFabMenuOpen(false);
  };

  const { mutate: submitTransaction } = useMutation({
    mutationFn: async (transaction: InsertTransaction) => {
      const res = await apiRequest('POST', '/api/transactions', transaction);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      setIsAddModalOpen(false);
    },
  });

  const handleTransactionSubmit = (transaction: InsertTransaction) => {
    submitTransaction(transaction);
  };

  // Goals management
  const { mutate: submitGoal } = useMutation({
    mutationFn: async (goal: InsertGoal) => {
      const res = await apiRequest('POST', '/api/goals', goal);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      setIsAddGoalModalOpen(false);
    },
  });

  const { mutate: updateGoal } = useMutation({
    mutationFn: async ({ id, ...goal }: { id: string } & Partial<InsertGoal>) => {
      const res = await apiRequest('PUT', `/api/goals/${id}`, goal);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      setIsEditGoalModalOpen(false);
      setEditingGoal(null);
    },
  });

  const { mutate: deleteGoal } = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
    },
  });

  const handleAddGoal = () => {
    setIsAddGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditGoalModalOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      deleteGoal(id);
    }
  };

  const handleGoalSubmit = (goal: InsertGoal) => {
    if (editingGoal) {
      updateGoal({ id: editingGoal.id, ...goal });
    } else {
      submitGoal(goal);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600">
        {/* Modern Header */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 shadow-lg shadow-black/5">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1">
                  {getTimeBasedGreeting()}, {getFirstName()}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">Your financial overview • {getSelectedPeriodLabel()}</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Theme Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2 rounded-2xl border-2 hover:bg-muted/50"
                    >
                      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      <span className="hidden sm:inline">Theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl">
                    <DropdownMenuItem onClick={() => setTheme('light')} className="rounded-xl">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')} className="rounded-xl">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
          {/* Frequency Selector */}
          <div className="flex justify-center sm:justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 rounded-2xl border-2 hover:bg-muted/50"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="capitalize">{getSelectedPeriodLabel()}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl min-w-48">
                {timeFrequency === 'month' && (
                  <>
                    {Array.from({ length: 12 }, (_, i) => {
                      const monthDate = new Date(selectedPeriod.year, i);
                      const monthName = monthDate.toLocaleDateString('en-IN', { month: 'long' });
                      return (
                        <DropdownMenuItem 
                          key={i}
                          onClick={() => setSelectedPeriod({ ...selectedPeriod, month: i })} 
                          className="rounded-xl"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {monthName} {selectedPeriod.year}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuItem onClick={() => handleFrequencyChange('quarter')} className="rounded-xl border-t mt-1 pt-2">
                      Switch to Quarterly View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFrequencyChange('year')} className="rounded-xl">
                      Switch to Annual View
                    </DropdownMenuItem>
                  </>
                )}
                
                {timeFrequency === 'quarter' && (
                  <>
                    {Array.from({ length: 4 }, (_, i) => (
                      <DropdownMenuItem 
                        key={i}
                        onClick={() => setSelectedPeriod({ ...selectedPeriod, quarter: i + 1 })} 
                        className="rounded-xl"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Q{i + 1} {selectedPeriod.year}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={() => handleFrequencyChange('month')} className="rounded-xl border-t mt-1 pt-2">
                      Switch to Monthly View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFrequencyChange('year')} className="rounded-xl">
                      Switch to Annual View
                    </DropdownMenuItem>
                  </>
                )}
                
                {timeFrequency === 'year' && (
                  <>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <DropdownMenuItem 
                          key={year}
                          onClick={() => setSelectedPeriod({ year })} 
                          className="rounded-xl"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {year}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuItem onClick={() => handleFrequencyChange('month')} className="rounded-xl border-t mt-1 pt-2">
                      Switch to Monthly View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFrequencyChange('quarter')} className="rounded-xl">
                      Switch to Quarterly View
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <OverviewCards
            monthlyIncome={safeDataSummary.monthlyIncome}
            monthlyExpenses={safeDataSummary.monthlyExpenses}
            totalInvestments={safeDataSummary.totalInvestments}
            netSavings={safeDataSummary.netSavings}
            timeFrequency={timeFrequency}
          />

          <SavingsRate savingsRate={safeDataSummary.savingsRate} />

          {/* Trend Analysis for All Time Periods */}
          <TrendAnalysis 
            transactions={transactions} 
            timeFrequency={timeFrequency}
          />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseChart transactions={transactions} />
            <GoalsOverview 
              goals={goals} 
              onAddGoal={handleAddGoal}
              onEditGoal={handleEditGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </div>

          <RecentTransactions transactions={transactions} />
        </div>
      </div>

      {/* Backdrop Overlay */}
      {isFabMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99998] animate-in fade-in duration-200"
          onClick={() => setIsFabMenuOpen(false)}
        />
      )}

      {/* Simple Fixed Floating Action Buttons - Hidden when modals are open */}
      <div className={`fixed bottom-20 right-4 flex flex-col gap-3 transition-opacity duration-300 ${
        isAddModalOpen || isAccountingModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`} style={{
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        zIndex: 99999
      }}>
        {/* Accounting Button */}
        <button
          onClick={() => setIsAccountingModalOpen(true)}
          className="w-12 h-12 bg-emerald-500 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center"
          style={{
            position: 'relative',
            zIndex: 99999,
            backgroundColor: '#10b981'
          }}
        >
          <BookOpen className="w-5 h-5" />
        </button>
        
        {/* Add Transaction Button */}
        <button
          onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
          className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center"
          style={{
            position: 'relative',
            zIndex: 99999,
            backgroundColor: '#2563eb'
          }}
        >
          <Plus className="w-5 h-5" />
        </button>
        
        {/* Dropdown Menu */}
        {isFabMenuOpen && (
          <div className="absolute bottom-16 right-0 w-64 bg-background/95 dark:bg-background/95 backdrop-blur-lg border border-border/20 rounded-2xl shadow-2xl p-2 mb-2 animate-in slide-in-from-bottom-2 duration-300" style={{
            position: 'absolute',
            bottom: '64px',
            right: '0px',
            zIndex: 99999
          }}>
            <div
              onClick={() => handleAddTransaction('income')}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Add Income</div>
                <div className="text-xs text-gray-500">Record money received</div>
              </div>
            </div>
            
            <div
              onClick={() => handleAddTransaction('expense')}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Add Expense</div>
                <div className="text-xs text-gray-500">Record money spent</div>
              </div>
            </div>
            
            <div
              onClick={() => handleAddTransaction('investment')}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Add Investment</div>
                <div className="text-xs text-gray-500">Record investment activity</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isFabMenuOpen && (
        <div 
          className="fixed inset-0 z-[99998]" 
          onClick={() => setIsFabMenuOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99998 }}
        />
      )}

      {/* Keep the old dropdown content for reference but hide it */}
      <div style={{ display: 'none' }}>
        <DropdownMenu 
          open={false} 
          onOpenChange={() => {}}
        >
          <DropdownMenuTrigger asChild>
            <div></div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-64 p-2 bg-background/95 dark:bg-background/95 backdrop-blur-lg border border-border/20 shadow-2xl animate-in slide-in-from-bottom-2 duration-300 rounded-2xl z-[99999]"
            sideOffset={12}
          >
            <DropdownMenuItem
              onClick={() => handleAddTransaction('income')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer group border border-transparent hover:border-green-200 dark:hover:border-green-700"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/60 group-hover:scale-110 transition-all duration-200 shadow-sm">
                <ArrowUpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-foreground text-sm">Add Income</span>
                <p className="text-xs text-muted-foreground mt-1">Record money received</p>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handleAddTransaction('expense')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer group border border-transparent hover:border-red-200 dark:hover:border-red-700"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-800/60 group-hover:scale-110 transition-all duration-200 shadow-sm">
                <ArrowDownCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-foreground text-sm">Add Expense</span>
                <p className="text-xs text-muted-foreground mt-1">Record money spent</p>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handleAddTransaction('investment')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer group border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 group-hover:scale-110 transition-all duration-200 shadow-sm">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-foreground text-sm">Add Investment</span>
                <p className="text-xs text-muted-foreground mt-1">Record investment activity</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleTransactionSubmit}
        defaultType={defaultTransactionType}
      />

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onSubmit={handleGoalSubmit}
      />

      {/* Edit Goal Modal */}
      {editingGoal && (
        <AddGoalModal
          isOpen={isEditGoalModalOpen}
          onClose={() => {
            setIsEditGoalModalOpen(false);
            setEditingGoal(null);
          }}
          onSubmit={handleGoalSubmit}
          initialData={editingGoal}
        />
      )}

      {/* Accounting Modal */}
      <AccountingModal
        isOpen={isAccountingModalOpen}
        onClose={() => setIsAccountingModalOpen(false)}
      />
    </>
  );
}
