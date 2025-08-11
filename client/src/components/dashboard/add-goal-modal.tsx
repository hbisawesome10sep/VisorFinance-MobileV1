import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { type InsertGoal, type Goal } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.coerce.number().min(1, 'Target amount must be at least ₹1'),
  currentAmount: z.coerce.number().min(0, 'Current amount must be at least ₹0').optional(),
  targetDate: z.date().optional(),
  category: z.enum(['emergency', 'travel', 'home', 'retirement', 'education', 'vehicle', 'wedding', 'vacation', 'investment', 'other']),
});

type FormData = z.infer<typeof formSchema>;

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: InsertGoal) => void;
  initialData?: Goal;
}

export function AddGoalModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData
}: AddGoalModalProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: undefined,
      category: 'other',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          targetAmount: Number(initialData.targetAmount),
          currentAmount: Number(initialData.currentAmount || 0),
          targetDate: initialData.targetDate ? new Date(initialData.targetDate) : undefined,
          category: initialData.category as any,
        });
      } else {
        form.reset({
          name: '',
          targetAmount: 0,
          currentAmount: 0,
          targetDate: undefined,
          category: 'other',
        });
      }
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = (data: FormData) => {
    try {
      if (!data.targetAmount || data.targetAmount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid target amount greater than ₹0.",
          variant: "destructive",
        });
        return;
      }

      const goalData: InsertGoal = {
        userId: 'demo-user', // This will be replaced with actual auth later
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        targetDate: data.targetDate,
        category: data.category,
      };
      
      onSubmit(goalData);
      onClose();
      form.reset();
      toast({
        title: initialData ? "Goal updated" : "Goal created",
        description: `Your financial goal has been successfully ${initialData ? 'updated' : 'created'}.`,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: `Failed to ${initialData ? 'update' : 'create'} goal. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const categoryOptions = [
    { value: 'emergency', label: '🛡️ Emergency Fund' },
    { value: 'travel', label: '✈️ Travel & Vacation' },
    { value: 'home', label: '🏠 Home & Property' },
    { value: 'retirement', label: '👴 Retirement' },
    { value: 'education', label: '📚 Education' },
    { value: 'vehicle', label: '🚗 Vehicle' },
    { value: 'wedding', label: '💒 Wedding' },
    { value: 'vacation', label: '🏖️ Vacation' },
    { value: 'investment', label: '📈 Investment' },
    { value: 'other', label: '🎯 Other' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {initialData ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Emergency Fund, Dream Vacation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter target amount"
                      min="1"
                      step="0.01"
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : Number(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter current saved amount"
                      min="0"
                      step="0.01"
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : Number(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {initialData ? 'Update' : 'Create'} Goal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}