import type { RowData } from '@tanstack/table-core'
import type { Api } from '@/services/api/types/api'
/** tanstack table类型扩展 */
declare module '@tanstack/react-table' {
  export interface TableMeta<TData extends RowData> {
    onRowDelete?: (rowId: string) => void
    deleteLoading?: boolean
    onRowView?: (rowData: Api.User.UserInfo) => void
  }
}
