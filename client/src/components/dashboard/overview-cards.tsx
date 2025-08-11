import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Target } from 'lucide-react';

interface OverviewCardsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalInvestments: number;
  netSavings: number;
  timeFrequency?: 'quarter' | 'month' | 'year';
}

export function OverviewCards({ 
  monthlyIncome, 
  monthlyExpenses, 
  totalInvestments, 
  netSavings,
  timeFrequency = 'month'
}: OverviewCardsProps) {
  const [, navigate] = useLocation();

  const handleCardClick = (type: string) => {
    // Navigate to transactions page with appropriate filter
    switch (type) {
      case 'income':
        navigate('/transactions?type=income');
        break;
      case 'expenses':
        navigate('/transactions?type=expense');
        break;
      case 'investments':
        navigate('/transactions?type=investment');
        break;
      case 'savings':
        navigate('/transactions');
        break;
    }
  };

  const getPeriodLabel = () => {
    switch (timeFrequency) {
      case 'quarter': return 'Quarterly';
      case 'year': return 'Annual';
      default: return 'Monthly';
    }
  };

  const cards = [
    {
      title: `${getPeriodLabel()} Income`,
      value: monthlyIncome,
      change: '+12.5%',
      icon: ArrowDownCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      type: 'income',
      clickable: true,
    },
    {
      title: `${getPeriodLabel()} Expenses`,
      value: monthlyExpenses,
      change: '+8.2%',
      icon: ArrowUpCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      type: 'expenses',
      clickable: true,
    },
    {
      title: 'Investments',
      value: totalInvestments,
      change: '+15.8%',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      type: 'investments',
      clickable: true,
    },
    {
      title: 'Net Savings',
      value: netSavings,
      change: '+18.4%',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      type: 'savings',
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        
        return (
          <Card 
            key={card.title} 
            className={`card-shadow transition-all duration-200 border-2 ${card.borderColor} ${
              card.clickable 
                ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer hover:bg-accent/10' 
                : 'hover:shadow-lg'
            }`}
            onClick={card.clickable ? () => handleCardClick(card.type) : undefined}
          >
            <CardContent className="p-5 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl icon-container ${card.bgColor} border ${card.borderColor} shadow-sm`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className="text-xs text-success font-medium">{card.change}</span>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                <p className="text-xl lg:text-2xl font-bold text-foreground">
                  {formatCurrency(card.value)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
