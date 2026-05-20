import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { DEFAULT_MUTATION_CONFIG, DEFAULT_QUERY_CONFIG } from './config'

/**
 * 全局 QueryClient 配置对象
 *
 * 说明：
 *  - 使用 @tanstack/react-query 提供的 QueryClient、QueryCache、MutationCache
 *  - 在此处集中配置默认的查询/变更行为（例如缓存、重试、过期时间等），
 *    以及统一的错误处理钩子，方便在应用中统一拦截并处理网络或逻辑错误。
 */
export const queryClient = new QueryClient({
  // defaultOptions 用于设置 queries 与 mutations 的默认行为
  defaultOptions: {
    // queries: 默认的查询配置，从 config 文件中导入，包含例如 retry、staleTime、cacheTime 等字段
    queries: DEFAULT_QUERY_CONFIG,
    // mutations: 默认的变更（mutation）配置，从 config 文件中导入，包含例如 onSuccess、onError、retry 等字段
    mutations: DEFAULT_MUTATION_CONFIG,
  },

  // QueryCache：管理所有查询相关的缓存与生命周期回调
  queryCache: new QueryCache({
    /**
     * onError 钩子
     * @param error - 当任一 query 遇到未捕获错误时触发，error 类型为 unknown
     *
     * 建议做法：
     *  - 在生产环境中，可以将错误上报到监控平台（例如 Sentry、腾讯云监控等）
     *  - 在开发环境中，打印调试信息以便定位问题
     *  - 可根据 error 内容分派全局提示（toast、modal）或针对性处理
     */
    onError: (error: unknown) => {
      // 开发环境下打印完整错误，便于调试；生产环境请避免直接 console.error
      if (import.meta.env.DEV) {
        console.error('查询错误:', error)
      }
      // TODO: 可在此处添加统一上报逻辑，例如 sendToMonitoring(error)
    },
  }),

  // MutationCache：管理所有变更（mutation）相关的缓存与生命周期回调
  mutationCache: new MutationCache({
    /**
     * onError 钩子
     * @param error - 当任一 mutation 遇到未捕获错误时触发，error 类型为 unknown
     *
     * 建议做法：
     *  - 将错误进行归类（网络错误 / 业务错误 / 权限错误），并根据类型采取不同的处理策略
     *  - 在开发环境打印错误，生产环境上报并展示友好提示
     */
    onError: (error: unknown) => {
      // 开发环境下打印完整错误，便于调试；生产环境请避免直接 console.error
      if (import.meta.env.DEV) {
        console.error('变更错误:', error)
      }
      // TODO: 在此处添加统一的错误上报或用户通知逻辑
    },
  }),
})
