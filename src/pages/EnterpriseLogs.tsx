import { useParams } from "react-router-dom";
import { RefreshCw, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useDataTable } from "@/hooks/useDataTable";
import { DataTable } from "@/components/ui/data-table";
import { 
  actionOptions, 
  resourceOptions, 
  ActionCell, 
  ResourceCell, 
  UserCell, 
  DescriptionCell, 
  TimestampCell,
  exportLogsToCSV 
} from "@/utils/logHelpers";

export default function EnterpriseLogs() {
  const { toast } = useToast();
  const { id } = useParams();

  const { logs, loading, error, refetch } = useAuditLogs({
    accountType: "enterprise",
    accountId: id,
  });

  const dataTable = useDataTable({
    data: logs,
    searchableFields: ['user_name', 'user_email', 'action', 'resource_type'],
    filterConfigs: [
      { key: 'action', label: 'Action', options: actionOptions },
      { key: 'resource_type', label: 'Resource', options: resourceOptions },
    ],
  });

  const handleExportLogs = () => {
    const success = exportLogsToCSV(logs, 'enterprise-logs');
    if (success) {
      toast({
        title: "Export Complete",
        description: "Enterprise logs have been exported successfully.",
      });
    } else {
      toast({
        title: "No Data",
        description: "No logs available to export.",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: 'action' as const,
      header: 'Action',
      cell: (log: any) => <ActionCell log={log} />,
    },
    {
      key: 'resource_type' as const,
      header: 'Resource',
      cell: (log: any) => <ResourceCell log={log} />,
    },
    {
      key: 'user_name' as const,
      header: 'User',
      cell: (log: any) => <UserCell log={log} />,
    },
    {
      key: 'id' as const,
      header: 'Description',
      cell: (log: any) => <DescriptionCell log={log} />,
    },
    {
      key: 'created_at' as const,
      header: 'Timestamp',
      cell: (log: any) => <TimestampCell log={log} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Enterprise Activity Logs</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and analyze activity across all organizations in your enterprise
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refetch}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExportLogs}
            disabled={loading || logs.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <DataTable
        data={dataTable.paginatedData}
        columns={columns}
        searchValue={dataTable.searchTerm}
        onSearchChange={dataTable.handleSearch}
        searchPlaceholder="Search logs by action, user, or details..."
        filters={[
          { key: 'action', label: 'Action', options: actionOptions },
          { key: 'resource_type', label: 'Resource', options: resourceOptions },
        ]}
        filterValues={dataTable.filters}
        onFilterChange={dataTable.handleFilter}
        currentPage={dataTable.currentPage}
        totalPages={dataTable.totalPages}
        onPageChange={dataTable.handlePageChange}
        rowsPerPage={dataTable.rowsPerPage}
        onRowsPerPageChange={dataTable.handleRowsPerPageChange}
        totalRecords={dataTable.totalRecords}
        isLoading={loading}
        emptyMessage={
          dataTable.searchTerm || dataTable.filters.action !== 'all' || dataTable.filters.resource_type !== 'all'
            ? "No logs found matching your criteria."
            : "No enterprise logs available yet. Activity will appear here as users interact with the system."
        }
      />
    </div>
  );
}
