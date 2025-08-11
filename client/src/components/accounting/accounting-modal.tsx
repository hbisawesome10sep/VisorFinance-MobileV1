import React, { useState, useMemo } from 'react';
import { X, BookOpen, FileText, BarChart3, Calendar, Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { type Transaction } from '@shared/schema';
import {
  createJournalEntryFromTransaction,
  generateLedgers,
  generateIncomeStatement,
  generateBalanceSheet,
  generateCashFlowStatement,
  type JournalEntry,
  type LedgerAccount
} from '@/lib/accounting';

interface AccountingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountingModal: React.FC<AccountingModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('journal');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedStatement, setSelectedStatement] = useState('income');

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // Generate accounting data
  const accountingData = useMemo(() => {
    if (!transactions.length) return null;

    const journalEntries = transactions.map(createJournalEntryFromTransaction);
    const ledgers = generateLedgers(journalEntries);
    
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const incomeStatement = generateIncomeStatement(ledgers, currentMonthStart, currentMonthEnd);
    const balanceSheet = generateBalanceSheet(ledgers, now);
    const cashFlowStatement = generateCashFlowStatement(transactions, currentMonthStart, currentMonthEnd);

    return {
      journalEntries,
      ledgers,
      incomeStatement,
      balanceSheet,
      cashFlowStatement
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const exportToExcel = () => {
    if (!accountingData) return;

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Journal Entries Sheet
    const journalData = accountingData.journalEntries.map(entry => ({
      'Entry Number': entry.entryNumber,
      'Date': formatDate(entry.date),
      'Description': entry.description,
      'Total Amount': entry.totalAmount,
      'Account Code': entry.lines.map(line => line.accountCode).join(', '),
      'Account Name': entry.lines.map(line => line.accountName).join(', '),
      'Debit Amount': entry.lines.map(line => line.debitAmount > 0 ? line.debitAmount : '').join(', '),
      'Credit Amount': entry.lines.map(line => line.creditAmount > 0 ? line.creditAmount : '').join(', ')
    }));
    const journalSheet = XLSX.utils.json_to_sheet(journalData);
    XLSX.utils.book_append_sheet(workbook, journalSheet, 'Journal Entries');

    // Ledgers Sheet
    const ledgerData = accountingData.ledgers.map(ledger => ({
      'Account Code': ledger.code,
      'Account Name': ledger.name,
      'Account Type': ledger.type,
      'Debit Balance': ledger.debitBalance,
      'Credit Balance': ledger.creditBalance,
      'Net Balance': ledger.netBalance
    }));
    const ledgerSheet = XLSX.utils.json_to_sheet(ledgerData);
    XLSX.utils.book_append_sheet(workbook, ledgerSheet, 'Ledgers');

    // Income Statement Sheet
    const incomeStatementData = [
      { Category: 'INCOME', Item: 'Operating Income', Amount: accountingData.incomeStatement.data.income.operatingIncome },
      { Category: 'INCOME', Item: 'Non-Operating Income', Amount: accountingData.incomeStatement.data.income.nonOperatingIncome },
      { Category: 'INCOME', Item: 'Total Income', Amount: accountingData.incomeStatement.data.income.totalIncome },
      { Category: '', Item: '', Amount: '' },
      { Category: 'EXPENSES', Item: 'Operating Expenses', Amount: accountingData.incomeStatement.data.expenses.operatingExpenses },
      { Category: 'EXPENSES', Item: 'Finance Costs', Amount: accountingData.incomeStatement.data.expenses.financeCosts },
      { Category: 'EXPENSES', Item: 'Total Expenses', Amount: accountingData.incomeStatement.data.expenses.totalExpenses },
      { Category: '', Item: '', Amount: '' },
      { Category: 'NET RESULT', Item: 'Net Income', Amount: accountingData.incomeStatement.data.netIncome }
    ];
    const incomeSheet = XLSX.utils.json_to_sheet(incomeStatementData);
    XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income Statement');

    // Balance Sheet Sheet
    const balanceSheetData = [
      { Category: 'ASSETS', Item: 'Current Assets', Amount: accountingData.balanceSheet.data.assets.currentAssets },
      { Category: 'ASSETS', Item: 'Fixed Assets', Amount: accountingData.balanceSheet.data.assets.fixedAssets },
      { Category: 'ASSETS', Item: 'Investments', Amount: accountingData.balanceSheet.data.assets.investments },
      { Category: 'ASSETS', Item: 'Total Assets', Amount: accountingData.balanceSheet.data.assets.totalAssets },
      { Category: '', Item: '', Amount: '' },
      { Category: 'LIABILITIES', Item: 'Current Liabilities', Amount: accountingData.balanceSheet.data.liabilities.currentLiabilities },
      { Category: 'LIABILITIES', Item: 'Non-Current Liabilities', Amount: accountingData.balanceSheet.data.liabilities.nonCurrentLiabilities },
      { Category: 'LIABILITIES', Item: 'Total Liabilities', Amount: accountingData.balanceSheet.data.liabilities.totalLiabilities },
      { Category: '', Item: '', Amount: '' },
      { Category: 'EQUITY', Item: 'Share Capital', Amount: accountingData.balanceSheet.data.equity.shareCapital },
      { Category: 'EQUITY', Item: 'Retained Earnings', Amount: accountingData.balanceSheet.data.equity.retainedEarnings },
      { Category: 'EQUITY', Item: 'Total Equity', Amount: accountingData.balanceSheet.data.equity.totalEquity }
    ];
    const balanceSheet = XLSX.utils.json_to_sheet(balanceSheetData);
    XLSX.utils.book_append_sheet(workbook, balanceSheet, 'Balance Sheet');

    // Cash Flow Statement Sheet
    const cashFlowData = [
      { Category: 'OPERATING ACTIVITIES', Item: 'Net Income', Amount: accountingData.cashFlowStatement.data.operatingActivities.netIncome },
      { Category: 'OPERATING ACTIVITIES', Item: 'Adjustments', Amount: accountingData.cashFlowStatement.data.operatingActivities.adjustments },
      { Category: 'OPERATING ACTIVITIES', Item: 'Cash from Operations', Amount: accountingData.cashFlowStatement.data.operatingActivities.cashFromOperations },
      { Category: '', Item: '', Amount: '' },
      { Category: 'INVESTING ACTIVITIES', Item: 'Investments', Amount: accountingData.cashFlowStatement.data.investingActivities.investments },
      { Category: 'INVESTING ACTIVITIES', Item: 'Cash from Investing', Amount: accountingData.cashFlowStatement.data.investingActivities.cashFromInvesting },
      { Category: '', Item: '', Amount: '' },
      { Category: 'FINANCING ACTIVITIES', Item: 'Loans', Amount: accountingData.cashFlowStatement.data.financingActivities.loans },
      { Category: 'FINANCING ACTIVITIES', Item: 'Cash from Financing', Amount: accountingData.cashFlowStatement.data.financingActivities.cashFromFinancing },
      { Category: '', Item: '', Amount: '' },
      { Category: 'SUMMARY', Item: 'Net Cash Flow', Amount: accountingData.cashFlowStatement.data.netCashFlow },
      { Category: 'SUMMARY', Item: 'Opening Cash', Amount: accountingData.cashFlowStatement.data.openingCash },
      { Category: 'SUMMARY', Item: 'Closing Cash', Amount: accountingData.cashFlowStatement.data.closingCash }
    ];
    const cashFlowSheet = XLSX.utils.json_to_sheet(cashFlowData);
    XLSX.utils.book_append_sheet(workbook, cashFlowSheet, 'Cash Flow Statement');

    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `Visor_Accounting_Report_${dateStr}.xlsx`;

    // Write and download the file
    XLSX.writeFile(workbook, filename);
  };

  if (isLoading || !accountingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading accounting data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 flex flex-col">
        <DialogDescription className="sr-only">
          Double-entry accounting system showing journal entries, ledgers, and financial statements
        </DialogDescription>
        
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl text-blue-900 dark:text-blue-100">
                  Accounting System
                </DialogTitle>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Double-entry bookkeeping following Indian Accounting Standards
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content with proper scrolling */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-6 mt-4 mb-2 flex-shrink-0">
              <TabsTrigger value="journal" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Journal Entries</span>
              </TabsTrigger>
              <TabsTrigger value="ledgers" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Ledgers</span>
              </TabsTrigger>
              <TabsTrigger value="statements" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Financial Statements</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden px-6 pb-6">
              <TabsContent value="journal" className="h-full overflow-auto mt-0">
                <div className="space-y-4 pr-4">
                  {accountingData.journalEntries.map((entry) => (
                      <Card key={entry.id} className="border border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline">{entry.entryNumber}</Badge>
                              <span className="font-medium">{entry.description}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">{formatDate(entry.date)}</div>
                              <div className="font-semibold">{formatCurrency(entry.totalAmount)}</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {entry.lines.map((line) => (
                                <TableRow key={line.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{line.accountName}</div>
                                      <div className="text-xs text-muted-foreground">{line.accountCode}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {line.description}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : '-'}
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="ledgers" className="h-full overflow-auto mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                  {accountingData.ledgers.map((ledger) => (
                      <Card 
                        key={ledger.code} 
                        className="cursor-pointer hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-800"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-sm">{ledger.name}</CardTitle>
                              <p className="text-xs text-muted-foreground">{ledger.code}</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {ledger.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Debits:</span>
                              <span className="font-mono">{formatCurrency(ledger.debitBalance)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Credits:</span>
                              <span className="font-mono">{formatCurrency(ledger.creditBalance)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Net Balance:</span>
                              <span className="font-mono">{formatCurrency(Math.abs(ledger.netBalance))}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="statements" className="h-full overflow-auto mt-0">
                <div className="flex-shrink-0 mb-4">
                  <Select value={selectedStatement} onValueChange={setSelectedStatement}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income Statement</SelectItem>
                      <SelectItem value="balance">Balance Sheet</SelectItem>
                      <SelectItem value="cashflow">Cash Flow Statement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pr-4">
                    {selectedStatement === 'income' && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-center">Income Statement</CardTitle>
                          <p className="text-center text-sm text-muted-foreground">
                            For the period ending {new Date().toLocaleDateString('en-IN')}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">INCOME</h4>
                              <div className="space-y-1 pl-4">
                                <div className="flex justify-between">
                                  <span>Operating Income</span>
                                  <span className="font-mono">{formatCurrency(accountingData.incomeStatement.data.income.operatingIncome)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Non-Operating Income</span>
                                  <span className="font-mono">{formatCurrency(accountingData.incomeStatement.data.income.nonOperatingIncome)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                  <span>Total Income</span>
                                  <span className="font-mono">{formatCurrency(accountingData.incomeStatement.data.income.totalIncome)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">EXPENSES</h4>
                              <div className="space-y-1 pl-4">
                                <div className="flex justify-between">
                                  <span>Operating Expenses</span>
                                  <span className="font-mono">{formatCurrency(accountingData.incomeStatement.data.expenses.operatingExpenses)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Finance Costs</span>
                                  <span className="font-mono">{formatCurrency(accountingData.incomeStatement.data.expenses.financeCosts)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                  <span>Total Expenses</span>
                                  <span className="font-mono">{formatCurrency(accountingData.incomeStatement.data.expenses.totalExpenses)}</span>
                                </div>
                              </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-bold">Net Income</span>
                                <span className={`text-lg font-bold font-mono ${
                                  accountingData.incomeStatement.data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatCurrency(accountingData.incomeStatement.data.netIncome)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {selectedStatement === 'balance' && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-center">Balance Sheet</CardTitle>
                          <p className="text-center text-sm text-muted-foreground">
                            As of {new Date().toLocaleDateString('en-IN')}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">ASSETS & INVESTMENTS</h4>
                              <div className="space-y-2 pl-4">
                                <div className="flex justify-between">
                                  <span>Current Assets</span>
                                  <span className="font-mono">{formatCurrency(accountingData.balanceSheet.data.assets.currentAssets)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Fixed Assets</span>
                                  <span className="font-mono">{formatCurrency(accountingData.balanceSheet.data.assets.fixedAssets)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Investments</span>
                                  <span className="font-mono">{formatCurrency(accountingData.balanceSheet.data.assets.investments)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                  <span>Total Assets</span>
                                  <span className="font-mono">{formatCurrency(accountingData.balanceSheet.data.assets.totalAssets)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-3">LIABILITIES & EQUITY</h4>
                              <div className="space-y-2 pl-4">
                                <div>
                                  <div className="font-medium text-sm mb-1">Liabilities</div>
                                  <div className="flex justify-between text-sm">
                                    <span className="pl-2">Current Liabilities</span>
                                    <span className="font-mono">{formatCurrency(accountingData.balanceSheet.data.liabilities.currentLiabilities)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="pl-2">Non-Current Liabilities</span>
                                    <span className="font-mono">{formatCurrency(accountingData.balanceSheet.data.liabilities.nonCurrentLiabilities)}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span>Total Liabilities</span>
                                    <span className="font-mono">{formatCurrency(accountingData.balanceSheet.data.liabilities.totalLiabilities)}</span>
                                  </div>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <div className="font-medium text-sm mb-1">Equity</div>
                                  <div className="flex justify-between text-sm">
                                    <span className="pl-2">Share Capital</span>
                                    <span className="font-mono">{formatCurrency(accountingData.balanceSheet.data.equity.shareCapital)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="pl-2">Retained Earnings</span>
                                    <span className="font-mono">{formatCurrency(accountingData.balanceSheet.data.equity.retainedEarnings)}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span>Total Equity</span>
                                    <span className="font-mono">{formatCurrency(accountingData.balanceSheet.data.equity.totalEquity)}</span>
                                  </div>
                                </div>
                                
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                  <span>Total Liabilities & Equity</span>
                                  <span className="font-mono">
                                    {formatCurrency(accountingData.balanceSheet.data.liabilities.totalLiabilities + accountingData.balanceSheet.data.equity.totalEquity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {selectedStatement === 'cashflow' && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-center">Cash Flow Statement</CardTitle>
                          <p className="text-center text-sm text-muted-foreground">
                            For the period ending {new Date().toLocaleDateString('en-IN')}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">OPERATING ACTIVITIES</h4>
                              <div className="space-y-1 pl-4">
                                <div className="flex justify-between">
                                  <span>Net Income</span>
                                  <span className="font-mono">{formatCurrency(accountingData.cashFlowStatement.data.operatingActivities.netIncome)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Adjustments</span>
                                  <span className="font-mono">{formatCurrency(accountingData.cashFlowStatement.data.operatingActivities.adjustments)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                  <span>Cash from Operations</span>
                                  <span className="font-mono">{formatCurrency(accountingData.cashFlowStatement.data.operatingActivities.cashFromOperations)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">INVESTING ACTIVITIES</h4>
                              <div className="space-y-1 pl-4">
                                <div className="flex justify-between">
                                  <span>Investments</span>
                                  <span className="font-mono">{formatCurrency(accountingData.cashFlowStatement.data.investingActivities.investments)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                  <span>Cash from Investing</span>
                                  <span className="font-mono">{formatCurrency(accountingData.cashFlowStatement.data.investingActivities.cashFromInvesting)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">FINANCING ACTIVITIES</h4>
                              <div className="space-y-1 pl-4">
                                <div className="flex justify-between">
                                  <span>Loans</span>
                                  <span className="font-mono">{formatCurrency(accountingData.cashFlowStatement.data.financingActivities.loans)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold">
                                  <span>Cash from Financing</span>
                                  <span className="font-mono">{formatCurrency(accountingData.cashFlowStatement.data.financingActivities.cashFromFinancing)}</span>
                                </div>
                              </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span>Net Cash Flow</span>
                                <span className={`font-mono font-semibold ${
                                  accountingData.cashFlowStatement.data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {formatCurrency(accountingData.cashFlowStatement.data.netCashFlow)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Opening Cash</span>
                                <span className="font-mono">{formatCurrency(accountingData.cashFlowStatement.data.openingCash)}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between text-lg font-bold">
                                <span>Closing Cash</span>
                                <span className="font-mono">{formatCurrency(accountingData.cashFlowStatement.data.closingCash)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountingModal;