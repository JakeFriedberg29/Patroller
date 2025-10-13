import { FilterBadge } from "./FilterSelect";
import type { FilterConfig } from "@/components/ui/data-table";

interface ActiveFiltersProps {
  filters: Record<string, string>;
  filterConfigs: FilterConfig[];
  onFilterRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  filterConfigs,
  onFilterRemove,
  onClearAll
}: ActiveFiltersProps) {
  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {activeFilters.map(([key, value]) => {
        const config = filterConfigs.find(c => c.key === key);
        const option = config?.options.find(opt => opt.value === value);
        
        return (
          <FilterBadge
            key={key}
            label={config?.label || key}
            value={option?.label || value}
            onRemove={() => onFilterRemove(key)}
          />
        );
      })}
      <button
        onClick={onClearAll}
        className="text-sm text-muted-foreground hover:text-foreground underline"
      >
        Clear all
      </button>
    </div>
  );
}
