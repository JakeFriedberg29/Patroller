import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import type { OrganizationSubtype, EnterpriseSubtype } from "@/hooks/useGlobalDashboardData";

export function MultiSelectFilter<T extends string>(props: {
  label: string;
  options: T[];
  selected: Set<T>;
  onToggle: (value: T) => void;
  renderOption?: (v: T) => string;
  includeAll?: boolean;
  onToggleAll?: () => void;
}) {
  const { label, options, selected, onToggle, renderOption, includeAll, onToggleAll } = props;
  const allSelected = selected.size === 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-2">
          {includeAll && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
              <span>All</span>
            </label>
          )}
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={selected.has(opt)} onCheckedChange={() => onToggle(opt)} />
              <span>{renderOption ? renderOption(opt) : (opt as string)}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SingleSelectFilter<T extends string>(props: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const { label, value, options, onChange } = props;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {label}: {options.find(o => o.value === value)?.label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={opt.value === value} onCheckedChange={() => onChange(opt.value)} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CombinedSubtypesFilter(props: {
  orgOptions: OrganizationSubtype[];
  selectedOrg: Set<OrganizationSubtype>;
  onToggleOrg: (v: OrganizationSubtype) => void;
  enterpriseOptions: EnterpriseSubtype[];
  selectedEnterprise: Set<EnterpriseSubtype>;
  onToggleEnterprise: (v: EnterpriseSubtype) => void;
}) {
  const { orgOptions, selectedOrg, onToggleOrg, enterpriseOptions, selectedEnterprise, onToggleEnterprise } = props;
  const orgAll = selectedOrg.size === 0;
  const entAll = selectedEnterprise.size === 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          Subtypes
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-3">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Organization Subtypes</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={orgAll} onCheckedChange={() => {
                  if (orgAll) {
                    orgOptions.forEach(onToggleOrg);
                  } else {
                    Array.from(selectedOrg).forEach(onToggleOrg);
                  }
                }} />
                <span>All</span>
              </label>
              {orgOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedOrg.has(opt)} onCheckedChange={() => onToggleOrg(opt)} />
                  <span>{(opt as string).replace(/_/g, " ")}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Enterprise Subtypes</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={entAll} onCheckedChange={() => {
                  if (entAll) {
                    enterpriseOptions.forEach(onToggleEnterprise);
                  } else {
                    Array.from(selectedEnterprise).forEach(onToggleEnterprise);
                  }
                }} />
                <span>All</span>
              </label>
              {enterpriseOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedEnterprise.has(opt)} onCheckedChange={() => onToggleEnterprise(opt)} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
