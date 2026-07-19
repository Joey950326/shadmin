# SHAdmin API 的 Apifox 导入与部署

## 文件说明

- `openapi.json`：OpenAPI 3.0.3 定义，包含 `auth.ts` 中全部 11 个接口。
- 接口路径不包含 `/api`；本地服务地址已配置为 `http://localhost:5173/api`。Vite 会把 `/api` 请求代理到 `.env.development` 的 `VITE_PROXY`，并移除 `/api` 前缀。
- 请求与响应结构来自 `modules/`、`hooks/`、类型声明和页面消费逻辑。示例用户、Token、URL 和部门数据仅用于 Apifox 调试与 Mock。

## 导入 Apifox

1. 登录 [Apifox](https://app.apifox.com/)，新建或进入目标项目。
2. 打开项目设置中的“导入数据”，选择“手动导入”。
3. 选择 OpenAPI/Swagger，上传本目录的 `openapi.json`。
4. 预览 11 个接口及数据模型；可开启“自动生成接口用例”和“导入 Servers 为环境”，然后确认导入。
5. 再次导入更新后的文件时，建议按 `operationId` 智能合并，避免产生重复接口。

详细选项参见 Apifox 官方的 [导入 OpenAPI/Swagger](https://docs.apifox.com/import-openapi-swagger) 与 [手动导入](https://docs.apifox.com/manual-import) 文档。

## 配置运行环境

在“环境管理”中至少建立以下环境，并为每个环境设置“前置 URL”：

| 环境        | 前置 URL                    | 用途               |
| ----------- | --------------------------- | ------------------ |
| Local       | `http://localhost:5173/api` | 经过 Vite 本地代理 |
| Development | 后端开发环境实际地址        | 联调               |
| Production  | 后端生产环境实际地址        | 仅经授权后使用     |

前置 URL 不要以 `/` 结尾，接口路径则保留开头的 `/`。具体规则参见官方 [环境管理](https://docs.apifox.com/environments-and-services) 文档。

除 `/login` 外的接口都需要请求头：

```text
x-access-token: Bearer <access_token>
```

先调用登录接口，把 `data.access_token` 保存为环境变量（例如 `accessToken`），再在鉴权配置中填写 `Bearer {{accessToken}}`。项目的 Axios 请求携带 Cookie，因此服务端依赖 Cookie 时还需确认 Apifox 已保留登录响应中的 Cookie。

## Mock 与发布文档

导入后，Apifox 可根据响应 Schema 和示例生成 Mock。选择 Local 环境验证真实接口；选择 Apifox 提供的 Mock 环境验证页面数据结构。确认接口名称、示例和鉴权信息后，在项目的“分享文档/发布文档”入口创建在线文档，限制访问范围后复制分享地址。官方 [快速入门](https://apifox.com/help/overview/start) 包含文件导入、URL 导入和生成在线文档的入口说明。

`POST /user/list` 内置 `page1`、`page2`、`fullDataset` 和 `emptyPage` 响应示例，其中 `fullDataset` 明确包含 100 条用户数据。OpenAPI 响应示例是静态内容，单独导入它不会根据请求的 `pageSize` 自动切片。

要启用动态分页，在 Apifox 中打开 `POST /user/list`，进入“Mock”标签，开启“Mock 脚本”，将 `user-list.mock.js` 的完整内容粘贴进去并保存。脚本通过 `$$.mockRequest.getParam('page')` 和 `$$.mockRequest.getParam('pageSize')` 读取 JSON 请求体参数，并从 100 条数据中截取当前页。例如：

- `{ "page": 1, "pageSize": 50 }` 返回第 1–50 条；
- `{ "page": 2, "pageSize": 50 }` 返回第 51–100 条；
- `{ "page": 3, "pageSize": 50 }` 返回空数组，同时保持 `total: 100`。

脚本会把无效的 `page` 和 `pageSize` 分别回退为 `1` 和 `10`，并将单页最大数量限制为总数据量 100。该用法依据 Apifox 官方 [Mock 脚本](https://docs.apifox.com/mock-scripts) 中的分页机制。

`GET /user/department` 按当前前端契约返回完整递归树，没有 `page` 或 `pageSize` 请求参数，因此不增加分页字段；示例已扩充为总部、华东和华南三棵树及其下属部门。

建议发布前依次验证：登录、用户列表、头像上传、部门树，以及删除/编辑/新增/状态修改。删除和状态修改会改变真实数据，不要在 Production 环境使用示例 ID。

## 代码约束与已知差异

- 成功条件是响应体 `code === 200`；`code === 401` 或 HTTP 401 会清空本地状态并跳转登录页。
- 登录密码在提交前经过 MD5，Apifox 示例也使用 32 位 MD5 字符串。
- 用户列表必须返回 `data.list` 和 `data.total`；登录必须返回 `data.access_token`；头像上传必须返回 `data.fileUrl`；部门必须返回递归的 `data[]` 节点。
- 当前 `useImportUser()` 错误调用头像上传方法。修复为 `userImportApi()` 后，前端才会请求 `/user/import`。
- `DepartmentListApi()` 把请求选项作为 GET 查询参数传入；目前没有选项时不影响请求。
- 导出流程当前把 JSON 序列化后以 `.xlsx` 后缀保存，并非真正的 Excel 二进制文件。若后端返回 Blob，前端请求需增加 `responseType: 'blob'` 并绕开现有业务 JSON 拦截逻辑。
- 请求实例读取 `VITE_API_BASE_URL`，仓库环境文件使用的是 `VITE_API_URL`；当前接口仍通过 `VITE_BASE_URL=/api` 使用相对路径和 Vite 代理。
