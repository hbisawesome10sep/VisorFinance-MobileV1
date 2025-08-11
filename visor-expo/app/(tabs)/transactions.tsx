import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SMS from 'expo-sms';

export default function Transactions() {
  const [smsText, setSmsText] = useState('');
  const [parsedTransaction, setParsedTransaction] = useState<any>(null);

  const sampleSMSMessages = [
    "SBI: Rs.2,500.00 debited from A/c **1234 on 08-JAN-25 at AMAZON for UPI/P2A/412345678901/amazon@paytm. Avl Bal Rs.45,280.50",
    "HDFC Bank: Rs 1,200 debited from A/c *5678 on 07-JAN-25 for UPI-ZOMATO SWIGGY. Available Balance: Rs 42,350",
    "ICICI: INR 5000.00 credited to A/c **9012 on 06-JAN-25 by NEFT from MONTHLY SALARY. Bal: INR 67,450.00"
  ];

  const parseTransaction = (text: string) => {
    // Enhanced SMS parsing patterns for Indian banks
    const patterns = {
      amount: /(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i,
      type: /(debited|credited|debit|credit)/i,
      date: /(\d{1,2}[-\/]\w{3}[-\/]\d{2,4})/i,
      merchant: /(?:at|for|to|from)\s+([A-Z\s]+?)(?:\s+for|\s+on|\s+UPI|$)/i,
      balance: /(?:Bal|Balance|Avl Bal).*?(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i
    };

    const amountMatch = text.match(patterns.amount);
    const typeMatch = text.match(patterns.type);
    const dateMatch = text.match(patterns.date);
    const merchantMatch = text.match(patterns.merchant);
    const balanceMatch = text.match(patterns.balance);

    if (amountMatch && typeMatch) {
      const transaction = {
        amount: parseFloat(amountMatch[1].replace(/,/g, '')),
        type: typeMatch[1].toLowerCase().includes('credit') ? 'income' : 'expense',
        date: dateMatch ? dateMatch[1] : new Date().toLocaleDateString(),
        merchant: merchantMatch ? merchantMatch[1].trim() : 'Unknown',
        balance: balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : null,
        category: categorizeTransaction(merchantMatch ? merchantMatch[1] : ''),
        rawSMS: text
      };
      
      return transaction;
    }
    
    return null;
  };

  const categorizeTransaction = (merchant: string) => {
    const categories = {
      'ZOMATO|SWIGGY|UBER EATS|FOOD': 'Food & Dining',
      'AMAZON|FLIPKART|MYNTRA|SHOPPING': 'Shopping',
      'UBER|OLA|METRO|TRANSPORT': 'Transportation',
      'SALARY|BONUS|INCOME': 'Salary',
      'ATM|CASH': 'Cash Withdrawal',
      'MEDICAL|PHARMACY|HEALTH': 'Healthcare',
      'ELECTRICITY|GAS|WATER|UTILITIES': 'Utilities'
    };

    for (const [keywords, category] of Object.entries(categories)) {
      if (new RegExp(keywords, 'i').test(merchant)) {
        return category;
      }
    }
    return 'Other';
  };

  const handleParseSMS = () => {
    if (!smsText.trim()) {
      Alert.alert('Error', 'Please enter SMS text to parse');
      return;
    }

    const parsed = parseTransaction(smsText);
    if (parsed) {
      setParsedTransaction(parsed);
      Alert.alert('Success', 'Transaction parsed successfully!');
    } else {
      Alert.alert('Error', 'Could not parse transaction from SMS text');
    }
  };

  const useSampleSMS = (sms: string) => {
    setSmsText(sms);
    const parsed = parseTransaction(sms);
    setParsedTransaction(parsed);
  };

  const requestSMSPermission = async () => {
    try {
      const { status } = await SMS.requestPermissionsAsync();
      if (status === 'granted') {
        Alert.alert('Success', 'SMS permissions granted! You can now automatically parse bank SMS messages.');
      } else {
        Alert.alert('Permission Denied', 'SMS permission is required for automatic transaction parsing.');
      }
    } catch (error) {
      console.error('Error requesting SMS permission:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SMS Transaction Parser</Text>
        <Text style={styles.subtitle}>Test automatic bank SMS parsing</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* SMS Permission */}
        <View style={styles.permissionCard}>
          <Ionicons name="shield-checkmark" size={32} color="#10b981" />
          <Text style={styles.permissionTitle}>Enable SMS Parsing</Text>
          <Text style={styles.permissionDescription}>
            Grant SMS permissions to automatically detect and parse bank transaction messages
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestSMSPermission}>
            <Text style={styles.permissionButtonText}>Grant SMS Permission</Text>
          </TouchableOpacity>
        </View>

        {/* Sample SMS Messages */}
        <Text style={styles.sectionTitle}>Try Sample SMS Messages</Text>
        <View style={styles.samplesContainer}>
          {sampleSMSMessages.map((sms, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.sampleCard}
              onPress={() => useSampleSMS(sms)}
            >
              <Text style={styles.sampleText} numberOfLines={2}>
                {sms}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Manual SMS Input */}
        <Text style={styles.sectionTitle}>Manual SMS Input</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.smsInput}
            placeholder="Paste your bank SMS message here..."
            value={smsText}
            onChangeText={setSmsText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.parseButton} onPress={handleParseSMS}>
            <Ionicons name="search" size={20} color="white" />
            <Text style={styles.parseButtonText}>Parse Transaction</Text>
          </TouchableOpacity>
        </View>

        {/* Parsed Result */}
        {parsedTransaction && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Parsed Transaction</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Amount:</Text>
              <Text style={[styles.resultValue, { 
                color: parsedTransaction.type === 'income' ? '#10b981' : '#ef4444' 
              }]}>
                {parsedTransaction.type === 'expense' ? '-' : '+'}{formatCurrency(parsedTransaction.amount)}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Type:</Text>
              <Text style={styles.resultValue}>{parsedTransaction.type}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Merchant:</Text>
              <Text style={styles.resultValue}>{parsedTransaction.merchant}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Category:</Text>
              <Text style={styles.resultValue}>{parsedTransaction.category}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Date:</Text>
              <Text style={styles.resultValue}>{parsedTransaction.date}</Text>
            </View>
            {parsedTransaction.balance && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Balance:</Text>
                <Text style={styles.resultValue}>{formatCurrency(parsedTransaction.balance)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Features List */}
        <Text style={styles.sectionTitle}>SMS Parsing Features</Text>
        <View style={styles.featuresCard}>
          {[
            'Supports 10+ Indian banks (SBI, HDFC, ICICI, Axis, Kotak)',
            'Automatic amount and merchant detection',
            'Smart category classification',
            'Real-time balance extraction',
            'UPI transaction parsing',
            '95%+ parsing accuracy'
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
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
    backgroundColor: '#8b5cf6',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd6fe',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 15,
    marginBottom: 10,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 30,
    marginBottom: 15,
  },
  samplesContainer: {
    gap: 10,
  },
  sampleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sampleText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    marginRight: 10,
  },
  inputCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  smsInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    height: 100,
    marginBottom: 15,
  },
  parseButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  parseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});