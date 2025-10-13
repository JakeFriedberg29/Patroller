import { useState, useMemo } from 'react';

export interface FilterConfig {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

export interface UseDataTableProps<T> {
  data: T[];
  searchableFields?: (keyof T)[];
  filterConfigs?: FilterConfig[];
}

export function useDataTable<T extends Record<string, any>>({
  data,
  searchableFields = [],
  filterConfigs = [],
}: UseDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm && searchableFields.length > 0) {
      result = result.filter((item) =>
        searchableFields.some((field) =>
          String(item[field])
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter((item) => String(item[key]) === value);
      }
    });

    return result;
  }, [data, searchTerm, filters, searchableFields]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1);
  };

  return {
    searchTerm,
    filters,
    currentPage,
    rowsPerPage,
    filteredData,
    paginatedData,
    totalPages,
    totalRecords: filteredData.length,
    handleSearch,
    handleFilter,
    handlePageChange,
    handleRowsPerPageChange,
  };
}
