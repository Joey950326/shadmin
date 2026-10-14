# 使用 Axios 和 TanStack Query 封装网络请求能力

本文整理项目中基于 Axios 和 TanStack Query 的网络请求实现方式，说明请求层、缓存层、业务 API、React hooks 和页面之间的职责边界，并给出新增接口时可以遵循的实施步骤。

## 一、整体架构

项目将网络请求拆成四层：

```text
页面组件
  ↓ 使用业务 Hook
React Query Hooks
  ↓ 调用 queryFn / mutationFn
API Modules
  ↓ 调用统一 request 实例
Axios Request 封装
  ↓ 拦截器、Token、取消、业务状态码、错误处理
后端接口
```

两套工具的职责不同：

- **Axios** 负责真正发送 HTTP 请求，以及请求配置、请求头、响应转换、取消和错误拦截。
- **TanStack Query** 负责 React 层面的查询状态、缓存、重试、重新获取和 mutation 生命周期。
- **API Modules** 负责一个接口对应的 URL、HTTP 方法、请求参数和响应类型。
- **Query Hooks** 负责把 API Module 封装成页面可以直接调用的 `useQuery` 或 `useMutation`。
- **页面组件** 只关注参数、加载状态、成功提示、错误提示和刷新时机，不直接调用 Axios。

典型查询流程：

```text
页面组装 params
    ↓
useUserList(params)
    ↓
queryKey = ['user', 'list', params]
queryFn = userListApi(params)
    ↓
request.post('/user/list', params)
    ↓
Axios 请求拦截器
    ↓
后端响应
    ↓
Axios 响应拦截器返回 response.data
    ↓
TanStack Query 缓存结果并更新页面
```

典型变更流程：

```text
用户点击删除/编辑/上传
    ↓
useMutation().mutate(params)
    ↓
API Module 调用 request
    ↓
成功：显示提示、刷新列表或更新缓存
失败：显示错误提示
结束：关闭弹窗、停止 loading
```

## 二、目录结构和职责

网络请求代码集中在 `src/services/api/`：

```text
src/services/api/
├── config/
│   └── index.ts              # HTTP 状态、业务状态、Query 默认配置
├── hooks/
│   ├── auth.ts               # 登录 mutation Hook
│   ├── useDepartment.ts      # 部门查询 Hook
│   └── useUser.ts            # 用户查询和变更 Hooks
├── keys/
│   └── index.ts              # Query key 工厂
├── modules/
│   ├── auth.ts               # 认证 API
│   ├── department.ts         # 部门 API
│   └── user.ts               # 用户 API
├── request/
│   ├── axiosCancel.ts        # 重复请求和批量取消
│   └── index.ts              # Axios 实例和统一请求方法
├── types/
│   └── api.d.ts              # 请求、响应和业务模型类型
├── urls/
│   └── auth.ts               # URL 常量
└── queryClient.ts             # 全局 QueryClient
```

应用入口和全局 Provider 位于：

```text
src/main.tsx
src/features/store/provider.tsx
src/store/index.ts
```

页面中的实际使用位置主要包括：

```text
src/pages/login/index.tsx
src/pages/proTable/basicTable/index.tsx
src/pages/proTable/complexTable/index.tsx
src/pages/proTable/treeFilter/index.tsx
src/components/fileDownloader/FileDownloader.tsx
```

## 三、依赖和环境配置

### 1. 已使用的依赖

`package.json` 中的核心依赖包括：

```json
{
  "dependencies": {
    "axios": "...",
    "@tanstack/react-query": "...",
    "@reduxjs/toolkit": "...",
    "react-redux": "...",
    "redux-persist": "..."
  }
}
```

如果在新页面中使用已有请求体系，不需要重新创建 Axios 实例或 QueryClient，只需要添加对应的 URL、类型、API Module 和 Hook。

### 2. API 地址

URL 文件读取环境变量：

```ts
const API_BASE_URL = import.meta.env.VITE_BASE_URL || "";
```

例如：

```ts
export const USER_URLS = {
  LIST: `${API_BASE_URL}/user/list`,
  DELETE: `${API_BASE_URL}/user/delete`,
};
```

Axios 实例的 `baseURL` 则读取：

```ts
baseURL: import.meta.env.VITE_API_BASE_URL;
```

因此当前代码存在两个环境变量名称：

- URL 模块使用 `VITE_BASE_URL`；
- Axios 实例使用 `VITE_API_BASE_URL`。

新增环境配置时必须确认这两个变量的实际用途。更稳妥的方案是统一成一个变量，例如：

```env
VITE_API_BASE_URL=/api
```

然后 URL 模块只保存相对路径：

```ts
export const USER_URLS = {
  LIST: "/user/list",
};
```

或者让所有 URL 都使用同一个环境变量，避免出现 baseURL 和路径前缀重复拼接或其中一处为空的问题。

## 四、请求类型设计

### 1. RequestOptions

`src/services/api/types/api.d.ts` 为 Axios 配置扩展了业务请求选项：

```ts
namespace Api {
  namespace Base {
    interface RequestOptions {
      showLoading?: boolean;
      cancelDuplicate?: boolean;
      withToken?: boolean;
      showError?: boolean;
      showSuccess?: boolean;
    }

    interface RequestInternalConfig<D = any>
      extends InternalAxiosRequestConfig<D>, RequestOptions {}

    interface RequestConfig<D = any>
      extends AxiosRequestConfig<D>, RequestOptions {}
  }
}
```

这些字段不是 Axios 原生配置，而是请求封装层使用的控制开关：

| 字段              | 作用                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `showLoading`     | 是否显示全局 loading，当前实现预留了入口但未真正接入 loading 管理器 |
| `cancelDuplicate` | 是否取消相同请求                                                    |
| `withToken`       | 是否从 localStorage 读取 token 并添加请求头                         |
| `showError`       | 是否由请求层显示统一错误提示                                        |
| `showSuccess`     | 是否由请求层显示统一成功提示                                        |

### 2. ResponseData

统一响应数据结构为：

```ts
interface ResponseData<T = any> {
  code?: number;
  msg?: string;
  data?: T;
}
```

业务 API 类型一般继承这个结构：

```ts
interface ListResponse extends Base.ResponseData<{
  pageNum: number;
  pageSize: number;
  total: number;
  list: Array<UserInfo>;
}> {}
```

登录响应示例：

```ts
interface LoginResponse extends Base.ResponseData<{
  access_token: string;
  userInfo?: {
    username: string;
    [key: string]: any;
  };
}> {}
```

这样页面能够按统一方式访问：

```ts
response.code;
response.msg;
response.data;
```

### 3. AxiosResponse 类型扩展

类型文件还对 Axios 的 `AxiosResponse` 做了模块扩展：

```ts
declare module "axios" {
  export interface AxiosResponse<T = any, D = any> extends ResponseData<T> {}
}
```

实际请求封装会在响应拦截器中返回 `response.data`，所以业务 API 方法最终返回的是业务响应对象，而不是完整 Axios 响应对象。

## 五、HTTP 配置和 React Query 默认行为

文件：`src/services/api/config/index.ts`。

### 1. Axios 基础配置

```ts
const HttpConfig = {
  REQUEST_TIMEOUT: 10 * 1000,
  WITH_CREDENTIALS: true,
  STATUS: {
    SUCCESS: 200,
    ERROR: 500,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
  },
  CODE: {
    SUCCESS: 200,
    UNAUTHORIZED: 401,
  },
};
```

含义如下：

- 请求超时时间为 10 秒；
- 默认允许携带跨域凭据；
- HTTP 401 表示未授权；
- 业务响应 `code === 200` 表示成功；
- 业务响应 `code === 401` 表示登录状态失效。

### 2. Query 默认配置

```ts
export const DEFAULT_QUERY_CONFIG = {
  gcTime: 10 * 60 * 1000,
  networkMode: "online" as const,
  refetchOnMount: true,
  refetchOnReconnect: true,
  refetchOnWindowFocus: false,
  retry: shouldRetry,
  retryDelay: 2000,
  retryOnMount: true,
  staleTime: 30 * 1000,
};
```

行为含义：

| 配置                   | 当前值   | 作用                             |
| ---------------------- | -------- | -------------------------------- |
| `gcTime`               | 10 分钟  | 查询结果不再使用后，缓存保留时间 |
| `staleTime`            | 30 秒    | 数据在 30 秒内视为新鲜           |
| `networkMode`          | `online` | 离线时不主动执行在线请求         |
| `refetchOnMount`       | `true`   | 组件挂载时允许重新请求           |
| `refetchOnReconnect`   | `true`   | 网络恢复后重新请求               |
| `refetchOnWindowFocus` | `false`  | 窗口获得焦点时不自动请求         |
| `retryDelay`           | 2 秒     | 重试之间的等待时间               |
| `retryOnMount`         | `true`   | 挂载时允许重试失败查询           |

### 3. 重试策略

当前最多允许一次重试：

```ts
const REQUEST_TRY_COUNT = 1;
```

只对以下错误重试：

- 没有 HTTP status 的网络错误；
- HTTP 5xx 服务器错误；
- 错误消息包含 `Network Error`；
- 错误消息包含 `timeout`。

4xx 参数错误、权限错误和业务错误默认不重试。

当前代码写成：

```ts
retry: shouldRetry || REQUEST_TRY_COUNT;
```

由于 `shouldRetry` 函数本身是真值，实际传入的是函数。它的行为等价于使用 `shouldRetry`，而不是简单地重试固定次数。

### 4. Mutation 默认配置

```ts
export const DEFAULT_MUTATION_CONFIG = {
  networkMode: "online" as const,
  retry: shouldRetry,
  retryDelay: 2000,
};
```

当前 mutation 也会对网络错误和 5xx 错误进行重试。对于删除、编辑、新增等非幂等操作，生产环境需要谨慎设置 mutation 重试，避免服务器已经执行成功但客户端未收到响应时再次提交。

## 六、Axios 请求封装

文件：`src/services/api/request/index.ts`。

### 1. 创建 Axios 实例

```ts
const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: httpConfig.REQUEST_TIMEOUT,
  withCredentials: httpConfig.WITH_CREDENTIALS,
};

this.instance = axios.create(config);
```

项目通过 `Request` 类封装 Axios 实例，并导出单例：

```ts
export const request = new Request();
export default request;
```

业务代码只引用这个单例，不直接调用 `axios.get` 或 `axios.post`。

### 2. 请求拦截器

请求拦截器执行以下工作：

1. 合并请求级默认配置；
2. 注册待处理请求；
3. 预留全局 loading；
4. 自动注入 token；
5. 返回 Axios 配置。

当前默认业务配置为：

```ts
const mergedConfig = {
  showLoading: false,
  cancelDuplicate: true,
  withToken: true,
  showError: false,
  showSuccess: false,
  ...config,
};
```

Token 注入逻辑：

```ts
const token = localStorage.getItem("accessToken");

if (token) {
  config.headers = config.headers || {};
  config.headers.set("x-access-token", `Bearer ${token}`);
}
```

因此登录成功后，只要把 token 写入 `accessToken`，后续默认请求会自动带上：

```http
x-access-token: Bearer <token>
```

请求可以通过配置关闭 token：

```ts
request.get("/public/config", undefined, {
  withToken: false,
});
```

### 3. 响应拦截器

成功响应会先移除请求记录，然后按照业务 code 判断：

```ts
this.instance.interceptors.response.use((response: AxiosResponse) => {
  const config = response.config as Api.Base.RequestConfig;
  axiosCancel.removeCompleted(config);

  if (response.data?.code === httpConfig.CODE.UNAUTHORIZED) {
    this.handleUnauthorized(config);
    return Promise.reject(response.data);
  }

  if (response.data?.code !== httpConfig.CODE.SUCCESS) {
    return Promise.reject(response.data);
  }

  return response.data;
});
```

因此：

- HTTP 层成功但业务 `code` 不是 200 时，Promise 仍会 reject；
- HTTP 层和业务层都成功时，Hook 收到的是 `response.data`；
- 业务错误会进入 TanStack Query 的 `isError` 和 `onError`；
- 页面不需要重复判断 `response.code === 200` 才能使用 Query 状态。

### 4. 未授权处理

业务 code 或 HTTP status 为 401 时，执行：

```ts
private handleUnauthorized(config: Api.Base.RequestConfig): void {
  if (config.showError) {
    console.error('登录状态已过期，请重新登录')
  }

  localStorage.clear()
  window.location.href = '/auth/login'
}
```

副作用包括：

1. 可选地显示错误；
2. 清除 localStorage；
3. 跳转到登录页。

如果项目同时保存了语言、主题或其他 localStorage 设置，直接 `localStorage.clear()` 会全部删除。生产环境更安全的做法是只清理 token、用户信息和认证相关 key。

### 5. 网络断开处理

当错误发生且浏览器判断当前处于离线状态时：

```ts
private handleDisconnected(): void {
  console.error('网络连接异常，请检查您的网络')
  window.location.href = '/500'
}
```

网络错误随后还会继续被 reject，React Query 仍能记录错误状态。

### 6. 公共请求方法

Request 类提供以下方法：

```ts
public request<T = unknown, D = unknown>(
  config: Api.Base.RequestConfig<D>,
): Promise<T>

public get<T = unknown, D = unknown>(
  url: string,
  params?: D,
  config?: Omit<Api.Base.RequestConfig<D>, 'method' | 'url' | 'params'>,
): Promise<T>

public post<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: Omit<Api.Base.RequestConfig<D>, 'method' | 'url' | 'data'>,
): Promise<T>

public delete<T = unknown, D = unknown>(...): Promise<T>
public put<T = unknown, D = unknown>(...): Promise<T>
```

调用规则：

```ts
request.get<ResponseType>(url, params, config);
request.post<ResponseType>(url, data, config);
request.put<ResponseType>(url, data, config);
request.delete<ResponseType>(url, params, config);
```

GET 请求的第二个参数是查询参数，POST/PUT 请求的第二个参数是请求体，第三个参数才是请求配置。

## 七、重复请求取消机制

文件：`src/services/api/request/axiosCancel.ts`。

### 1. 请求唯一 key

请求 key 由以下信息组成：

```ts
[
  config.method?.toUpperCase() || "GET",
  config.url || "",
  JSON.stringify(config.params ?? {}),
  JSON.stringify(config.data ?? {}),
].join("&");
```

也就是说，相同 HTTP 方法、URL、查询参数和请求体的请求会被视为同一请求。

### 2. 保存 AbortController

```ts
private pendingMap = new Map<string, AbortController>()
```

添加请求时：

```ts
const controller = new AbortController();
this.pendingMap.set(key, controller);
config.signal = controller.signal;
```

Axios 会使用 `signal` 取消请求。

### 3. 取消重复请求

如果相同请求已经存在，理论上应先取消旧请求，再保存新请求：

```ts
if (config.cancelDuplicate) {
  this.removePending(config);
}
```

请求完成后调用 `removeCompleted` 删除记录，避免 Map 持续增长。

### 4. 批量取消

```ts
cancelAll(): void {
  this.pendingMap.forEach(controller => controller.abort())
  this.pendingMap.clear()
}
```

Request 类暴露了：

```ts
request.cancelAllPending();
```

可在退出登录、路由切换或页面销毁时取消全部请求。当前代码中没有发现实际调用点，使用前需要确认取消是否会影响全局 Query 状态。

### 5. 判断取消错误

```ts
isCancel(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const err = error as Record<string, any>
  return err.name === 'AbortError'
    || err.message?.includes('请求被取消')
    || err.code === 'ERR_CANCELED'
}
```

响应错误拦截器会优先判断取消错误，不显示普通错误提示：

```ts
if (axiosCancel.isCancel(error)) {
  return Promise.reject(error);
}
```

## 八、QueryClient 全局配置

文件：`src/services/api/queryClient.ts`。

### 1. 创建 QueryClient

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: DEFAULT_QUERY_CONFIG,
    mutations: DEFAULT_MUTATION_CONFIG,
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error("查询错误:", error);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error("变更错误:", error);
      }
    },
  }),
});
```

### 2. 全局错误回调

`QueryCache.onError` 会接收所有未被局部处理的查询错误。

`MutationCache.onError` 会接收所有未被局部处理的 mutation 错误。

当前只在开发环境打印错误，生产环境预留了监控上报位置。后续可以在这里接入：

- 错误监控平台；
- 全局 Toast；
- 统一登录过期处理；
- 网络状态提示。

全局回调不应该替代页面级错误处理。页面仍然需要根据具体业务显示“删除失败”“登录失败”等用户可理解的消息。

### 3. 接入 QueryClientProvider

`src/main.tsx` 的 Provider 结构是：

```tsx
<StrictMode>
  <StoreProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StoreProvider>
</StrictMode>
```

任何调用 `useQuery`、`useMutation` 或 `useQueryClient` 的组件，必须位于 `QueryClientProvider` 子树中。

## 九、URL、API Module 和 Query Key

### 1. URL 常量

文件：`src/services/api/urls/auth.ts`。

URL 按业务域分组：

```ts
export const AUTH_URLS = {
  LOGIN: `${API_BASE_URL}/login`,
  LOGOUT: `${API_BASE_URL}/logout`,
};

export const USER_URLS = {
  LIST: `${API_BASE_URL}/user/list`,
  DELETE: `${API_BASE_URL}/user/delete`,
  EDIT: `${API_BASE_URL}/user/edit`,
  ADD: `${API_BASE_URL}/user/add`,
  AVATAR_UPLOAD: `${API_BASE_URL}/file/upload/img`,
  IMPORT: `${API_BASE_URL}/user/import`,
  DOWNLOAD: `${API_BASE_URL}/user/export`,
  CHANGE: `${API_BASE_URL}/user/change`,
};
```

页面和 Hook 不应直接拼接 URL。新增接口时先在 URL 文件中增加常量。

### 2. API Module

API Module 只负责调用 request，并绑定类型：

```ts
import type { Api } from "../types/api";
import request from "../request";
import { USER_URLS } from "../urls/auth";

export function userListApi(
  data: Api.User.ListParams,
  options?: Api.Base.RequestOptions,
) {
  return request.post<Api.User.ListResponse>(USER_URLS.LIST, data, options);
}
```

删除接口：

```ts
export function userDeleteApi(
  params: Api.User.DeleteParams,
  options?: Api.Base.RequestOptions,
) {
  return request.post<Api.User.DeleteResponse>(
    USER_URLS.DELETE,
    params,
    options,
  );
}
```

上传接口先将 File 转为 FormData：

```ts
export function userAvatarUpload(
  params: Api.User.AvatarUploadParams,
  options?: Api.Base.RequestOptions,
) {
  const formData = new FormData();
  formData.append("file", params.file);

  return request.post<Api.User.AvatarUploadResponse>(
    USER_URLS.AVATAR_UPLOAD,
    formData,
    options,
  );
}
```

不要在 API Module 中调用 `useQuery` 或 `useMutation`，也不要在其中显示 Toast。API Module 应该保持为可以在 React 之外调用的纯请求函数。

### 3. Query key 工厂

文件：`src/services/api/keys/index.ts`。

```ts
export const QUERY_KEYS = {
  USER: {
    LIST: (params: Api.User.ListParams) => ["user", "list", params] as const,
    DELETE: (params: Api.User.DeleteParams) =>
      ["user", "delete", params] as const,
    DOWNLOAD: (params: Api.User.DownloadParams) =>
      ["user", "download", params] as const,
  },
  DEPARTMENT: {
    LIST: () => ["department", "list"] as const,
  },
};
```

Query key 的作用：

- 区分不同查询；
- 将分页、筛选条件纳入缓存；
- 让不同参数的列表分别缓存；
- 支持 `invalidateQueries` 和 `refetchQueries` 精确定位。

例如：

```ts
["user", "list", { page: 1, pageSize: 10 }][
  ("user", "list", { page: 2, pageSize: 10 })
];
```

这两个查询会拥有不同的缓存。

项目还定义了 `MUTATION_KEYS`，但现有 mutation Hook 没有实际传入 `mutationKey`。如果需要统一管理 mutation，可以在 Hook 中补充：

```ts
useMutation({
  mutationKey: MUTATION_KEYS.AUTH.LOGIN,
  mutationFn,
});
```

## 十、React Query Hooks

### 1. 用户列表查询

文件：`src/services/api/hooks/useUser.ts`。

```ts
export function useUserList(params: Api.User.ListParams) {
  return useQuery<Api.User.ListResponse>({
    queryKey: QUERY_KEYS.USER.LIST(params),
    queryFn: (): Promise<Api.User.ListResponse> => userListApi(params),
    placeholderData: keepPreviousData,
  });
}
```

关键点：

- `params` 同时传入 `queryKey` 和 `queryFn`；
- 参数变化时，TanStack Query 认为是新查询；
- `keepPreviousData` 在分页或筛选变化时保留旧数据，减少表格闪烁；
- `isFetching` 可以用于显示后台刷新遮罩；
- `data` 的类型为 `Api.User.ListResponse`。

### 2. 用户变更 mutation

删除、编辑、新增、头像上传和状态变更分别封装：

```ts
export function useDeleteUser() {
  return useMutation({
    mutationFn: (
      params: Api.User.DeleteParams,
    ): Promise<Api.User.DeleteResponse> => userDeleteApi(params),
  });
}

export function useEditUser() {
  return useMutation({
    mutationFn: (params: Api.User.EditParams): Promise<Api.User.EditResponse> =>
      userEditApi(params),
  });
}

export function useAvatarUpload() {
  return useMutation({
    mutationFn: (
      params: Api.User.AvatarUploadParams,
    ): Promise<Api.User.AvatarUploadResponse> => userAvatarUpload(params),
  });
}
```

页面使用：

```tsx
const deleteMutation = useDeleteUser();

deleteMutation.mutate(
  { id: [rowId] },
  {
    onSuccess: () => {
      toast.success("删除成功");
    },
    onError: () => {
      toast.error("删除失败");
    },
    onSettled: () => {
      void refetch();
    },
  },
);
```

Hook 只封装请求函数；具体页面是否显示 Toast、关闭 Dialog 或刷新列表，由调用页面决定。

### 3. 登录 mutation

文件：`src/services/api/hooks/auth.ts`。

```ts
export function useLogin() {
  return useMutation({
    mutationFn: (data: Api.Auth.LoginParams): Promise<Api.Auth.LoginResponse> =>
      loginApi(data),
  });
}
```

登录页在成功回调中：

1. 读取响应中的 `access_token`；
2. dispatch 到用户状态；
3. 保存用户信息；
4. 标记手动登录状态；
5. 后续 Axios 请求自动从 localStorage 读取 token。

### 4. 部门列表查询

```ts
export function useDepartmentList() {
  return useQuery<Api.Department.ListResponse>({
    queryKey: QUERY_KEYS.DEPARTMENT.LIST(),
    queryFn: (): Promise<Api.Department.ListResponse> => DepartmentListApi(),
  });
}
```

部门树组件使用：

```tsx
const { data, isLoading } = useDepartmentList();

const treeData = data?.data ?? [];
```

### 5. 手动触发的下载查询

文件下载 Hook 使用禁用的 query：

```ts
export function useUserImportDownload(params: Api.User.DownloadParams) {
  return useQuery<Api.User.ListResponse>({
    queryKey: QUERY_KEYS.USER.DOWNLOAD(params),
    queryFn: (): Promise<Api.User.DownloadResponse> => userDownload(params),
    enabled: false,
  });
}
```

组件通过 `refetch()` 触发：

```tsx
const { refetch } = useUserImportDownload({});

const result = await refetch();
if (result.isSuccess) {
  // 处理返回文件
}
```

这种模式适合“点击按钮才请求”的场景，但下载文件最好将响应类型配置为 `blob`，不能将文件响应当作普通 JSON 处理。当前下载组件把返回数据序列化成 JSON Blob，真实项目接入文件下载时需要改进，详见后文注意事项。

## 十一、页面中的使用方式

### 1. 表格分页查询

基础表格根据分页状态组装请求参数：

```tsx
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});

const fetchParams = useMemo(
  () => ({
    type: 1,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  }),
  [pagination.pageIndex, pagination.pageSize],
);

const { data, isFetching, refetch } = fetchTableData(fetchParams);
```

页面把 `useUserList` 作为函数传给通用表格：

```tsx
<BasicTable
  columns={tableColumns}
  fetchTableData={useUserList}
  onRowDelete={deleteMutation}
  onRowEdit={editMutation}
  onAvatarUpload={avatarUploadMutation}
/>
```

通用表格内部调用这个 Hook：

```tsx
const { data: response, isFetching, refetch } = fetchTableData(fetchParams);
```

这种写法让表格组件可以复用查询流程，但需要遵守 React Hook 规则：传入的 `fetchTableData` 必须始终是同一个遵守 Hook 命名和调用顺序的 Hook，不要根据条件动态替换 Hook。

### 2. 筛选条件进入 queryKey

复杂表格将分页和筛选条件组合成请求参数：

```tsx
const fetchParams = useMemo(
  () => ({
    type: 1,
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    ...searchValue,
  }),
  [pagination, searchValue],
);
```

随后调用：

```tsx
const { data, isFetching, refetch } = fetchTableData(fetchParams);
```

因为 `useUserList` 将完整 `params` 放入 `queryKey`，所以分页、搜索、状态和角色变化会触发对应的新查询。

### 3. mutation 后刷新列表

当前页面在 mutation 的 `onSettled` 中调用当前查询的 `refetch`：

```tsx
onSettled: () => {
  void refetch();
};
```

这样无论成功还是失败都会刷新列表。更精确的做法是成功后让 QueryClient 失效列表缓存：

```tsx
const queryClient = useQueryClient();

const deleteMutation = useMutation({
  mutationFn: userDeleteApi,
  onSuccess: async () => {
    await queryClient.invalidateQueries({
      queryKey: ["user", "list"],
    });
  },
});
```

使用 `invalidateQueries` 时，列表 query key 的前缀必须与 `QUERY_KEYS.USER.LIST` 一致。

### 4. Loading 状态

查询使用：

```tsx
const { data, isLoading, isFetching, isError, error } = useUserList(params);
```

建议区分：

- `isLoading`：首次加载，没有可显示的数据；
- `isFetching`：任何正在请求，包括已有数据时的后台刷新；
- `isPending`：mutation 尚未完成；
- `isError`：查询或变更失败。

项目表格在 `isFetching` 时显示遮罩，mutation 控件使用 `isPending` 禁用按钮。

## 十二、从零新增一个接口的实施步骤

下面以新增“获取商品列表”接口为例。

### 步骤 1：增加业务类型

在 `src/services/api/types/api.d.ts` 中增加：

```ts
namespace Api {
  namespace Product {
    interface ListParams {
      page: number;
      pageSize: number;
      keyword?: string;
    }

    interface ProductItem {
      id: string;
      name: string;
      price: number;
    }

    interface ListResponse extends Base.ResponseData<{
      pageNum: number;
      pageSize: number;
      total: number;
      list: Array<ProductItem>;
    }> {}
  }
}
```

如果是新增、编辑或删除，还要同时定义对应的 Params 和 Response。

### 步骤 2：增加 URL 常量

在 `src/services/api/urls/product.ts` 中创建：

```ts
const API_BASE_URL = import.meta.env.VITE_BASE_URL || "";

export const PRODUCT_URLS = {
  LIST: `${API_BASE_URL}/product/list`,
  DETAIL: `${API_BASE_URL}/product/detail`,
};
```

如果项目已统一使用 `VITE_API_BASE_URL`，应改为统一的环境变量方案，不要继续引入第二个 base URL 变量。

### 步骤 3：创建 API Module

创建 `src/services/api/modules/product.ts`：

```ts
import type { Api } from "../types/api";
import request from "../request";
import { PRODUCT_URLS } from "../urls/product";

export function productListApi(
  params: Api.Product.ListParams,
  options?: Api.Base.RequestOptions,
) {
  return request.post<Api.Product.ListResponse>(
    PRODUCT_URLS.LIST,
    params,
    options,
  );
}
```

不要在这里使用 React Hook，也不要在这里调用 Toast。

### 步骤 4：增加 Query key

修改 `src/services/api/keys/index.ts`：

```ts
export const QUERY_KEYS = {
  // 既有 key...
  PRODUCT: {
    LIST: (params: Api.Product.ListParams) =>
      ["product", "list", params] as const,
  },
};
```

Key 要包含会影响返回数据的所有参数。

### 步骤 5：创建查询 Hook

创建 `src/services/api/hooks/useProduct.ts`：

```ts
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Api } from "../types/api";
import { QUERY_KEYS } from "../keys";
import { productListApi } from "../modules/product";

export function useProductList(params: Api.Product.ListParams) {
  return useQuery<Api.Product.ListResponse>({
    queryKey: QUERY_KEYS.PRODUCT.LIST(params),
    queryFn: () => productListApi(params),
    placeholderData: keepPreviousData,
  });
}
```

### 步骤 6：在页面使用

```tsx
function ProductPage() {
  const params = useMemo(
    () => ({
      page: 1,
      pageSize: 20,
      keyword: searchKeyword,
    }),
    [searchKeyword],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useProductList(params);

  if (isLoading) {
    return <div>加载中...</div>;
  }

  if (isError) {
    return <div>加载失败</div>;
  }

  return (
    <ProductTable
      data={data?.data?.list ?? []}
      loading={isFetching}
      onRefresh={() => void refetch()}
    />
  );
}
```

### 步骤 7：增加 mutation 并刷新列表

```ts
export function useDeleteProduct() {
  return useMutation({
    mutationFn: (id: string) => productDeleteApi({ id }),
  });
}
```

页面中：

```tsx
const queryClient = useQueryClient();
const deleteMutation = useDeleteProduct();

const handleDelete = (id: string) => {
  deleteMutation.mutate(id, {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["product", "list"],
      });
    },
  });
};
```

### 步骤 8：验证接口

确认：

1. URL 与后端文档一致；
2. HTTP 方法正确；
3. body、params 和 headers 位置正确；
4. response 类型与真实 JSON 一致；
5. queryKey 包含所有查询条件；
6. 失败时能进入 `isError` 或 `onError`；
7. mutation 成功后列表缓存得到刷新；
8. 刷新页面后请求状态符合预期。

## 十三、上传和文件下载

### 1. 文件上传

上传 API Module 使用 `FormData`：

```ts
const formData = new FormData();
formData.append("file", file);

return request.post<ResponseType>(url, formData);
```

通常不需要手动设置 `Content-Type`，浏览器会自动补充 multipart boundary。如果手动写成 `application/json`，上传可能失败。

页面使用 mutation：

```tsx
const uploadMutation = useAvatarUpload();

uploadMutation.mutate(
  { file },
  {
    onSuccess: (response) => {
      const fileUrl = response.data?.fileUrl;
      // 更新头像或表单值
    },
  },
);
```

### 2. 文件下载

文件下载应显式指定 Axios 响应类型：

```ts
export function productExportApi() {
  return request.post<Blob>(
    PRODUCT_URLS.EXPORT,
    {},
    {
      responseType: "blob",
    },
  );
}
```

如果统一响应拦截器无条件读取 `response.data.code`，Blob 响应会被误判为业务失败。因此文件下载需要在响应拦截器中单独判断：

```ts
if (config.responseType === "blob") {
  return response.data;
}
```

然后页面创建下载链接：

```ts
const blob = await productExportApi();
const url = URL.createObjectURL(blob);
const anchor = document.createElement("a");
anchor.href = url;
anchor.download = "products.xlsx";
anchor.click();
URL.revokeObjectURL(url);
```

对于“点击后才下载”的操作，可以使用 `useMutation`，也可以使用 `enabled: false` 的 `useQuery` + `refetch`。下载不会被当成普通列表查询缓存时，mutation 通常更直观。

## 十四、现有实现中的注意事项

以下问题不会改变整体架构，但新增接口或维护旧接口时需要注意。

### 1. 请求默认配置没有完整写回 Axios config

请求拦截器创建了：

```ts
const mergedConfig = {
  showLoading: false,
  cancelDuplicate: true,
  withToken: true,
  showError: false,
  showSuccess: false,
  ...config,
};
```

但后续调用 `axiosCancel.addPending(config)`，响应拦截器读取的也是原始 `config`，不是 `mergedConfig`。因此：

- `withToken` 因为在拦截器中直接读取 `mergedConfig`，默认注入有效；
- `showLoading`、`showError`、`showSuccess` 的默认值没有写回原配置；
- `axiosCancel.addPending(config)` 内部再次判断 `config.cancelDuplicate` 时，默认值可能是 `undefined`，导致重复请求取消逻辑不完全符合声明；
- 响应阶段可能读取不到调用时的默认业务选项。

更稳妥的实现是将合并后的业务字段写入请求配置，或让取消器和响应拦截器都显式接收 `mergedConfig`：

```ts
const mergedConfig = {
  ...config,
  showLoading: config.showLoading ?? false,
  cancelDuplicate: config.cancelDuplicate ?? true,
  withToken: config.withToken ?? true,
  showError: config.showError ?? false,
  showSuccess: config.showSuccess ?? false,
};

Object.assign(config, mergedConfig);
```

修改时要确认不会覆盖 Axios 原生字段，例如 `headers`、`signal` 和 `data`。

### 2. GET 请求的 options 位置

`request.get` 的签名是：

```ts
get(url, params?, config?)
```

因此不能把业务 RequestOptions 作为第二个参数：

```ts
// 容易被当成 query params
request.get(url, options);
```

应该写成：

```ts
request.get(url, undefined, options);
```

部门 API 当前没有传 options，所以没有暴露出问题；新增 GET 接口时应使用正确位置。

### 3. 部门 GET API 的参数命名

部门 API 当前写法是：

```ts
export function DepartmentListApi(options?: Api.Base.RequestOptions) {
  return request.get<Api.Department.ListResponse>(
    DEPARTMENT_URLS.LIST,
    options,
  );
}
```

如果以后需要传请求配置，应改为：

```ts
return request.get<Api.Department.ListResponse>(
  DEPARTMENT_URLS.LIST,
  undefined,
  options,
);
```

如果接口本身有查询参数，则应把参数和 options 分开：

```ts
return request.get<ResponseType>(url, params, options);
```

### 4. 导入用户 Hook 调错 API

用户 Hook 中的导入函数当前调用了头像上传 API：

```ts
export function useImportUser() {
  return useMutation({
    mutationFn: (params: Api.User.ImportUserParams) => userAvatarUpload(params),
  });
}
```

用户导入应调用已经定义的 `userImportApi`：

```ts
export function useImportUser() {
  return useMutation({
    mutationFn: (params: Api.User.ImportUserParams) => userImportApi(params),
  });
}
```

新增批量上传能力时，应确认“头像上传”和“用户导入”使用不同的 URL、参数类型和响应类型。

### 5. 下载 Hook 的响应类型不一致

当前下载 Hook 的 `useQuery` 泛型是 `Api.User.ListResponse`，但 `queryFn` 返回的是 `Api.User.DownloadResponse`。应改为：

```ts
return useQuery<Api.User.DownloadResponse>({
  queryKey: QUERY_KEYS.USER.DOWNLOAD(params),
  queryFn: () => userDownload(params),
  enabled: false,
});
```

如果真实接口返回文件，则应进一步改为 `Blob` 并配置 `responseType: 'blob'`，不能继续使用列表响应模型。

### 6. 当前列表刷新主要依赖手动 refetch

删除、编辑、上传和状态变更之后，页面通常在 `onSettled` 中调用 `refetch()`。这种方式可用，但多个页面都需要维护自己的 refetch 引用。

更统一的方式是在 mutation 成功后：

```ts
await queryClient.invalidateQueries({
  queryKey: ["user", "list"],
});
```

这样所有使用用户列表 key 的组件都会被标记为过期，不需要逐层传递 `refetch`。

### 7. mutation 重试需要谨慎

当前默认 mutation 重试网络错误和 5xx。对查询通常合理，对新增、删除、编辑等写操作可能产生重复执行风险。

建议按接口类型配置：

```ts
useMutation({
  mutationFn: createUserApi,
  retry: false,
});
```

只有明确幂等的写操作，才考虑自动重试。

### 8. 业务错误和 AxiosError 是两类错误

响应拦截器对业务 `code !== 200` 直接 `Promise.reject(response.data)`，这类错误不一定是 `AxiosError`。页面不能只写：

```ts
if (error instanceof AxiosError) {
  // 所有错误
}
```

还需要处理业务错误结构：

```ts
onError: (error) => {
  if (error instanceof AxiosError) {
    // 网络或 HTTP 错误
    return;
  }

  const businessError = error as Api.Base.ResponseData;
  console.error(businessError.msg);
};
```

最好进一步定义统一的 `ApiError`，让全局和页面提示拥有稳定类型。

### 9. 错误拦截器需要防御空 config

错误拦截器中可能出现没有 `error.config` 的错误，例如请求尚未发出就失败。访问 `config.showError` 前应先判断 `config`：

```ts
const config = error.config as Api.Base.RequestConfig | undefined;

if (config?.showError) {
  // 显示错误
}
```

未授权处理也应该允许 config 为空，避免错误处理逻辑再次抛错。

### 10. localStorage 清理范围

未授权时直接调用 `localStorage.clear()` 会删除所有应用设置，包括主题、语言和其他持久化数据。建议改为精确删除：

```ts
localStorage.removeItem("accessToken");
localStorage.removeItem("userInfo");
```

如果使用 Redux Persist，还需要按实际 persist key 清理认证状态，而不是清空整个存储。

## 十五、测试和验证清单

### 1. Axios 层验证

- [ ] baseURL 来自正确的环境变量；
- [ ] 请求超时在预期时间生效；
- [ ] token 存在时自动添加请求头；
- [ ] `withToken: false` 的公共接口不带 token；
- [ ] POST body 和 GET params 位置正确；
- [ ] HTTP 401 会执行登录跳转；
- [ ] 业务 `code !== 200` 会进入错误流程；
- [ ] 网络断开时不会显示错误成功提示；
- [ ] 请求完成后 pendingMap 中没有残留记录；
- [ ] 主动取消的请求不会被当成普通错误提示。

### 2. React Query 层验证

- [ ] 页面位于 `QueryClientProvider` 内；
- [ ] queryKey 包含所有影响数据的参数；
- [ ] 分页切换时旧数据保留策略符合预期；
- [ ] 查询失败会进入 `isError`；
- [ ] 查询缓存时间和 staleTime 符合业务需要；
- [ ] 变更操作的 pending 状态可以禁用按钮；
- [ ] mutation 成功后列表缓存得到刷新；
- [ ] 不需要自动请求的查询使用 `enabled: false`；
- [ ] 下载和上传使用正确的响应类型。

### 3. 页面层验证

```bash
pnpm lint
pnpm typecheck
pnpm build
```

手动验证：

1. 登录成功后刷新页面，确认后续请求带 token；
2. 登录失败时分别验证 4xx、5xx、网络错误和业务错误；
3. 用户列表首次加载显示 loading；
4. 分页和筛选条件变化时请求参数正确；
5. 删除、编辑、新增和状态修改后列表数据更新；
6. 上传文件时发送 multipart/form-data；
7. 下载按钮只有点击后才发起请求；
8. 切换路由后旧请求不会导致错误提示污染当前页面；
9. 断网后恢复网络，查询按照 Query 配置重新请求；
10. 清空认证信息后访问受保护接口可以回到登录页。

## 十六、推荐的新增接口标准流程

以后新增任何接口，按以下顺序提交：

1. 在 `api.d.ts` 中定义 Params、Data 和 Response 类型；
2. 在 URL 文件中增加 endpoint 常量；
3. 在 `modules/` 中创建 API 函数；
4. 在 `keys/` 中增加稳定的 queryKey；
5. 在 `hooks/` 中封装 `useQuery` 或 `useMutation`；
6. 在页面中只调用业务 Hook，不直接引用 Axios；
7. 为分页、搜索、筛选参数建立完整 queryKey；
8. 为 mutation 成功后的列表刷新定义 invalidate 或 refetch 策略；
9. 为 loading、error、empty 和 success 状态提供 UI；
10. 确认 token、业务 code、取消请求和重试规则；
11. 运行 lint、typecheck、build；
12. 手动验证成功、失败、超时、断网、取消和刷新场景。

## 十七、结论

该网络请求方案的核心边界是：

```text
Axios 负责传输和拦截
API Module 负责接口定义
React Query Hook 负责缓存和请求状态
页面负责业务交互和反馈
```

新增接口时不要跳过 API Module 直接在页面调用 Axios，也不要把缓存、重试和请求状态手工复制到组件中。只要遵循“类型 → URL → API Module → Query Key → Hook → 页面”的顺序，就可以保持请求代码可定位、可复用、可缓存，并且方便统一处理认证、错误、取消和网络状态。
