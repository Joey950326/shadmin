import type { Api } from '@/services/api/types/api'

type RoleForm = Pick<
  Api.Role.MutationParams,
  'roleName' | 'roleCode' | 'description' | 'status' | 'permissionCodes'
>

type RoleDetailFormSource = Pick<
  Api.Role.DetailResponse['data'],
  'roleName' | 'roleCode' | 'description' | 'status'
> & { permissionCodes?: string[] }

export function mapRoleDetailToForm(detail: RoleDetailFormSource): RoleForm

export function mapRoleMutationPayload(
  form: RoleForm,
  selectedMenuIds: string[],
  retainedHiddenMenuIds: string[],
): Api.Role.MutationParams
