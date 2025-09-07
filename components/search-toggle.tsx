'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';

interface SearchToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function SearchToggle({ enabled, onToggle }: SearchToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="web-search"
        checked={enabled}
        onCheckedChange={(checked) => onToggle(checked as boolean)}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <label
        htmlFor="web-search"
        className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        <Search className="h-4 w-4" />
        Enable web search
      </label>
    </div>
  );
}