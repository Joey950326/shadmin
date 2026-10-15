import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import type { TreeItemValue } from '@/components/treeSelector'

declare namespace Api {
  namespace Base {

    interface RequestOptions {
      showLoading?: boolean // 是否显示全局加载状态
      cancelDuplicate?: boolean // 是否取消重复请求（默认开启）
      withToken?: boolean // 是否自动注入 Token（默认开启）
      showError?: boolean // 是否显示全局错误提示（默认关闭）
      showSuccess?: boolean // 是否显示全局成功提示（默认关闭）
    }

    interface RequestInternalConfig<D = any> extends InternalAxiosRequestConfig<D>, RequestOptions {}

    interface RequestConfig<D = any> extends AxiosRequestConfig<D>, RequestOptions {}

    interface ResponseData<T = any> {
      code?: number
      msg?: string
      data?: T
    }
  }

  namespace Auth {
    interface LoginParams {
      username: string
      password: string
    }
    interface LoginResponse extends Base.ResponseData<{
      access_token: string
      userInfo?: {
        username: string
        [key: string]: any
      }
    }> {}
  }

  namespace Permission {
    interface CurrentUserResponse extends Base.ResponseData<{
      permissionCodes: string[]
    }> {}
  }

  namespace Menu {
    interface Node {
      id: string
      parentId?: string
      nameZh: string
      nameEn: string
      type: 'directory' | 'page'
      path?: string
      icon?: string
      sort: number
      status: 0 | 1
      children: Node[]
    }

    interface TreeResponse extends Base.ResponseData<Node[]> {}

    interface MutationParams {
      nameZh: string
      nameEn: string
      parentId?: string
      type: 'directory' | 'page'
      path?: string
      icon?: string
      sort: number
      status: 0 | 1
    }

    interface AddParams extends MutationParams {}

    interface EditParams extends MutationParams {
      id: string
    }

    interface DeleteParams {
      id: string
    }

    interface MutationResponse extends Base.ResponseData {}

    interface UserMenusResponse extends Base.ResponseData<{
      menuIds: string[]
    }> {}
  }

  namespace User {
    interface ListParams {
      startTime?: string
      endTime?: string
      page: number
      pageSize: number
      type?: number
      username?: string
      phone?: string
      gender?: number
      status?: number
    }

    interface UserInfo {
      address: string
      avatar: string
      createTime: string
      email: string
      gender: number
      id: string
      idCard: string
      status: number
      user: {
        detail: {
          age: number
        }
      }
      username: string
      phone?: string
      role?: string | { name?: string }
      roleId?: string
      roleName?: string
      photo?: Array<{
        name: string
        percentage: number
        raw: { uid: string }
        size: number
        status: string
        uid: number
        url: string
      }>
    }

    interface DeleteParams {
      id: Array<string>
    }

    interface EditParams extends UserInfo {
      password?: string
      roleId?: string
    }

    type AddParams = Omit<UserInfo, 'status' | 'user' | 'createTime' | 'id'> | {
      username: string
      password: string
      gender?: 1 | 2
      phone?: string
      email?: string
      status?: 0 | 1
      roleId: string
    }

    interface AvatarUploadParams {
      file: File
    }

    interface StatusChangeParams {
      id: string
      status: 0 | 1
    }

    interface ImportUserParams {
      file: File
    }

    interface DownloadParams {}

    interface ListResponse extends Base.ResponseData<{
      pageNum: number
      pageSize: number
      total: number
      list: Array<UserInfo>
    }> {}

    interface DeleteResponse extends Base.ResponseData {}

    interface EditResponse extends Base.ResponseData {}

    interface AddResponse extends Base.ResponseData {}

    interface ImportResponse extends Base.ResponseData {}

    interface DownloadResponse extends Base.ResponseData {}

    interface StatusChangeResponse extends Base.ResponseData {}

    interface AvatarUploadResponse extends Base.ResponseData<{
      fileUrl: string
    }> {}

  }

  namespace Role {
    interface Info {
      id: string
      roleName: string
      roleCode: string
      description: string
      status: 0 | 1
    }

    interface ListParams {
      page: number
      pageSize: number
      roleName?: string
      roleCode?: string
      status?: 0 | 1
    }

    interface ListResponse extends Base.ResponseData<{
      pageNum: number
      pageSize: number
      total: number
      list: Info[]
    }> {}

    interface DetailParams {
      id: string
    }

    interface MutationParams {
      roleName: string
      roleCode: string
      description?: string
      status: 0 | 1
      menuIds: string[]
    }

    interface AddParams extends MutationParams {}

    interface EditParams extends MutationParams {
      id: string
    }

    interface MutationResponse extends Base.ResponseData {}

    interface DeleteParams {
      id: string[]
    }

    interface StatusChangeParams {
      id: string
      status: 0 | 1
    }

    interface DetailResponse extends Base.ResponseData<Info & { menuIds: string[] }> {}

    interface DeleteResponse extends Base.ResponseData {}

    interface Option {
      id: string
      roleName: string
      roleCode: string
    }

    interface OptionsResponse extends Base.ResponseData<Option[]> {}
  }

  namespace Department {
    interface ListParams {}
    interface ListResponse extends Base.ResponseData {
      data: Array<TreeItemValue>
    }
  }
}

declare module 'axios' {
  export interface AxiosResponse<T = any, D = any> extends ResponseData<T> {}
}
