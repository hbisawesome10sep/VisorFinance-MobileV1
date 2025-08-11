import { storage } from './storage';

// Bank sender ID mappings
const BANK_SENDERS = {
  'HDFCBK': 'HDFC Bank',
  'ICICIB': 'ICICI Bank',
  'SBIINB': 'State Bank of India',
  'SBMSMS': 'State Bank of India',
  'PAYTM': 'Paytm Payments Bank',
  'AXISBK': 'Axis Bank',
  'KOTAKB': 'Kotak Mahindra Bank',
  'PNBSMS': 'Punjab National Bank',
  'IOBNET': 'Indian Overseas Bank',
  'UNIONB': 'Union Bank of India'
};

// UPI app patterns
const UPI_PATTERNS = {
  'PhonePe': /PhonePe|phonepe/i,
  'Google Pay': /Google Pay|GPay|googlepay/i,
  'Paytm': /Paytm|paytm/i,
  'BHIM': /BHIM|bhim/i,
  'Amazon Pay': /Amazon Pay|amazonpay/i,
  'WhatsApp Pay': /WhatsApp|whatsapp/i
};

// Enhanced regex patterns for transaction parsing
const TRANSACTION_PATTERNS = [
  // Standard bank SMS patterns - most comprehensive
  {
    pattern: /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited|debited|withdrawn|spent|paid|received|transferred).*?(?:A\/c|account).*?(\*+\d+).*?on\s*([\d-]+).*?(?:at\s*([\d:]+\s*(?:AM|PM)?))?.*?(?:UPI.*?Ref\.?\s*(\w+))?.*?(.+?)(?:\.|\s*$)/i,
    type: 'bank'
  },
  // Simple debit/credit patterns for HDFC, ICICI, SBI
  {
    pattern: /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|credited).*?from.*?A\/c.*?(\*+\d+).*?on\s*([\d-]+).*?(?:UPI\s*Ref\.?\s*(\w+))?.*?(.+?)(?:\.|$)/i,
    type: 'simple_bank'
  },
  // UPI specific patterns
  {
    pattern: /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:sent|received|paid|debited|credited).*?UPI.*?(?:to|from)\s*(.+?)(?:\.|\s*UPI\s*Ref\.?\s*(\w+))/i,
    type: 'upi'
  },
  // Credit card patterns
  {
    pattern: /(?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:spent|charged|debited).*?card.*?(\*+\d+).*?at\s*(.+?)(?:on\s*([\d-]+))?/i,
    type: 'card'
  },
  // Online payment patterns
  {
    pattern: /Payment of (?:Rs\.?|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:made|received).*?(?:to|from)\s*(.+?)(?:on\s*([\d-]+))?/i,
    type: 'online'
  }
];

// Category classification based on merchant/description
const CATEGORY_KEYWORDS = {
  'food': ['swiggy', 'zomato', 'dominos', 'pizza', 'restaurant', 'cafe', 'food', 'dining', 'kitchen', 'meal', 'lunch', 'dinner', 'breakfast'],
  'transport': ['uber', 'ola', 'metro', 'bus', 'taxi', 'petrol', 'diesel', 'fuel', 'parking', 'toll', 'railway', 'irctc'],
  'shopping': ['amazon', 'flipkart', 'myntra', 'nykaa', 'shopping', 'retail', 'store', 'mall', 'purchase', 'buy'],
  'entertainment': ['netflix', 'spotify', 'hotstar', 'prime', 'movie', 'cinema', 'theater', 'game', 'entertainment'],
  'utilities': ['electricity', 'water', 'gas', 'internet', 'mobile', 'recharge', 'bill', 'utility', 'broadband'],
  'healthcare': ['hospital', 'doctor', 'pharmacy', 'medicine', 'health', 'clinic', 'medical'],
  'education': ['school', 'college', 'university', 'course', 'education', 'training', 'study'],
  'investment': ['mutual fund', 'sip', 'equity', 'stock', 'investment', 'trading', 'zerodha', 'groww'],
  'transfer': ['transfer', 'sent to', 'received from', 'family', 'friend', 'personal'],
  'salary': ['salary', 'wages', 'income', 'payroll', 'employment'],
  'other': []
};

interface ParsedTransaction {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  accountNumber?: string;
  upiRef?: string;
  merchant?: string;
  bankName?: string;
}

export function parseBankSMS(message: string, sender: string): ParsedTransaction | null {
  try {
    // Validate inputs
    if (!message || typeof message !== 'string') {
      console.error('Invalid message provided to parseBankSMS');
      return null;
    }
    
    if (!sender || typeof sender !== 'string') {
      console.error('Invalid sender provided to parseBankSMS');
      return null;
    }

    // Clean the message
    const cleanMessage = message.replace(/\s+/g, ' ').trim();
    
    let parsedData: any = null;
    let patternType = '';

    // Try each pattern
    for (const { pattern, type } of TRANSACTION_PATTERNS) {
      const match = cleanMessage.match(pattern);
      if (match) {
        parsedData = match;
        patternType = type;
        break;
      }
    }

    if (!parsedData) {
      return null;
    }

    // Extract amount
    const amountStr = parsedData[1]?.replace(/,/g, '');
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      return null;
    }

    // Determine transaction type (income vs expense)
    const isCredit = /credited|received|refund/i.test(cleanMessage);
    const isDebit = /debited|spent|paid|withdrawn|charged/i.test(cleanMessage);
    
    let transactionType: 'income' | 'expense' = 'expense';
    if (isCredit && !isDebit) {
      transactionType = 'income';
    }

    // Extract merchant/description
    let description = '';
    let merchant = '';
    
    if (patternType === 'bank' || patternType === 'simple_bank') {
      const descMatch = parsedData[6] || parsedData[5] || parsedData[4] || '';
      description = descMatch.trim();
    } else if (patternType === 'upi') {
      merchant = parsedData[2]?.trim() || '';
      description = merchant;
    } else if (patternType === 'card') {
      merchant = parsedData[3]?.trim() || '';
      description = `Card payment at ${merchant}`;
    } else if (patternType === 'online') {
      merchant = parsedData[2]?.trim() || '';
      description = `Payment to ${merchant}`;
    }

    // Clean up description
    description = description
      .replace(/UPI.*?Ref\.?\s*\w+/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!description) {
      description = transactionType === 'income' ? 'Money received' : 'Payment made';
    }

    // Categorize transaction
    const category = categorizeTransaction(description.toLowerCase(), merchant.toLowerCase());

    // Extract date (use current date if not found)
    let transactionDate = new Date();
    const dateMatch = parsedData[3] || parsedData[4];
    if (dateMatch) {
      // Parse date in DD-MM-YYYY or DD-MM-YY format
      const dateParts = dateMatch.split('-');
      if (dateParts.length >= 3) {
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
        let year = parseInt(dateParts[2]);
        
        // Handle 2-digit years
        if (year < 100) {
          year += year < 50 ? 2000 : 1900;
        }
        
        transactionDate = new Date(year, month, day);
      }
    }

    // Extract additional info
    const accountNumber = parsedData[2]?.replace(/\*/g, '') || undefined;
    const upiRef = parsedData[5] || parsedData[3] || undefined;
    const bankName = (BANK_SENDERS as any)[sender] || 'Unknown Bank';

    return {
      amount,
      type: transactionType,
      category,
      description,
      date: transactionDate,
      accountNumber,
      upiRef,
      merchant: merchant || undefined,
      bankName
    };

  } catch (error) {
    console.error('SMS parsing error:', error);
    return null;
  }
}

function categorizeTransaction(description: string, merchant: string): string {
  const text = `${description} ${merchant}`.toLowerCase();
  
  // Check each category for keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'other') continue;
    
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  // Special patterns
  if (/atm|cash/i.test(text)) {
    return 'other';
  }
  
  if (/loan|emi|interest/i.test(text)) {
    return 'other';
  }
  
  return 'other';
}

// Process incoming SMS and create transaction
export async function processSMSTransaction(message: string, sender: string, userId: string = 'demo-user'): Promise<boolean> {
  try {
    const parsed = parseBankSMS(message, sender);
    
    if (!parsed) {
      console.log('Could not parse SMS:', message);
      return false;
    }

    // Create transaction in storage
    const transaction = await storage.createTransaction({
      userId,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      title: parsed.description,
      date: parsed.date,
      isRecurring: false,
      tags: parsed.bankName ? [parsed.bankName] : [],
      notes: parsed.upiRef ? `UPI Ref: ${parsed.upiRef}` : undefined
    });

    console.log('Created transaction from SMS:', {
      id: transaction.id,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      description: parsed.description
    });

    return true;
  } catch (error) {
    console.error('Error processing SMS transaction:', error);
    return false;
  }
}

// Demo function to test SMS parsing
export function testSMSParsing() {
  const testMessages = [
    {
      message: "Rs.1500.00 debited from A/c **1234 on 09-Aug-25. UPI Ref 123456789. Swiggy Food Order",
      sender: "HDFCBK"
    },
    {
      message: "Rs.50000.00 credited to your A/c **5678 on 08-Aug-25 at 02:30PM. Salary Transfer from Company Ltd.",
      sender: "ICICIB"
    },
    {
      message: "Rs.299.00 spent on Netflix subscription via UPI. UPI Ref: 987654321",
      sender: "PAYTM"
    },
    {
      message: "Payment of Rs.2500.00 made to Amazon via Google Pay on 07-Aug-25",
      sender: "GOOGLEPAY"
    }
  ];

  console.log('Testing SMS parsing:');
  testMessages.forEach((test, index) => {
    console.log(`\nTest ${index + 1}:`);
    console.log('Message:', test.message);
    console.log('Sender:', test.sender);
    
    const result = parseBankSMS(test.message, test.sender);
    if (result) {
      console.log('Parsed:', {
        amount: result.amount,
        type: result.type,
        category: result.category,
        description: result.description,
        bank: result.bankName
      });
    } else {
      console.log('Failed to parse');
    }
  });
}