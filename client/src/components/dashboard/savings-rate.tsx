import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SavingsRateProps {
  savingsRate: number;
  target?: number;
}

export function SavingsRate({ savingsRate, target = 30 }: SavingsRateProps) {
  const progressValue = Math.min((savingsRate / target) * 100, 100);
  
  return (
    <Card className="card-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Savings Rate</h3>
          <span className="text-sm text-muted-foreground">
            {savingsRate.toFixed(1)}% / {target}%
          </span>
        </div>
        
        <div className="space-y-2">
          <Progress value={progressValue} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {savingsRate >= target 
              ? `Excellent! You're saving ${savingsRate.toFixed(1)}% of your income.`
              : `You're saving ${savingsRate.toFixed(1)}% of your income. Aim for ${target}% to reach your goal.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
