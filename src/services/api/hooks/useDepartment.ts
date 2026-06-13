import type { Api } from '../types/api'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../keys'
import { DepartmentListApi } from '../modules/department'

/** 获取用户列表，用于渲染表格 */
export function useDepartmentList() {
  return useQuery<Api.Department.ListResponse>({
    queryKey: QUERY_KEYS.DEPARTMENT.LIST(),
    queryFn: (): Promise<Api.Department.ListResponse> => DepartmentListApi(),
    // placeholderData: keepPreviousData,
  })
}
