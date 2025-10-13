import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FieldEditor, type FieldRow, type FieldType } from './FieldEditor';

interface FieldListProps {
  fieldRows: FieldRow[];
  onReorder: (reorderedFields: FieldRow[]) => void;
  updateFieldRow: (id: string, patch: Partial<FieldRow>) => void;
  removeFieldRow: (id: string) => void;
  addFieldRow: (type: FieldType, insertAfterIndex?: number) => void;
}

export function FieldList({
  fieldRows,
  onReorder,
  updateFieldRow,
  removeFieldRow,
  addFieldRow
}: FieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fieldRows.findIndex((item) => item.id === active.id);
      const newIndex = fieldRows.findIndex((item) => item.id === over.id);
      onReorder(arrayMove(fieldRows, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={fieldRows.map(row => row.id)}
        strategy={verticalListSortingStrategy}
      >
        {fieldRows.map((row, index) => (
          <FieldEditor
            key={row.id}
            row={row}
            index={index}
            updateFieldRow={updateFieldRow}
            removeFieldRow={removeFieldRow}
            addFieldRow={addFieldRow}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
