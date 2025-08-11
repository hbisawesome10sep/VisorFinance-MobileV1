import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { type InsertTransaction, type Transaction } from '@shared/schema';
import { getCategoriesByType } from '@/lib/categories';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Simple form schema focused on core fields
const formSchema = z.object({
  type: z.enum(['income', 'expense', 'investment']),
  amount: z.number().min(1, 'Amount must be at least ₹1'),
  title: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  date: z.date(),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z.enum(['weekly', 'monthly']).optional(),
  recurrenceCount: z.coerce.number().min(2).max(299).optional(),
  isSplit: z.boolean().default(false),
  splitCount: z.coerce.number().min(2).max(50).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: InsertTransaction) => void;
  defaultType?: 'income' | 'expense' | 'investment';
  initialData?: Transaction;
}

export function AddTransactionModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  defaultType = 'expense',
  initialData
}: AddTransactionModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: defaultType,
      amount: undefined,
      title: '',
      category: '',
      date: new Date(),
      notes: '',
      isRecurring: false,
      recurrenceFrequency: undefined,
      recurrenceCount: 2,
      isSplit: false,
      splitCount: 2,
    },
  });

  const watchType = form.watch('type');
  const watchIsRecurring = form.watch('isRecurring');
  const watchIsSplit = form.watch('isSplit');
  const watchAmount = form.watch('amount');
  const watchRecurrenceCount = form.watch('recurrenceCount');
  const watchSplitCount = form.watch('splitCount');
  
  const availableCategories = getCategoriesByType(watchType);
  
  // Calculate final amount for display
  const calculateFinalAmount = () => {
    if (!watchAmount) return 0;
    
    let amount = watchAmount;
    
    // First apply recurring logic (multiply)
    if (watchIsRecurring && watchRecurrenceCount) {
      amount = amount * watchRecurrenceCount;
    }
    
    // Then apply split logic (divide)
    if (watchIsSplit && watchSplitCount) {
      amount = amount / watchSplitCount;
    }
    
    return amount;
  };
  
  const finalAmount = calculateFinalAmount();

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          type: initialData.type as 'income' | 'expense' | 'investment',
          amount: Number(initialData.amount),
          title: initialData.title,
          category: initialData.category,
          date: new Date(initialData.date),
          notes: initialData.notes || '',
          isRecurring: initialData.isRecurring || false,
          recurrenceFrequency: initialData.recurrenceFrequency as 'weekly' | 'monthly' | undefined,
          recurrenceCount: initialData.recurrenceCount || 2,
          isSplit: initialData.isSplit || false,
          splitCount: initialData.splitCount || 2,
        });
      } else {
        form.reset({
          type: defaultType,
          amount: undefined,
          title: '',
          category: '',
          date: new Date(),
          notes: '',
          isRecurring: false,
          recurrenceFrequency: undefined,
          recurrenceCount: 2,
          isSplit: false,
          splitCount: 2,
        });
      }
    }
  }, [isOpen, initialData, defaultType, form]);

  const handleSubmit = (data: FormData) => {
    // Calculate amount based on recurring and split logic
    let finalAmount = data.amount;
    
    // If recurring, multiply by recurrence count
    if (data.isRecurring && data.recurrenceCount) {
      finalAmount = finalAmount * data.recurrenceCount;
    }
    
    // If split, divide by split count (your share of the total)
    if (data.isSplit && data.splitCount) {
      finalAmount = finalAmount / data.splitCount;
    }

    const transactionData: InsertTransaction = {
      type: data.type,
      amount: finalAmount,
      title: data.title || `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} - ${data.category}${data.isRecurring ? ` (${data.recurrenceCount}x)` : ''}${data.isSplit ? ` (Split ${data.splitCount} ways)` : ''}`,
      category: data.category,
      date: data.date,
      notes: data.notes || undefined,
      isRecurring: data.isRecurring,
      recurrenceFrequency: data.isRecurring ? data.recurrenceFrequency : undefined,
      recurrenceCount: data.isRecurring ? data.recurrenceCount : undefined,
      isSplit: data.isSplit,
      splitCount: data.isSplit ? data.splitCount : undefined,
      splitWith: undefined, // We'll add this feature later
    };

    onSubmit(transactionData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Transaction Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount and Title in a row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and decimals
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            field.onChange(value === '' ? undefined : Number(value));
                          }
                        }}
                        onKeyDown={(e) => {
                          // Allow: backspace, delete, tab, escape, enter, period
                          if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                              // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                              (e.keyCode === 65 && e.ctrlKey === true) ||
                              (e.keyCode === 67 && e.ctrlKey === true) ||
                              (e.keyCode === 86 && e.ctrlKey === true) ||
                              (e.keyCode === 88 && e.ctrlKey === true) ||
                              // Allow: home, end, left, right
                              (e.keyCode >= 35 && e.keyCode <= 39)) {
                            return;
                          }
                          // Ensure that it is a number and stop the keypress
                          if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                            e.preventDefault();
                          }
                        }}
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        pattern="[0-9]*[.]?[0-9]*"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title or leave blank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category and Date in a row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCategories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Advanced Options */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Advanced Options</h4>
              
              {/* Recurring Transaction */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Recurring Transaction</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Set up automatic recurring transactions
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />
              </div>

              {watchIsRecurring && (
                <div className="ml-6 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="recurrenceFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurrenceCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How many times?</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="2"
                              max="299"
                              placeholder="12"
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === '' ? undefined : Number(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Recurring Amount Display */}
                  {watchIsRecurring && watchAmount && watchRecurrenceCount && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Single amount:</span>
                        <span>₹{watchAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total recurring amount:</span>
                        <span className="text-lg text-blue-600">₹{(watchAmount * watchRecurrenceCount).toFixed(2)}</span>
                      </div>
                      {watchIsSplit && watchSplitCount && (
                        <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-gray-100">
                          <span className="text-muted-foreground">Your share (split {watchSplitCount} ways):</span>
                          <span className="font-medium text-green-600">₹{((watchAmount * watchRecurrenceCount) / watchSplitCount).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Split Transaction */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Split Transaction</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Split this transaction with others
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="isSplit"
                  render={({ field }) => (
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />
              </div>

              {watchIsSplit && (
                <div className="ml-6 p-4 bg-gray-50 rounded-lg space-y-4">
                  <FormField
                    control={form.control}
                    name="splitCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Split between how many people?</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="2"
                            max="50"
                            placeholder="2"
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Split Amount Display (only if not recurring) */}
                  {!watchIsRecurring && watchAmount && watchSplitCount && watchSplitCount > 1 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Total amount:</span>
                        <span>₹{watchAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center font-semibold">
                        <span>Your share ({watchSplitCount} ways):</span>
                        <span className="text-lg text-green-600">₹{(watchAmount / watchSplitCount).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
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
                {initialData ? 'Update' : 'Save'} Transaction
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}