import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SMSStatusIndicatorProps {
  status: 'working' | 'error' | 'warning';
  message: string;
}

export function SMSStatusIndicator({ status, message }: SMSStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'working':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          badgeVariant: 'default' as const
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          badgeVariant: 'destructive' as const
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          badgeVariant: 'secondary' as const
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <Badge variant={config.badgeVariant} className="text-xs">
          {status.toUpperCase()}
        </Badge>
        <span className="text-sm font-medium">SMS Configuration</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{message}</p>
    </div>
  );
}