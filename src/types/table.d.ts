import type { RowData } from '@tanstack/table-core'
import type { Api } from '@/services/api/types/api'
/** tanstack table类型扩展 */
declare module '@tanstack/react-table' {
  export interface TableMeta<TData extends RowData> {
    onRowDelete?: (rowId: string | Array<string>) => void
    deleteLoading?: boolean
    onRowView?: (rowData: Api.User.UserInfo) => void
    onRowEdit?: (data: Api.User.UserInfo) => void
    onAvatarUpload?: (data: Api.User.AvatarUploadParams) => void
    onStatusChange?: (data: Api.User.StatusChangeParams) => void
  }
}
