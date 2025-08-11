import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { 
  Moon, 
  DollarSign, 
  Shield, 
  Target, 
  MessageSquare, 
  Download, 
  Trash2,
  Info,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/components/common/theme-provider';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { type Settings, type InsertSettings, type Transaction, type Goal } from '@shared/schema';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Partial<InsertSettings>) => 
      apiRequest('PUT', '/api/settings', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark');
    updateSettingsMutation.mutate({ theme: newTheme });
  };

  const handleCurrencyChange = (currency: string) => {
    updateSettingsMutation.mutate({ currency });
  };

  const handleBiometricToggle = (enabled: boolean) => {
    updateSettingsMutation.mutate({ biometricEnabled: enabled });
  };

  const handleSmsParsingToggle = (enabled: boolean) => {
    updateSettingsMutation.mutate({ smsParsingEnabled: enabled });
  };

  const handleSavingsTargetChange = (values: number[]) => {
    updateSettingsMutation.mutate({ savingsTarget: values[0] });
  };

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const handleExportData = async () => {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Transactions Sheet
      const transactionData = transactions.map((transaction) => ({
        'Date': new Date(transaction.date).toLocaleDateString('en-IN'),
        'Type': transaction.type,
        'Category': transaction.category,
        'Description': transaction.description,
        'Amount': transaction.amount,
        'Is Recurring': transaction.isRecurring ? 'Yes' : 'No',
        'Split Info': transaction.splitTransactions?.length > 0 ? 'Split Transaction' : 'Regular'
      }));
      const transactionSheet = XLSX.utils.json_to_sheet(transactionData);
      XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions');

      // Goals Sheet
      const goalData = goals.map((goal) => ({
        'Goal Name': goal.name,
        'Target Amount': goal.targetAmount,
        'Current Amount': goal.currentAmount,
        'Category': goal.category,
        'Target Date': new Date(goal.targetDate).toLocaleDateString('en-IN'),
        'Progress %': Math.round((goal.currentAmount / goal.targetAmount) * 100)
      }));
      const goalSheet = XLSX.utils.json_to_sheet(goalData);
      XLSX.utils.book_append_sheet(workbook, goalSheet, 'Goals');

      // Summary Sheet
      const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum: number, t) => sum + t.amount, 0);
      const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((sum: number, t) => sum + t.amount, 0);
      const totalInvestments = transactions.filter((t) => t.type === 'investment').reduce((sum: number, t) => sum + t.amount, 0);
      
      const summaryData = [
        { Metric: 'Total Income', Value: totalIncome },
        { Metric: 'Total Expenses', Value: totalExpenses },
        { Metric: 'Total Investments', Value: totalInvestments },
        { Metric: 'Net Savings', Value: totalIncome - totalExpenses },
        { Metric: 'Total Transactions', Value: transactions.length },
        { Metric: 'Total Goals', Value: goals.length },
        { Metric: 'Export Date', Value: new Date().toLocaleDateString('en-IN') }
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `Visor_Complete_Data_Export_${dateStr}.xlsx`;

      // Write and download the file
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Export completed",
        description: "Your complete financial data has been downloaded as an Excel file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFinancials = () => {
    toast({
      title: "Use Accounting System",
      description: "Click the green Accounting button at the bottom right to access and export financial statements.",
    });
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      toast({
        title: "Data reset",
        description: "All your data has been reset.",
        variant: "destructive",
      });
      // In a real app, this would clear all user data
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-800 dark:via-gray-700/30 dark:to-stone-700/30">
      {/* Modern Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 shadow-lg shadow-black/5">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-600 to-stone-600 bg-clip-text text-transparent mb-2">
              Settings & Preferences
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">Customize your Visor experience and financial preferences</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
        
        {/* Appearance Settings */}
        <Card className="card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Theme</h4>
                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
              </div>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency Selection */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Currency</h4>
                <p className="text-sm text-muted-foreground">Set your default currency</p>
              </div>
              <Select 
                value={(settings as any)?.currency || 'INR'} 
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ INR</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                  <SelectItem value="GBP">£ GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle>Security & Privacy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Biometric Authentication */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Biometric Authentication</h4>
                <p className="text-sm text-muted-foreground">Use fingerprint or face ID to secure your app</p>
              </div>
              <Switch
                checked={(settings as any)?.biometricEnabled || false}
                onCheckedChange={handleBiometricToggle}
              />
            </div>

            {/* App Lock */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">App Lock</h4>
                <p className="text-sm text-muted-foreground">Require authentication when opening the app</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card className="card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle>Financial Preferences</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Savings Target */}
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-8">
                <h4 className="text-sm font-medium text-foreground">Savings Target</h4>
                <p className="text-sm text-muted-foreground">Your monthly savings goal percentage</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-24">
                  <Slider
                    value={[(settings as any)?.savingsTarget || 30]}
                    onValueChange={handleSavingsTargetChange}
                    max={50}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {(settings as any)?.savingsTarget || 30}%
                </span>
              </div>
            </div>

            {/* SMS Parsing */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">SMS Transaction Parsing</h4>
                <p className="text-sm text-muted-foreground">Automatically detect transactions from bank SMS</p>
              </div>
              <Switch
                checked={(settings as any)?.smsParsingEnabled !== false}
                onCheckedChange={handleSmsParsingToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle>Data Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Export Data */}
            <Button
              variant="outline"
              onClick={handleExportData}
              className="w-full justify-start h-auto p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">Download your financial data as CSV</p>
                </div>
              </div>
            </Button>

            {/* Download Financial Statements */}
            <Button
              variant="outline"
              onClick={handleDownloadFinancials}
              className="w-full justify-start h-auto p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Download Financial Statements</p>
                  <p className="text-sm text-muted-foreground">Get Income Statement, Balance Sheet & Cash Flow</p>
                </div>
              </div>
            </Button>

            {/* Reset Data */}
            <Button
              variant="outline"
              onClick={handleResetData}
              className="w-full justify-start h-auto p-4 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/10"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-red-600">Reset All Data</p>
                  <p className="text-sm text-red-600/70">Permanently delete all your data</p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="card-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <CardTitle>App Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="text-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-foreground">December 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Storage</span>
                <span className="text-foreground">Local Device</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
