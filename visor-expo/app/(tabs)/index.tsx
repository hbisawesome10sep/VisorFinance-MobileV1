import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  title: string;
  amount: string;
  type: 'income' | 'expense' | 'investment';
  category: string;
  date: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    monthlyIncome: 147000,
    monthlyExpenses: 52000,
    totalBalance: 95000,
    monthlyInvestments: 25000
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'income': return 'trending-up';
      case 'expense': return 'trending-down';
      case 'investment': return 'bar-chart';
      default: return 'wallet';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'income': return '#10b981';
      case 'expense': return '#ef4444';
      case 'investment': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome to Visor</Text>
        <Text style={styles.subtitle}>Your AI-powered finance companion</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.card, styles.incomeCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="trending-up" size={24} color="#10b981" />
              <Text style={styles.cardAmount}>{formatCurrency(summary.monthlyIncome)}</Text>
            </View>
            <Text style={styles.cardLabel}>Monthly Income</Text>
          </View>

          <View style={[styles.card, styles.expenseCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="trending-down" size={24} color="#ef4444" />
              <Text style={styles.cardAmount}>{formatCurrency(summary.monthlyExpenses)}</Text>
            </View>
            <Text style={styles.cardLabel}>Monthly Expenses</Text>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={[styles.card, styles.balanceCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="wallet" size={24} color="#3b82f6" />
              <Text style={styles.cardAmount}>{formatCurrency(summary.totalBalance)}</Text>
            </View>
            <Text style={styles.cardLabel}>Total Balance</Text>
          </View>

          <View style={[styles.card, styles.investmentCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="bar-chart" size={24} color="#8b5cf6" />
              <Text style={styles.cardAmount}>{formatCurrency(summary.monthlyInvestments)}</Text>
            </View>
            <Text style={styles.cardLabel}>Investments</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10b981' }]}>
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.actionText}>Add Income</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ef4444' }]}>
              <Ionicons name="remove" size={24} color="white" />
              <Text style={styles.actionText}>Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}>
              <Ionicons name="analytics" size={24} color="white" />
              <Text style={styles.actionText}>View Insights</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SMS Integration Demo */}
        <View style={styles.smsContainer}>
          <Text style={styles.sectionTitle}>SMS Transaction Parsing</Text>
          <View style={styles.smsCard}>
            <Ionicons name="chatbubble-ellipses" size={32} color="#3b82f6" />
            <Text style={styles.smsTitle}>Automatic SMS Parsing</Text>
            <Text style={styles.smsDescription}>
              Grant SMS permissions to automatically detect and parse bank transaction messages
            </Text>
            <TouchableOpacity style={styles.smsButton}>
              <Text style={styles.smsButtonText}>Enable SMS Parsing</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.transactionsList}>
            {[
              { id: '1', title: 'Salary Credit', amount: '75000', type: 'income', category: 'Salary', date: '2025-01-08' },
              { id: '2', title: 'Grocery Shopping', amount: '2500', type: 'expense', category: 'Food', date: '2025-01-07' },
              { id: '3', title: 'Mutual Fund SIP', amount: '10000', type: 'investment', category: 'SIP', date: '2025-01-05' },
            ].map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={[styles.transactionIcon, { backgroundColor: getIconColor(transaction.type) + '20' }]}>
                  <Ionicons name={getIconName(transaction.type) as any} size={20} color={getIconColor(transaction.type)} />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category} • {transaction.date}</Text>
                </View>
                <Text style={[styles.transactionAmount, { color: getIconColor(transaction.type) }]}>
                  {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(parseFloat(transaction.amount))}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#bfdbfe',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: (width - 50) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  balanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  investmentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionsContainer: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: (width - 60) / 3,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  smsContainer: {
    marginTop: 30,
  },
  smsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  smsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 15,
    marginBottom: 10,
  },
  smsDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  smsButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  smsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  transactionsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#6b7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});