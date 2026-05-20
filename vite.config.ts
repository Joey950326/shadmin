import path from 'node:path'
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // 代理配置
      proxy: {
        // 将 /api 代理到 http://localhost:3000
        '/api': {
          target: env.VITE_PROXY || 'http://localhost:3000', // 代理目标地址，优先使用环境变量中的值
          changeOrigin: true, // 是否修改请求头中的 Origin 字段
          rewrite: path => path.replace(/^\/api/, ''), // 重写路径，将 /api 替换为空
          secure: false, // 如果是https接口，需要配置这个参数
        },
      },
    },
  }
})
