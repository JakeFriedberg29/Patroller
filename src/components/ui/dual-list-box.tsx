import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface DualListBoxItem {
  value: string;
  label: string;
}

interface DualListBoxProps {
  availableItems: DualListBoxItem[];
  selectedItems: DualListBoxItem[];
  onItemsChange: (selected: DualListBoxItem[]) => void;
  availableLabel?: string;
  selectedLabel?: string;
  emptyAvailableMessage?: string;
  emptySelectedMessage?: string;
  className?: string;
}

export function DualListBox({
  availableItems,
  selectedItems,
  onItemsChange,
  availableLabel = "Available",
  selectedLabel = "Selected",
  emptyAvailableMessage = "No items available",
  emptySelectedMessage = "No items selected",
  className = "",
}: DualListBoxProps) {
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);

  const moveRight = () => {
    const itemsToMove = availableItems.filter(item => 
      leftSelected.includes(item.value)
    );
    onItemsChange([...selectedItems, ...itemsToMove]);
    setLeftSelected([]);
  };

  const moveLeft = () => {
    const itemsToRemove = rightSelected;
    onItemsChange(selectedItems.filter(item => 
      !itemsToRemove.includes(item.value)
    ));
    setRightSelected([]);
  };

  const handleLeftToggle = (value: string, checked: boolean) => {
    setLeftSelected(prev => 
      checked ? [...prev, value] : prev.filter(v => v !== value)
    );
  };

  const handleRightToggle = (value: string, checked: boolean) => {
    setRightSelected(prev => 
      checked ? [...prev, value] : prev.filter(v => v !== value)
    );
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${className}`}>
      {/* Available Items */}
      <div className="border rounded-md p-3">
        <div className="font-medium mb-2 text-sm">{availableLabel}</div>
        <div className="space-y-1 max-h-60 overflow-auto">
          {availableItems.length === 0 ? (
            <div className="text-xs text-muted-foreground">{emptyAvailableMessage}</div>
          ) : (
            availableItems.map(item => (
              <label 
                key={item.value} 
                className="flex items-center gap-2 text-sm hover:bg-muted/50 p-1 rounded cursor-pointer"
              >
                <Checkbox
                  checked={leftSelected.includes(item.value)}
                  onCheckedChange={(checked) => 
                    handleLeftToggle(item.value, checked as boolean)
                  }
                />
                <span>{item.label}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Move Buttons */}
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={moveRight}
          disabled={leftSelected.length === 0}
          className="w-32 gap-2"
        >
          <span>Add</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={moveLeft}
          disabled={rightSelected.length === 0}
          className="w-32 gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Remove</span>
        </Button>
      </div>

      {/* Selected Items */}
      <div className="border rounded-md p-3">
        <div className="font-medium mb-2 text-sm">{selectedLabel}</div>
        <div className="space-y-1 max-h-60 overflow-auto">
          {selectedItems.length === 0 ? (
            <div className="text-xs text-muted-foreground">{emptySelectedMessage}</div>
          ) : (
            selectedItems.map(item => (
              <label 
                key={item.value} 
                className="flex items-center gap-2 text-sm hover:bg-muted/50 p-1 rounded cursor-pointer"
              >
                <Checkbox
                  checked={rightSelected.includes(item.value)}
                  onCheckedChange={(checked) => 
                    handleRightToggle(item.value, checked as boolean)
                  }
                />
                <span>{item.label}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

