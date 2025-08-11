import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Calendar } from 'lucide-react';
import { type Transaction } from '@shared/schema';
import { categories } from '@/lib/categories';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export function TransactionList({ 
  transactions, 
  onEditTransaction,
  onDeleteTransaction 
}: TransactionListProps) {
  const getTransactionIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    if (categoryData) {
      const Icon = categoryData.icon;
      return <Icon className="w-5 h-5" />;
    }
    return <Calendar className="w-5 h-5" />;
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'expense':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'investment':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
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
        return 'text-foreground';
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <Card className="card-shadow border-2 border-border/50 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>All Transactions</span>
          <span className="text-sm font-normal text-muted-foreground">
            {transactions.length} total
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No transactions found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or add a new transaction
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => {
              const colorClass = getTransactionColor(transaction.type);
              const amountColor = getAmountColor(transaction.type);
              
              return (
                <div 
                  key={transaction.id} 
                  className="py-4 hover:bg-accent/10 transition-colors duration-200 -mx-6 px-6 rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-2xl icon-container ${colorClass} border border-current/20 shadow-sm`}>
                        {getTransactionIcon(transaction.category)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{transaction.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryName(transaction.category)} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </p>
                        {transaction.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{transaction.notes}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          {transaction.isRecurring && (
                            <span className="inline-flex items-center px-2 py-1 rounded-2xl text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                              Recurring
                            </span>
                          )}
                          {transaction.isSplit && (
                            <span className="inline-flex items-center px-2 py-1 rounded-2xl text-xs font-medium bg-secondary/10 text-secondary-foreground border border-secondary/20">
                              Split
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${amountColor}`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(parseFloat(transaction.amount))}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-muted-foreground hover:text-foreground rounded-2xl hover:bg-accent"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
