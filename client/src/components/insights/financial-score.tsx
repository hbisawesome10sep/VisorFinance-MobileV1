import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FinancialScoreProps {
  score: number;
  title?: string;
  description?: string;
}

export function FinancialScore({ 
  score, 
  title = "Financial Health Score",
  description 
}: FinancialScoreProps) {
  const getScoreCategory = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'text-green-600' };
    if (score >= 75) return { text: 'Good', color: 'text-blue-600' };
    if (score >= 60) return { text: 'Fair', color: 'text-yellow-600' };
    return { text: 'Poor', color: 'text-red-600' };
  };

  const scoreCategory = getScoreCategory(score);
  const circumference = 2 * Math.PI * 56; // radius = 56
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="card-shadow border-2 border-border/50 rounded-2xl">
      <CardContent className="p-6 lg:p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
          
          <div className="relative inline-flex items-center justify-center mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted opacity-20"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-primary transition-all duration-1000 ease-out"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{score}</div>
                <div className="text-xs text-muted-foreground">out of 100</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className={`text-sm font-medium ${scoreCategory.color}`}>
              {scoreCategory.text} Financial Health
            </span>
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
