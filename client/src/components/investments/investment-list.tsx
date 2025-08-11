import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Building, PiggyBank } from 'lucide-react';
import { type Transaction } from '@shared/schema';
import { formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';

interface Investment {
  id: string;
  name: string;
  type: 'mutual_fund' | 'stock' | 'fixed_deposit';
  amount: number;
  returns: number;
  returnsPercentage: number;
  frequency?: 'monthly' | 'weekly';
  nextPayment?: Date;
  isActive: boolean;
}

interface InvestmentListProps {
  investments: Investment[];
  onAddInvestment?: () => void;
}

export function InvestmentList({ investments, onAddInvestment }: InvestmentListProps) {
  const getInvestmentIcon = (type: string) => {
    switch (type) {
      case 'mutual_fund':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'stock':
        return <Building className="w-5 h-5 text-green-600" />;
      case 'fixed_deposit':
        return <PiggyBank className="w-5 h-5 text-orange-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInvestmentColor = (type: string) => {
    switch (type) {
      case 'mutual_fund':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'stock':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'fixed_deposit':
        return 'bg-orange-100 dark:bg-orange-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'mutual_fund':
        return 'Mutual Fund';
      case 'stock':
        return 'Stock';
      case 'fixed_deposit':
        return 'Fixed Deposit';
      default:
        return 'Investment';
    }
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Investments</CardTitle>
          {onAddInvestment && (
            <Button onClick={onAddInvestment} size="sm">
              Add Investment
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {investments.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No investments yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start investing to build your financial future
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {investments.map((investment) => (
              <div key={investment.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${getInvestmentColor(investment.type)}`}>
                      {getInvestmentIcon(investment.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{investment.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {getTypeName(investment.type)}
                        </p>
                        {investment.frequency && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">
                              {investment.frequency === 'monthly' ? 'Monthly SIP' : 'Weekly SIP'}
                            </p>
                          </>
                        )}
                      </div>
                      {investment.nextPayment && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Next: {format(investment.nextPayment, 'MMM dd')}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        {investment.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            {investment.frequency ? 'Active SIP' : 'Active'}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            investment.returnsPercentage > 0 
                              ? 'text-green-600 border-green-600' 
                              : 'text-red-600 border-red-600'
                          }`}
                        >
                          {investment.returnsPercentage > 0 ? '+' : ''}{investment.returnsPercentage.toFixed(1)}% returns
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(investment.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {investment.frequency ? 'per month' : 'invested'}
                    </p>
                    {investment.returns !== 0 && (
                      <p className={`text-sm font-medium mt-1 ${
                        investment.returns > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {investment.returns > 0 ? '+' : ''}{formatCurrency(investment.returns)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
