import React, { useState, useMemo } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';
import { ChevronLeft, ChevronRight, Search, Filter, Download, RefreshCw } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    showSizeChanger?: boolean;
    onPageChange: (page: number, pageSize: number) => void;
  };
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  onRefresh?: () => void;
  onRowClick?: (record: T) => void;
  rowSelection?: {
    selectedRowKeys: (string | number)[];
    onChange: (selectedRowKeys: (string | number)[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  emptyText?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  searchable = true,
  filterable = false,
  exportable = false,
  onRefresh,
  onRowClick,
  rowSelection,
  emptyText = '데이터가 없습니다',
  className = ''
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // 검색 및 정렬 적용
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // 검색 필터링
    if (searchQuery && searchable) {
      const searchableColumns = columns.filter(col => col.searchable !== false);
      result = result.filter(item => {
        return searchableColumns.some(col => {
          const value = item[col.key as keyof T];
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    }

    // 정렬
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, sortConfig, columns, searchable]);

  const handleSort = (columnKey: string) => {
    setSortConfig(current => {
      if (current?.key === columnKey) {
        return current.direction === 'asc' 
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const handleExport = () => {
    // CSV 내보내기 기본 구현
    const headers = columns.map(col => col.title).join(',');
    const rows = filteredAndSortedData.map(item => 
      columns.map(col => {
        const value = item[col.key as keyof T];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : String(value || '');
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const renderCell = (column: Column<T>, record: T) => {
    const value = record[column.key as keyof T];
    
    if (column.render) {
      return column.render(value, record);
    }
    
    return value;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* 헤더 */}
      {(searchable || filterable || exportable || onRefresh) && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              {searchable && (
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              {filterable && (
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  필터
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {exportable && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  내보내기
                </Button>
              )}
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  새로고침
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {rowSelection && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={rowSelection.selectedRowKeys.length === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                    onChange={(e) => {
                      const allKeys = filteredAndSortedData.map((_, index) => index);
                      rowSelection.onChange(e.target.checked ? allKeys : []);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    {column.title}
                    {column.sortable !== false && sortConfig?.key === column.key && (
                      <span className="text-blue-500">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (rowSelection ? 1 : 0)} className="px-4 py-8 text-center">
                  <LoadingSpinner className="mx-auto" />
                  <p className="mt-2 text-gray-500">데이터를 불러오는 중...</p>
                </td>
              </tr>
            ) : filteredAndSortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowSelection ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              filteredAndSortedData.map((record, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(record)}
                >
                  {rowSelection && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={rowSelection.selectedRowKeys.includes(rowIndex)}
                        onChange={(e) => {
                          const newSelection = e.target.checked
                            ? [...rowSelection.selectedRowKeys, rowIndex]
                            : rowSelection.selectedRowKeys.filter(key => key !== rowIndex);
                          rowSelection.onChange(newSelection);
                        }}
                        disabled={rowSelection.getCheckboxProps?.(record)?.disabled}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-4 py-4 text-sm text-gray-900 ${column.className || ''}`}
                    >
                      {renderCell(column, record)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              전체 {pagination.total}건 중 {Math.min((pagination.current - 1) * pagination.pageSize + 1, pagination.total)}-{Math.min(pagination.current * pagination.pageSize, pagination.total)}건
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current === 1}
                onClick={() => pagination.onPageChange(pagination.current - 1, pagination.pageSize)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="text-sm text-gray-700">
                {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                onClick={() => pagination.onPageChange(pagination.current + 1, pagination.pageSize)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
