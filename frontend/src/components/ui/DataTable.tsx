import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  isLoading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  actions
}: DataTableProps<T>) {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      {(searchPlaceholder || actions) && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-border gap-3 bg-muted/20">
          {searchPlaceholder && onSearchChange ? (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input 
                type="text" 
                placeholder={searchPlaceholder} 
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground"
              />
            </div>
          ) : <div />}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={col.key || index} 
                  className={`px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <span className="text-sm">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <motion.tr 
                  key={keyExtractor(item)} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-muted/30' : 'hover:bg-muted/10'}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, index) => (
                    <td 
                      key={col.key || index} 
                      className={`px-4 py-2.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
