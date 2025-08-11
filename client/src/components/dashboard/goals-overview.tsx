import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Plane, 
  Home, 
  GraduationCap, 
  Car, 
  Heart, 
  MapPin, 
  TrendingUp, 
  Target,
  Plus,
  Edit2,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Goal } from '@shared/schema';
import { formatCurrency } from '@/lib/calculations';

interface GoalsOverviewProps {
  goals: Goal[];
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export function GoalsOverview({ goals, onAddGoal, onEditGoal, onDeleteGoal }: GoalsOverviewProps) {
  const getGoalIcon = (category: string) => {
    switch (category) {
      case 'emergency': return Shield;
      case 'travel': return Plane;
      case 'home': return Home;
      case 'retirement': return Target;
      case 'education': return GraduationCap;
      case 'vehicle': return Car;
      case 'wedding': return Heart;
      case 'vacation': return MapPin;
      case 'investment': return TrendingUp;
      default: return Target;
    }
  };

  const getGoalColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'travel': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'home': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'retirement': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'education': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'vehicle': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20';
      case 'wedding': return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20';
      case 'vacation': return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20';
      case 'investment': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Financial Goals</CardTitle>
          <Button onClick={onAddGoal} variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No financial goals yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Set up your financial goals to track your progress
            </p>
            <Button onClick={onAddGoal} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const Icon = getGoalIcon(goal.category);
              const colorClass = getGoalColor(goal.category);
              const progress = (parseFloat(goal.currentAmount || '0') / parseFloat(goal.targetAmount)) * 100;
              
              return (
                <Card key={goal.id} className="border-0 bg-muted/30 hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{goal.name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">{goal.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">
                          {Math.round(progress)}%
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditGoal(goal)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDeleteGoal(goal.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatCurrency(parseFloat(goal.currentAmount || '0'))} / {formatCurrency(parseFloat(goal.targetAmount))}
                        </span>
                        <span className="text-muted-foreground">
                          ₹{formatCurrency(parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount || '0'))} remaining
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
