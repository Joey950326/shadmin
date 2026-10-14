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
}

export const MUTATION_KEYS = {
  AUTH: {
    LOGIN: ['auth', 'login'] as const,
  },
}
