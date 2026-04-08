"use client";

import { FilterState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RotateCcw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const divisions = [
  { value: '', label: 'All Divisions' },
  { value: 'K', label: 'Division K' },
  { value: 'P', label: 'Division P' },
  { value: 'J', label: 'Division J' },
  { value: 'H', label: 'Division H' },
];

const branches = [
  { value: '', label: 'All Branches' },
  { value: 'AI/ML', label: 'AI/ML' },
  { value: 'AIDS', label: 'AIDS' },
  { value: 'Automation & Robotics', label: 'Automation & Robotics' },
  { value: 'ENTC', label: 'ENTC' },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const handleDivisionChange = (value: string | null) => {
    onChange({ ...filters, division: value || '' });
  };

  const handleBranchChange = (value: string | null) => {
    onChange({ ...filters, branch: value || '' });
  };

  const handleToggleChange = (checked: boolean) => {
    onChange({ ...filters, showGhostsOnly: checked });
  };

  const handleReset = () => {
    onChange({
      division: '',
      branch: '',
      showGhostsOnly: false,
    });
  };

  const hasActiveFilters = filters.division || filters.branch || filters.showGhostsOnly;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Division:</span>
        <Select value={filters.division} onValueChange={handleDivisionChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select division" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((division) => (
              <SelectItem key={division.value} value={division.value}>
                {division.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Branch:</span>
        <Select value={filters.branch} onValueChange={handleBranchChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.value} value={branch.value}>
                {branch.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={filters.showGhostsOnly}
          onCheckedChange={handleToggleChange}
          id="ghosts-only"
        />
        <label
          htmlFor="ghosts-only"
          className="text-sm font-medium text-muted-foreground cursor-pointer"
        >
          Show Ghosts Only
        </label>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="ml-auto gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>
      )}
    </div>
  );
}
