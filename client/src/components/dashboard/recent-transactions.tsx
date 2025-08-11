import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { type Transaction } from '@shared/schema';
import { categories } from '@/lib/categories';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';

interface RecentTransactionsProps {
  transactions: Transaction[];
  limit?: number;
}

export function RecentTransactions({ transactions, limit = 5 }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, limit);

  const getTransactionIcon = (category: string, type: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    if (categoryData) {
      const Icon = categoryData.icon;
      return <Icon className="w-4 h-4" />;
    }
    return null;
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

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first transaction to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => {
              const colorClass = getTransactionColor(transaction.type);
              const amountColor = getAmountColor(transaction.type);
              
              return (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${colorClass}`}>
                      {getTransactionIcon(transaction.category, transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {format(new Date(transaction.date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold ${amountColor}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(parseFloat(transaction.amount))}
                    </p>
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
