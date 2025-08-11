import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/calculations';
import { type Transaction } from '@shared/schema';

interface ExpenseChartProps {
  transactions: Transaction[];
}

// Color palette for the pie chart
const COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f59e0b', // amber-500
];

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  // Filter only expense transactions and group by category
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  if (expenseTransactions.length === 0) {
    return (
      <Card className="card-shadow border-2 border-border/50 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Expense Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">Spending by category</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group expenses by category and calculate totals
  const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Other';
    const amount = parseFloat(transaction.amount);
    
    if (acc[category]) {
      acc[category] += amount;
    } else {
      acc[category] = amount;
    }
    
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data format and sort by amount
  const chartData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
      percentage: 0, // Will calculate after sorting
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate total and percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach(item => {
    item.percentage = ((item.value / total) * 100);
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium text-foreground">{data.payload.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)} ({data.payload.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="mt-4 space-y-2">
        {payload?.slice(0, 6).map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-foreground">{entry.value}</span>
            </div>
            <span className="text-muted-foreground font-medium">
              {formatCurrency(entry.payload.value)}
            </span>
          </div>
        ))}
        {payload?.length > 6 && (
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            +{payload.length - 6} more categories
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="card-shadow border-2 border-border/50 rounded-2xl bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-900 dark:to-orange-900/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Expense Breakdown
        </CardTitle>
        <p className="text-sm text-muted-foreground">Spending by category</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Modern Donut Chart */}
          <div className="relative h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={120}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={3}
                  stroke="hsl(var(--background))"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
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
                <div className="text-2xl font-bold text-foreground">{formatCurrency(total)}</div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
              </div>
            </div>
          </div>

          {/* Modern Legend */}
          <div className="space-y-3">
            {chartData.slice(0, 6).map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div 
                        className="w-4 h-4 rounded-2xl shadow-sm border border-white dark:border-slate-700"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div 
                        className="absolute inset-0 w-4 h-4 rounded-2xl opacity-20"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}% of expenses
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">
                      {formatCurrency(item.value)}
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: COLORS[index % COLORS.length],
                      width: `${item.percentage}%`
                    }}
                  />
                </div>
              </div>
            ))}
            
            {chartData.length > 6 && (
              <div className="text-center p-3 rounded-2xl bg-muted/50 border border-border/30">
                <span className="text-xs text-muted-foreground">
                  +{chartData.length - 6} more categories
                </span>
              </div>
            )}
          </div>

          {/* Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-800/50">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Categories</div>
                <div className="text-lg font-bold text-orange-600">
                  {chartData.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Top Category</div>
                <div className="text-lg font-bold text-orange-600">
                  {chartData.length > 0 ? `${chartData[0].percentage.toFixed(0)}%` : '0%'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}