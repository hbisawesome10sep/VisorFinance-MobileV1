import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className = "" }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={`fixed bottom-24 right-6 z-[9999] h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700 hover:scale-110 active:scale-95 ${className}`}
      style={{ backgroundColor: '#2563eb' }}
    >
      <Plus className="h-6 w-6 text-white" />
    </Button>
  );
}