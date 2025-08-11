import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Search, 
  Plus,
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Edit2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal';
import { formatCurrency } from '@/lib/calculations';
import { apiRequest } from '@/lib/queryClient';
import { type Transaction, type InsertTransaction } from '@shared/schema';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'investment'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [defaultTransactionType, setDefaultTransactionType] = useState<'income' | 'expense' | 'investment'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Handle URL parameters for filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    
    if (typeParam && ['income', 'expense', 'investment'].includes(typeParam)) {
      setTypeFilter(typeParam as 'income' | 'expense' | 'investment');
    }
  }, [location]);
  
  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const response = await apiRequest('POST', '/api/transactions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      setIsAddModalOpen(false);
      toast({
        title: "Transaction added",
        description: "Your transaction has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save transaction. Please try again.",
        variant: "destructive",
      });
      console.error('Add transaction error:', error);
    },
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async (data: Partial<Transaction> & { id: string }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest('PATCH', `/api/transactions/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      setEditingTransaction(null);
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
      console.error('Update transaction error:', error);
    },
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      toast({
        title: "Transaction deleted",
        description: "Your transaction has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
      console.error('Delete transaction error:', error);
    },
  });

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleAddTransaction = (data: InsertTransaction) => {
    addTransactionMutation.mutate(data);
  };

  const handleUpdateTransaction = (data: InsertTransaction) => {
    if (editingTransaction) {
      updateTransactionMutation.mutate({ 
        ...data, 
        id: editingTransaction.id,
        amount: String(data.amount) // Convert to string for API
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpCircle className="w-5 h-5 text-green-600" />;
      case 'expense':
        return <ArrowDownCircle className="w-5 h-5 text-red-600" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <ArrowDownCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'investment':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Error loading transactions: {error.message}</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/transactions'] })}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-purple-800/30 dark:to-pink-800/30 oled:from-black oled:via-purple-950/20 oled:to-pink-950/20">
        {/* Modern Header */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 oled:bg-black backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 oled:border-gray-800 shadow-lg shadow-black/5">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between max-w-7xl mx-auto">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Transaction History
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">Track and manage your financial transactions</p>
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">
                Recent Transactions ({filteredTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <div className="space-y-4 px-4 sm:px-0">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 px-4 sm:px-0">
                  <p className="text-muted-foreground">No transactions found</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add your first transaction
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-4 px-4 sm:px-0">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors space-y-3 sm:space-y-0"
                  >
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{transaction.title}</h3>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                          <Badge variant="secondary" className="text-xs">{transaction.category}</Badge>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-xs sm:text-sm">{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                          {transaction.isRecurring && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <Badge variant="outline" className="text-xs">Recurring</Badge>
                            </>
                          )}
                          {transaction.isSplit && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <Badge variant="outline" className="text-xs">Split</Badge>
                            </>
                          )}
                        </div>
                        {transaction.notes && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{transaction.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0">
                      <span className={`text-base sm:text-lg font-semibold ${getAmountColor(transaction.type)}`}>
                        {transaction.type === 'expense' ? '-' : '+'}
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                      
                      <div className="flex space-x-1 sm:space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTransaction(transaction)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Backdrop Overlay */}
      {isFabMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99998] animate-in fade-in duration-200"
          onClick={() => setIsFabMenuOpen(false)}
        />
      )}

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
              onClick={() => {
                setDefaultTransactionType('income');
                setIsAddModalOpen(true);
                setIsFabMenuOpen(false);
              }}
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
              onClick={() => {
                setDefaultTransactionType('expense');
                setIsAddModalOpen(true);
                setIsFabMenuOpen(false);
              }}
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
              onClick={() => {
                setDefaultTransactionType('investment');
                setIsAddModalOpen(true);
                setIsFabMenuOpen(false);
              }}
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
              onClick={() => {
                setDefaultTransactionType('income');
                setIsAddModalOpen(true);
                setIsFabMenuOpen(false);
              }}
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
              onClick={() => {
                setDefaultTransactionType('expense');
                setIsAddModalOpen(true);
                setIsFabMenuOpen(false);
              }}
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
              onClick={() => {
                setDefaultTransactionType('investment');
                setIsAddModalOpen(true);
                setIsFabMenuOpen(false);
              }}
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

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTransaction}
        defaultType={defaultTransactionType}
      />

      {/* Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSubmit={handleUpdateTransaction}
        initialData={editingTransaction || undefined}
      />
    </>
  );
}