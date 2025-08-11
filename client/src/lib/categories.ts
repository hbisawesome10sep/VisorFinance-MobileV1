import { 
  ShoppingBag, 
  Car, 
  Gamepad2, 
  Zap, 
  Heart, 
  Home, 
  Briefcase, 
  Gift,
  TrendingUp,
  PiggyBank,
  Banknote,
  Coffee,
  Plane,
  GraduationCap,
  ShoppingCart,
  Smartphone,
  Users,
  Baby,
  Dog,
  Wrench,
  Music,
  Camera,
  Dumbbell,
  Shirt,
  Fuel,
  Calculator,
  Building,
  Landmark,
  Bitcoin,
  CreditCard,
  DollarSign,
  Percent,
  Award,
  type LucideIcon
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'investment';
  icon: LucideIcon;
  color: string;
}

export const categories: Category[] = [
  // Income categories
  { id: 'salary', name: 'Salary', type: 'income', icon: Briefcase, color: 'hsl(142, 76%, 36%)' },
  { id: 'freelance', name: 'Freelance', type: 'income', icon: Banknote, color: 'hsl(142, 76%, 36%)' },
  { id: 'bonus', name: 'Bonus', type: 'income', icon: Gift, color: 'hsl(142, 76%, 36%)' },
  { id: 'business', name: 'Business Income', type: 'income', icon: Building, color: 'hsl(142, 76%, 36%)' },
  { id: 'investment_returns', name: 'Investment Returns', type: 'income', icon: TrendingUp, color: 'hsl(142, 76%, 36%)' },
  { id: 'rental', name: 'Rental Income', type: 'income', icon: Home, color: 'hsl(142, 76%, 36%)' },
  { id: 'dividend', name: 'Dividends', type: 'income', icon: Percent, color: 'hsl(142, 76%, 36%)' },
  { id: 'other_income', name: 'Other Income', type: 'income', icon: DollarSign, color: 'hsl(142, 76%, 36%)' },
  
  // Expense categories
  { id: 'food', name: 'Food & Dining', type: 'expense', icon: Coffee, color: 'hsl(1, 83%, 63%)' },
  { id: 'groceries', name: 'Groceries', type: 'expense', icon: ShoppingCart, color: 'hsl(1, 83%, 63%)' },
  { id: 'transportation', name: 'Transportation', type: 'expense', icon: Car, color: 'hsl(1, 83%, 63%)' },
  { id: 'fuel', name: 'Fuel', type: 'expense', icon: Fuel, color: 'hsl(1, 83%, 63%)' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense', icon: Gamepad2, color: 'hsl(1, 83%, 63%)' },
  { id: 'utilities', name: 'Bills & Utilities', type: 'expense', icon: Zap, color: 'hsl(1, 83%, 63%)' },
  { id: 'healthcare', name: 'Healthcare', type: 'expense', icon: Heart, color: 'hsl(1, 83%, 63%)' },
  { id: 'housing', name: 'Housing & Rent', type: 'expense', icon: Home, color: 'hsl(1, 83%, 63%)' },
  { id: 'shopping', name: 'Shopping', type: 'expense', icon: ShoppingBag, color: 'hsl(1, 83%, 63%)' },
  { id: 'clothing', name: 'Clothing', type: 'expense', icon: Shirt, color: 'hsl(1, 83%, 63%)' },
  { id: 'education', name: 'Education', type: 'expense', icon: GraduationCap, color: 'hsl(1, 83%, 63%)' },
  { id: 'travel', name: 'Travel', type: 'expense', icon: Plane, color: 'hsl(1, 83%, 63%)' },
  { id: 'technology', name: 'Technology', type: 'expense', icon: Smartphone, color: 'hsl(1, 83%, 63%)' },
  { id: 'insurance', name: 'Insurance', type: 'expense', icon: Calculator, color: 'hsl(1, 83%, 63%)' },
  { id: 'fitness', name: 'Fitness & Sports', type: 'expense', icon: Dumbbell, color: 'hsl(1, 83%, 63%)' },
  { id: 'family', name: 'Family & Children', type: 'expense', icon: Baby, color: 'hsl(1, 83%, 63%)' },
  { id: 'pets', name: 'Pets', type: 'expense', icon: Dog, color: 'hsl(1, 83%, 63%)' },
  { id: 'music', name: 'Music & Media', type: 'expense', icon: Music, color: 'hsl(1, 83%, 63%)' },
  { id: 'photography', name: 'Photography', type: 'expense', icon: Camera, color: 'hsl(1, 83%, 63%)' },
  { id: 'maintenance', name: 'Maintenance & Repairs', type: 'expense', icon: Wrench, color: 'hsl(1, 83%, 63%)' },
  { id: 'charity', name: 'Charity & Donations', type: 'expense', icon: Users, color: 'hsl(1, 83%, 63%)' },
  { id: 'other_expense', name: 'Other Expenses', type: 'expense', icon: CreditCard, color: 'hsl(1, 83%, 63%)' },
  
  // Investment categories
  { id: 'stocks', name: 'Stocks', type: 'investment', icon: TrendingUp, color: 'hsl(207, 100%, 54%)' },
  { id: 'mutual_funds', name: 'Mutual Funds', type: 'investment', icon: Landmark, color: 'hsl(207, 100%, 54%)' },
  { id: 'etf', name: 'ETFs', type: 'investment', icon: TrendingUp, color: 'hsl(207, 100%, 54%)' },
  { id: 'bonds', name: 'Bonds', type: 'investment', icon: Award, color: 'hsl(207, 100%, 54%)' },
  { id: 'fixed_deposits', name: 'Fixed Deposits', type: 'investment', icon: PiggyBank, color: 'hsl(207, 100%, 54%)' },
  { id: 'cryptocurrency', name: 'Cryptocurrency', type: 'investment', icon: Bitcoin, color: 'hsl(207, 100%, 54%)' },
  { id: 'real_estate', name: 'Real Estate', type: 'investment', icon: Building, color: 'hsl(207, 100%, 54%)' },
  { id: 'gold', name: 'Gold & Precious Metals', type: 'investment', icon: Award, color: 'hsl(207, 100%, 54%)' },
  { id: 'retirement', name: 'Retirement Funds', type: 'investment', icon: PiggyBank, color: 'hsl(207, 100%, 54%)' },
  { id: 'other_investment', name: 'Other Investments', type: 'investment', icon: TrendingUp, color: 'hsl(207, 100%, 54%)' },
];

export const getCategoryByName = (name: string): Category | undefined => {
  return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
};

export const getCategoriesByType = (type: 'income' | 'expense' | 'investment'): Category[] => {
  return categories.filter(cat => cat.type === type);
};

export const getCategoryIcon = (categoryName: string): LucideIcon => {
  const category = categories.find(cat => cat.name === categoryName || cat.id === categoryName);
  return category?.icon || CreditCard;
};
