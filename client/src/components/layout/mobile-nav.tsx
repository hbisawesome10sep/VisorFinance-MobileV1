import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  Gauge, 
  ArrowLeftRight, 
  Sparkles, 
  TrendingUp, 
  Settings
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Gauge },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/insights', label: 'Insights', icon: Sparkles },
  { path: '/investments', label: 'Investments', icon: TrendingUp },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/75 dark:bg-slate-900/75 oled:bg-black backdrop-blur-xl border-t border-white/20 dark:border-slate-700/30 oled:border-gray-800 z-50 shadow-2xl shadow-black/10">
      <div className="flex justify-around py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          const getActiveColors = () => {
            switch (item.path) {
              case '/':
                return 'text-blue-600 bg-blue-50 dark:bg-blue-800/30 oled:bg-blue-950/40 border-blue-200 dark:border-blue-700/50 oled:border-blue-800/50';
              case '/transactions':
                return 'text-purple-600 bg-purple-50 dark:bg-purple-800/30 oled:bg-purple-950/40 border-purple-200 dark:border-purple-700/50 oled:border-purple-800/50';
              case '/insights':
                return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-800/30 oled:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700/50 oled:border-emerald-800/50';
              case '/investments':
                return 'text-orange-600 bg-orange-50 dark:bg-orange-800/30 oled:bg-orange-950/40 border-orange-200 dark:border-orange-700/50 oled:border-orange-800/50';
              case '/settings':
                return 'text-slate-600 bg-slate-50 dark:bg-slate-700/30 oled:bg-slate-900/40 border-slate-200 dark:border-slate-600/50 oled:border-slate-700/50';
              default:
                return 'text-primary bg-primary/10 border-primary/20';
            }
          };
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-2xl transition-all duration-300 min-w-0 border border-transparent hover:scale-105 active:scale-95",
                isActive 
                  ? `${getActiveColors()} shadow-lg` 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:border-border/50"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
