import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Shield, Smartphone, Zap, TrendingUp, PieChart, Target, Bell } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "AI-powered insights into your spending patterns and financial health"
    },
    {
      icon: Shield,
      title: "Bank-Grade Security", 
      description: "Biometric authentication with Touch ID, Face ID, and 2FA protection"
    },
    {
      icon: Smartphone,
      title: "SMS Auto-Parsing",
      description: "Automatically create transactions from bank SMS messages"
    },
    {
      icon: Zap,
      title: "Real-Time Sync",
      description: "Instant updates across all your devices with live notifications"
    },
    {
      icon: TrendingUp,
      title: "Investment Tracking",
      description: "Monitor your portfolio with AI-based investment recommendations"
    },
    {
      icon: PieChart,
      title: "Category Analysis",
      description: "Detailed breakdowns of spending by category with smart insights"
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set and track financial goals with progress monitoring"
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Get notified about unusual spending and budget limits"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Visor
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/register">
              <Button variant="outline" size="sm">
                Sign Up
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Personal Finance
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Take Control of Your Financial Future
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Visor combines AI insights with beautiful design to help you track expenses, 
            set goals, and make smarter financial decisions. Automatically parse bank SMS 
            and get real-time analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth-demo">
              <Button variant="outline" size="lg">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need for financial success</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From AI-powered insights to bank-grade security, Visor provides all the tools 
            you need to manage your finances effectively.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-lg flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to transform your finances?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of users who are already taking control of their financial future with Visor's 
              AI-powered insights and automated transaction tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-muted-foreground">Visor</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Visor. Your AI-powered financial companion.
          </p>
        </div>
      </footer>
    </div>
  );
}