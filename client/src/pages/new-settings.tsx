import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Download, 
  Trash2, 
  Eye,
  EyeOff,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  Target,
  TrendingUp,
  Settings as SettingsIcon,
  ChevronRight,
  Edit3,
  AlertTriangle,
  Save,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/common/theme-provider';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/auth-context';
import { type Settings, type InsertSettings } from '@shared/schema';

export default function NewSettings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Get user from auth context instead of separate query
  const { user, logout } = useAuth();

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

  const handleSettingUpdate = (key: string, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark');
    handleSettingUpdate('theme', newTheme);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-800 dark:via-gray-700/30 dark:to-stone-700/30">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 shadow-lg shadow-black/5">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-600 to-stone-600 bg-clip-text text-transparent mb-2">
              Settings & Preferences
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your account, security, and app preferences
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 h-auto p-1 overflow-x-auto">
            <TabsTrigger value="account" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:py-3 sm:px-2 min-w-0">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:py-3 sm:px-2 min-w-0">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:py-3 sm:px-2 min-w-0">
              <Bell className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:py-3 sm:px-2 min-w-0">
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:py-3 sm:px-2 min-w-0">
              <Moon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 py-2 px-1 sm:py-3 sm:px-2 min-w-0">
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card className="card-shadow border-2 border-border/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Overview */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-muted/50 space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {user?.fullName?.charAt(0) || 'H'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold truncate">{user?.fullName || 'Harsh Bhati'}</h3>
                      <p className="text-sm text-muted-foreground truncate">{user?.email || 'harshbhati15987@gmail.com'}</p>
                      <Badge variant="secondary" className="mt-1">
                        {user?.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setIsEditingProfile(true)} className="w-full sm:w-auto">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={logout}
                      className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={user?.fullName || 'Harsh Bhati'} 
                        disabled 
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user?.email || 'harshbhati15987@gmail.com'} 
                        disabled 
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input 
                        id="mobile" 
                        value={user?.mobileNumber || '+918947819840'} 
                        disabled 
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pan">PAN Number</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          id="pan" 
                          value={showPersonalInfo ? (user?.panNumber || 'BQPPB8677N') : '••••••••••'} 
                          disabled 
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPersonalInfo(!showPersonalInfo)}
                        >
                          {showPersonalInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Used for fetching account details and compliance
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="aadhaar">Aadhaar Number (Optional)</Label>
                      <Input 
                        id="aadhaar" 
                        value={showPersonalInfo ? (user?.aadhaarNumber || '5440-2080-4467') : '••••••••••••'} 
                        disabled 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Used for fetching date of birth and additional verification
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input 
                        id="dob" 
                        value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN') : '10/09/1997'} 
                        disabled 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="card-shadow border-2 border-border/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Security & Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Authentication Methods */}
                <div className="space-y-4">
                  <h4 className="font-medium">Authentication Methods</h4>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 min-w-0">
                      <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <h5 className="font-medium">Biometric Authentication</h5>
                        <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                      </div>
                    </div>
                    <Switch
                      checked={(settings as any)?.biometricEnabled || false}
                      onCheckedChange={(checked) => handleSettingUpdate('biometricEnabled', checked)}
                      className="self-start sm:self-center"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-green-600" />
                      <div>
                        <h5 className="font-medium">Two-Factor Authentication</h5>
                        <p className="text-sm text-muted-foreground">Extra security for your account</p>
                      </div>
                    </div>
                    <Switch
                      checked={(settings as any)?.twoFactorEnabled || false}
                      onCheckedChange={(checked) => handleSettingUpdate('twoFactorEnabled', checked)}
                    />
                  </div>
                </div>

                <Separator />

                {/* SMS Parsing */}
                <div className="space-y-4">
                  <h4 className="font-medium">Data Collection</h4>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-purple-600" />
                      <div>
                        <h5 className="font-medium">SMS Transaction Parsing</h5>
                        <p className="text-sm text-muted-foreground">Automatically detect bank transactions from SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={(settings as any)?.smsParsingEnabled !== false}
                      onCheckedChange={(checked) => handleSettingUpdate('smsParsingEnabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="card-shadow border-2 border-border/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-green-600" />
                      <div>
                        <h5 className="font-medium">Email Notifications</h5>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={(settings as any)?.emailNotifications !== false}
                      onCheckedChange={(checked) => handleSettingUpdate('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                      <div>
                        <h5 className="font-medium">Push Notifications</h5>
                        <p className="text-sm text-muted-foreground">Real-time app notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={(settings as any)?.pushNotifications !== false}
                      onCheckedChange={(checked) => handleSettingUpdate('pushNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Settings */}
          <TabsContent value="financial" className="space-y-6">
            <Card className="card-shadow border-2 border-border/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Financial Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Currency Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="min-w-0">
                    <h4 className="font-medium">Default Currency</h4>
                    <p className="text-sm text-muted-foreground">Currency for all transactions</p>
                  </div>
                  <Select 
                    value={(settings as any)?.currency || 'INR'} 
                    onValueChange={(value) => handleSettingUpdate('currency', value)}
                  >
                    <SelectTrigger className="w-full sm:w-32">
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

                <Separator />

                {/* Savings Target */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Savings Target</h4>
                    <p className="text-sm text-muted-foreground">Monthly savings goal percentage</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Slider
                        value={[(settings as any)?.savingsTarget || 30]}
                        onValueChange={(values) => handleSettingUpdate('savingsTarget', values[0])}
                        max={50}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {(settings as any)?.savingsTarget || 30}%
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Investment Preferences */}
                <div className="space-y-4">
                  <h4 className="font-medium">Investment Preferences</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Risk Tolerance</h5>
                      <p className="text-sm text-muted-foreground">Your investment risk appetite</p>
                    </div>
                    <Select 
                      value={(settings as any)?.riskTolerance || 'moderate'} 
                      onValueChange={(value) => handleSettingUpdate('riskTolerance', value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <div>
                        <h5 className="font-medium">Auto-Investment</h5>
                        <p className="text-sm text-muted-foreground">Automatically invest surplus funds</p>
                      </div>
                    </div>
                    <Switch
                      checked={(settings as any)?.autoInvestEnabled || false}
                      onCheckedChange={(checked) => handleSettingUpdate('autoInvestEnabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="card-shadow border-2 border-border/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center">
                    <Moon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span>Appearance & Display</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <Select value={theme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center space-x-2">
                          <Sun className="w-4 h-4" />
                          <span>Light</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center space-x-2">
                          <Moon className="w-4 h-4" />
                          <span>Dark</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <Card className="card-shadow border-2 border-border/50 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                    <Download className="w-5 h-5 text-red-600" />
                  </div>
                  <span>Data Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border">
                    <div className="flex items-center space-x-3">
                      <Download className="w-5 h-5 text-blue-600" />
                      <div>
                        <h5 className="font-medium">Export Data</h5>
                        <p className="text-sm text-muted-foreground">Download your financial data</p>
                      </div>
                    </div>
                    <Button variant="outline">
                      Export CSV
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10">
                    <div className="flex items-center space-x-3">
                      <Trash2 className="w-5 h-5 text-red-600" />
                      <div>
                        <h5 className="font-medium text-red-800 dark:text-red-300">Delete Account</h5>
                        <p className="text-sm text-red-600 dark:text-red-400">Permanently delete your account and data</p>
                      </div>
                    </div>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}