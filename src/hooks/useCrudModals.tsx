import { useState } from "react";

export interface CrudModalState<T> {
  add: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };
  edit: {
    isOpen: boolean;
    open: (item: T) => void;
    close: () => void;
  };
  delete: {
    isOpen: boolean;
    open: (item: T) => void;
    close: () => void;
  };
  bulkDelete: {
    isOpen: boolean;
    open: (items: T[]) => void;
    close: () => void;
  };
  selected: T | null;
  selectedItems: T[];
}

export function useCrudModals<T>(): CrudModalState<T> {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<T | null>(null);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  return {
    add: {
      isOpen: isAddOpen,
      open: () => setIsAddOpen(true),
      close: () => setIsAddOpen(false),
    },
    edit: {
      isOpen: isEditOpen,
      open: (item: T) => {
        setSelected(item);
        setIsEditOpen(true);
      },
      close: () => {
        setIsEditOpen(false);
        setSelected(null);
      },
    },
    delete: {
      isOpen: isDeleteOpen,
      open: (item: T) => {
        setSelected(item);
        setIsDeleteOpen(true);
      },
      close: () => {
        setIsDeleteOpen(false);
        setSelected(null);
      },
    },
    bulkDelete: {
      isOpen: isBulkDeleteOpen,
      open: (items: T[]) => {
        setSelectedItems(items);
        setIsBulkDeleteOpen(true);
      },
      close: () => {
        setIsBulkDeleteOpen(false);
        setSelectedItems([]);
      },
    },
    selected,
    selectedItems,
  };
}
