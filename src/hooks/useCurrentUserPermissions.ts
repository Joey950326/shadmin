import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/services/api/keys'
import { getCurrentUserPermissionsApi } from '@/services/api/modules/permission'
import { useAppSelector } from '@/store/hooks'
import { selectUserInfo } from '@/store/modules/user'

export default function useCurrentUserPermissions() {
  const userInfo = useAppSelector(selectUserInfo)
  const username = userInfo?.username ?? null

  return useQuery({
    queryKey: QUERY_KEYS.PERMISSION.CURRENT_USER(username),
    queryFn: async () => {
      const response = await getCurrentUserPermissionsApi()
      return response.data?.permissionCodes ?? []
    },
    enabled: Boolean(username),
    staleTime: 30_000,
    retry: false,
  })
}
