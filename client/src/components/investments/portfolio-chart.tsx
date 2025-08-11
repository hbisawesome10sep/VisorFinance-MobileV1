import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PortfolioData {
  name: string;
  value: number;
  color: string;
}

interface PortfolioChartProps {
  data: PortfolioData[];
  totalValue?: number;
}

export function PortfolioChart({ data, totalValue }: PortfolioChartProps) {
  // Calculate total value from data if not provided
  const calculatedTotal = totalValue || data.reduce((sum, item) => sum + item.value, 0);
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ₹{data.value.toLocaleString('en-IN')} ({((data.value / calculatedTotal) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for slices < 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="card-shadow border-2 border-border/50 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Portfolio Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">Your investment allocation</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Modern Donut Chart */}
          <div className="relative w-full h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={3}
                  stroke="hsl(var(--background))"
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity duration-300"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">₹{calculatedTotal.toLocaleString('en-IN')}</div>
                <div className="text-sm text-muted-foreground">Total Portfolio</div>
              </div>
            </div>
          </div>
          
          {/* Modern Legend */}
          <div className="w-full space-y-4">
            {data.map((item, index) => (
              <div key={index} className="group relative">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div 
                        className="w-5 h-5 rounded-2xl shadow-sm border-2 border-white dark:border-slate-700"
                        style={{ backgroundColor: item.color }}
                      />
                      <div 
                        className="absolute inset-0 w-5 h-5 rounded-2xl opacity-20"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {((item.value / calculatedTotal) * 100).toFixed(1)}% of portfolio
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      ₹{item.value.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {index === 0 ? 'Largest holding' : 
                       index === data.length - 1 ? 'Smallest holding' : 
                       'Portfolio allocation'}
                    </div>
                  </div>
                </div>
                
                {/* Progress bar showing relative size */}
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: item.color,
                      width: `${(item.value / calculatedTotal) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Portfolio Summary */}
          <div className="w-full mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Diversification</div>
                <div className="text-lg font-bold text-blue-600">
                  {data.length} Asset{data.length > 1 ? 's' : ''}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Top Allocation</div>
                <div className="text-lg font-bold text-blue-600">
                  {data.length > 0 ? `${((Math.max(...data.map(d => d.value)) / totalValue) * 100).toFixed(0)}%` : '0%'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
