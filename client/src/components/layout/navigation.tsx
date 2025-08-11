import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Gauge, 
  ArrowLeftRight, 
  Sparkles, 
  TrendingUp, 
  Settings, 
  LogOut, 
  IndianRupee 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Gauge },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/insights', label: 'AI Insights', icon: Sparkles },
  { path: '/investments', label: 'Investments', icon: TrendingUp },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function DesktopNavigation() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-white/70 dark:bg-slate-900/70 oled:bg-black oled:border-r oled:border-gray-900 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/30 shadow-lg shadow-black/5">
        <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <IndianRupee className="w-7 h-7 text-white" />
            </div>
            <div className="ml-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent tracking-tight">Visor</span>
              <p className="text-xs text-muted-foreground mt-1">Financial Intelligence</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="px-4 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              const getActiveColors = () => {
                switch (item.path) {
                  case '/':
                    return 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-800/30 dark:to-indigo-800/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700/50 shadow-lg';
                  case '/transactions':
                    return 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-800/30 dark:to-pink-800/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50 shadow-lg';
                  case '/insights':
                    return 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-800/30 dark:to-teal-800/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50 shadow-lg';
                  case '/investments':
                    return 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-800/30 dark:to-red-800/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700/50 shadow-lg';
                  case '/settings':
                    return 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700/30 dark:to-gray-700/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600/50 shadow-lg';
                  default:
                    return 'bg-primary/10 text-primary border-primary/20 shadow-sm';
                }
              };
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 border border-transparent hover:scale-105 active:scale-95",
                    isActive 
                      ? getActiveColors()
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:border-border/50 hover:shadow-sm"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* User Profile and Logout */}
        <div className="border-t border-border p-4">
          <UserProfile />
        </div>
      </div>
    </aside>
  );
}

function UserProfile() {
  const { user, logout } = useAuth();
  
  return (
    <div className="space-y-3">
      <div className="flex items-center px-2">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {user?.fullName?.charAt(0) || 'U'}
          </span>
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.fullName || 'User'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.preventDefault();
          console.log('Logout button clicked');
          logout();
        }}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
