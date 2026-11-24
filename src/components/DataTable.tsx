import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  toolbar?: React.ReactNode;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
  onRowClick?: (row: TData) => void;
  // This prop is correctly defined in the interface
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  toolbar,
  pagination,
  onPageChange,
  onPageSizeChange: _onPageSizeChange, // Prefix with underscore to indicate it's intentionally unused in this component
  loading = false,
  onRowClick,
  // Destructure the prop here so you can use it
  renderSubComponent,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Keep this line as it enables the expansion features
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: !!pagination,
  });

  const totalItems = pagination ? pagination.total : data.length;

  const handlePreviousPage = () => {
    if (pagination && pagination.hasPrev && onPageChange) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.hasNext && onPageChange) {
      onPageChange(pagination.page + 1);
    }
  };

  return (
    <div className="border rounded-lg bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        {title && (
          <h3 className="font-semibold text-lg text-card-foreground">
            {title}{" "}
            <span className="text-muted-foreground text-sm p-[4px] bg-muted rounded-md ">
              {totalItems}
            </span>
          </h3>
        )}
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted hover:bg-muted">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="pl-4 py-3 text-muted-foreground text-sm font-medium"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="md" />
                  <span className="text-muted-foreground">Loading data...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              // Use React.Fragment to render the main row and the expanded row together
              <React.Fragment key={row.id}>
                <TableRow
                  className={row.getIsExpanded() ? "bg-muted/50" : ""}
                  onClick={() => onRowClick?.(row.original)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm py-4 pl-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Conditionally render the expanded content if the row is expanded and the prop exists */}
                {row.getIsExpanded() && renderSubComponent && (
                  <TableRow>
                    {/* The expanded content needs to span all columns for proper alignment */}
                    <TableCell colSpan={columns.length}>
                      {renderSubComponent({ row })}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex items-center gap-4">
          {pagination && (
            <p className="text-sm text-muted-foreground">
              {pagination.page} of {pagination.totalPages}{" "}
              {pagination.totalPages === 1 ? "Page" : "Pages"}
            </p>
          )}
        </div>
        {pagination && (
          <div>
            <Pagination>
              <PaginationContent>
                <PaginationItem className="border rounded-md text-sm">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePreviousPage();
                    }}
                    disabled={!pagination.hasPrev}
                    className={`flex items-center gap-1 px-2.5 py-2 text-sm font-medium transition-colors ${
                      !pagination.hasPrev
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:block">Previous</span>
                  </button>
                </PaginationItem>
                <PaginationItem className="border rounded-md ml-2 text-sm">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNextPage();
                    }}
                    disabled={!pagination.hasNext}
                    className={`flex items-center justify-center gap-3 py-2 text-sm font-medium transition-colors w-24 ${
                      !pagination.hasNext
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    }`}
                  >
                    <span className="hidden sm:block">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}