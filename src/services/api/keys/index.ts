import type { Api } from '../types/api'

export const QUERY_KEYS = {
  AUTH: {
    LOGIN: ['auth', 'login'] as const,
  },
  USER: {
    LIST: (params: Api.User.ListParams) => ['user', 'list', params] as const,
    DELETE: (params: Api.User.DeleteParams) => ['user', 'delete', params] as const,
    DOWNLOAD: (params: Api.User.DownloadParams) => ['user', 'download', params] as const,
  },
  DEPARTMENT: {
    LIST: () => ['department', 'list'] as const,
  },
  ROLE: {
    LIST: (params: Api.Role.ListParams) => ['role', 'list', params] as const,
    DETAIL: (params: Api.Role.DetailParams) => ['role', 'detail', params] as const,
    OPTIONS: ['role', 'options'] as const,
  },
  MENU: {
    AUTHORIZED_NAVIGATION: (username: string | null) => ['authorized-navigation', username] as const,
  },
  PERMISSION: {
    CURRENT_USER: (username: string | null) => ['current-user-permissions', username] as const,
  },
}

export const MUTATION_KEYS = {
  AUTH: {
    LOGIN: ['auth', 'login'] as const,
  },
}
