import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { type InsightScore } from '@/lib/calculations';

interface InsightCard {
  id: string;
  title: string;
  score: InsightScore;
  description: string;
  icon: React.ReactNode;
}

interface InsightCardsProps {
  insights: InsightCard[];
}

export function InsightCards({ insights }: InsightCardsProps) {
  const getScoreIcon = (category: string) => {
    switch (category) {
      case 'excellent':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'good':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'fair':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'poor':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getScoreText = (category: string) => {
    switch (category) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Needs Attention';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {insights.map((insight) => (
        <Card key={insight.id} className="card-shadow hover:shadow-lg transition-shadow duration-200 border-2 border-border/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-2xl icon-container shadow-sm border border-border/30">
                  {insight.icon}
                </div>
                <h3 className="font-semibold text-foreground">{insight.title}</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: insight.score.color }}>
                  {insight.score.score}
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              {getScoreIcon(insight.score.category)}
              <span 
                className="text-sm font-medium"
                style={{ color: insight.score.color }}
              >
                {getScoreText(insight.score.category)}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {insight.description}
            </p>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary hover:text-primary/80 p-0"
            >
              <Info className="w-4 h-4 mr-2" />
              Learn more
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Helper component for creating insight data
export const createInsightCard = (
  id: string,
  title: string,
  score: InsightScore,
  description: string,
  iconType: 'savings' | 'emergency' | 'cashflow' | 'spending' | 'investment' | 'peer'
): InsightCard => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'cashflow':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'spending':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'peer':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  return {
    id,
    title,
    score,
    description,
    icon: getIcon(iconType),
  };
};
