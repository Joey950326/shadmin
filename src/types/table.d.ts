import type { RowData } from '@tanstack/table-core'
/** tanstack table类型扩展 */
declare module '@tanstack/react-table' {
  export interface TableMeta<TData extends RowData> {
    onRowDelete?: (rowId: string) => void
  }
}
