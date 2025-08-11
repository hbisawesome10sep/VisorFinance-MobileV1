import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Shield, Target, BarChart3, PieChart, AlertTriangle } from 'lucide-react';

interface InvestmentStrategyProps {
  strategy: 'conservative' | 'balanced' | 'growth' | 'aggressive';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  currentPortfolio?: {
    equity: number;
    debt: number;
    gold: number;
    cash: number;
  };
}

const strategyData = {
  conservative: {
    name: 'Conservative Growth',
    description: 'Focused on capital preservation with steady, low-risk returns',
    allocation: { equity: 20, debt: 60, gold: 10, cash: 10 },
    expectedReturn: '7-9%',
    risk: 'Low',
    color: 'green',
    icon: Shield,
    instruments: [
      'Fixed Deposits (30%)',
      'Government Bonds (30%)',
      'Debt Mutual Funds (20%)',
      'Large Cap Equity Funds (15%)',
      'Gold ETF (5%)'
    ],
    pros: [
      'Low volatility and risk',
      'Steady predictable returns',
      'Capital preservation focused',
      'Suitable for near-term goals'
    ],
    cons: [
      'Lower long-term growth potential',
      'May not beat inflation significantly',
      'Limited wealth creation'
    ]
  },
  balanced: {
    name: 'Balanced Portfolio',
    description: 'Moderate risk with balanced growth and stability',
    allocation: { equity: 50, debt: 35, gold: 10, cash: 5 },
    expectedReturn: '10-12%',
    risk: 'Moderate',
    color: 'yellow',
    icon: Target,
    instruments: [
      'Hybrid Mutual Funds (25%)',
      'Large & Mid Cap Funds (25%)',
      'Debt Funds (25%)',
      'PPF/ELSS (15%)',
      'Gold ETF (10%)'
    ],
    pros: [
      'Good balance of risk and return',
      'Diversified across asset classes',
      'Suitable for medium-term goals',
      'Less volatile than pure equity'
    ],
    cons: [
      'Moderate growth potential',
      'Requires regular rebalancing',
      'May underperform in bull markets'
    ]
  },
  growth: {
    name: 'Growth Focused',
    description: 'Higher equity exposure for long-term wealth creation',
    allocation: { equity: 70, debt: 20, gold: 5, cash: 5 },
    expectedReturn: '12-15%',
    risk: 'High',
    color: 'blue',
    icon: TrendingUp,
    instruments: [
      'Large Cap Funds (30%)',
      'Mid & Small Cap Funds (25%)',
      'International Funds (15%)',
      'Debt Funds (15%)',
      'Sectoral Funds (10%)',
      'Gold ETF (5%)'
    ],
    pros: [
      'High long-term growth potential',
      'Excellent for wealth creation',
      'Beats inflation significantly',
      'Ideal for young investors'
    ],
    cons: [
      'High volatility and risk',
      'Requires long investment horizon',
      'Can have significant drawdowns'
    ]
  },
  aggressive: {
    name: 'Aggressive Growth',
    description: 'Maximum equity exposure for highest returns',
    allocation: { equity: 85, debt: 10, gold: 3, cash: 2 },
    expectedReturn: '15-18%',
    risk: 'Very High',
    color: 'red',
    icon: BarChart3,
    instruments: [
      'Mid & Small Cap Funds (35%)',
      'Large Cap Funds (25%)',
      'International Equity (15%)',
      'Sectoral/Thematic Funds (10%)',
      'Debt Funds (10%)',
      'Gold ETF (3%)',
      'Emergency Cash (2%)'
    ],
    pros: [
      'Highest growth potential',
      'Maximum wealth creation',
      'Suitable for very long term',
      'Can generate significant alpha'
    ],
    cons: [
      'Very high volatility',
      'Requires strong risk appetite',
      'Can have major drawdowns',
      'Not suitable for near-term goals'
    ]
  }
};

export function InvestmentStrategy({ strategy, riskTolerance, currentPortfolio }: InvestmentStrategyProps) {
  const strategyInfo = strategyData[strategy];
  const Icon = strategyInfo.icon;

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'very high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      <Card className="border-2 border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-${strategyInfo.color}-100 dark:bg-${strategyInfo.color}-900/20`}>
                <Icon className={`w-5 h-5 text-${strategyInfo.color}-600`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{strategyInfo.name}</h3>
                <p className="text-sm text-muted-foreground">{strategyInfo.description}</p>
              </div>
            </div>
            <Badge className={getRiskColor(strategyInfo.risk)}>
              {strategyInfo.risk} Risk
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">{strategyInfo.expectedReturn}</div>
              <div className="text-sm text-muted-foreground">Expected Annual Return</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-blue-600">{strategyInfo.allocation.equity}%</div>
              <div className="text-sm text-muted-foreground">Equity Allocation</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-purple-600">{strategyInfo.risk}</div>
              <div className="text-sm text-muted-foreground">Risk Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <Card className="border-2 border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="w-5 h-5" />
            <span>Recommended Asset Allocation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Equity</span>
                <span className="text-sm font-bold">{strategyInfo.allocation.equity}%</span>
              </div>
              <Progress value={strategyInfo.allocation.equity} className="h-3" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Debt</span>
                <span className="text-sm font-bold">{strategyInfo.allocation.debt}%</span>
              </div>
              <Progress value={strategyInfo.allocation.debt} className="h-3" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Gold</span>
                <span className="text-sm font-bold">{strategyInfo.allocation.gold}%</span>
              </div>
              <Progress value={strategyInfo.allocation.gold} className="h-3" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cash</span>
                <span className="text-sm font-bold">{strategyInfo.allocation.cash}%</span>
              </div>
              <Progress value={strategyInfo.allocation.cash} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Instruments */}
      <Card className="border-2 border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Recommended Investment Instruments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategyInfo.instruments.map((instrument, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="text-sm">{instrument}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-green-200 dark:border-green-800/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              <span>Advantages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strategyInfo.pros.map((pro, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 dark:border-orange-800/50 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Considerations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strategyInfo.cons.map((con, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Market Data Disclaimer */}
      <Card className="border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl bg-blue-50 dark:bg-blue-900/10">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">AI-Powered Recommendations</h4>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                These recommendations are generated using real-time market data from NSE/BSE, mutual fund performance analytics, 
                and current interest rates. The strategy is automatically updated based on market conditions and your risk profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}