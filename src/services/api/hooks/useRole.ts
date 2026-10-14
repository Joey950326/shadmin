import type { Api } from '../types/api'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { QUERY_KEYS } from '../keys'
import {
  roleDeleteApi,
  roleDetailApi,
  roleListApi,
  roleOptionsApi,
} from '../modules/role'

export function useRoleList(params: Api.Role.ListParams) {
  return useQuery<Api.Role.ListResponse>({
    queryKey: QUERY_KEYS.ROLE.LIST(params),
    queryFn: () => roleListApi(params),
    placeholderData: keepPreviousData,
  })
}

export function useRoleDetail(params: Api.Role.DetailParams, enabled = true) {
  return useQuery<Api.Role.DetailResponse>({
    queryKey: QUERY_KEYS.ROLE.DETAIL(params),
    queryFn: () => roleDetailApi(params),
    enabled,
  })
}

/** Returns assignable, enabled roles for user forms. */
export function useRoleOptions() {
  return useQuery<Api.Role.OptionsResponse>({
    queryKey: QUERY_KEYS.ROLE.OPTIONS,
    queryFn: () => roleOptionsApi(),
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: Api.Role.DeleteParams) => roleDeleteApi(params),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['role', 'list'] }),
  })
}
