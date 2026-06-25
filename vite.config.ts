/// <reference types="node" />
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { cpSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * data/ 内容库插件（零依赖）：
 *  - 构建期（closeBundle）：把仓库根 `data/` 原样拷进 `dist/data/`，保持运行期
 *    `fetch('data/...')` 的 URL 不变（V7.0 验收标准 7：data 内容仍放仓库根 data/）。
 *  - 开发期（configureServer）：Vite 默认不服务非 public 的根目录文件，这里加一个中间件
 *    把 `/data/*` 映射到根 `data/`，使 `npm run dev` 下 React 页面也能 fetch 到内容。
 */
function dataDir(): Plugin {
  const dataRoot = resolve(__dirname, 'data');
  return {
    name: 'kaoyan-data-dir',
    closeBundle() {
      if (existsSync(dataRoot)) {
        cpSync(dataRoot, resolve(__dirname, 'dist/data'), { recursive: true });
        // eslint-disable-next-line no-console
        console.log('[kaoyan-data-dir] data/ -> dist/data/');
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/data/')) return next();
        const rel = decodeURIComponent(req.url.split('?')[0]);
        const fp = resolve(__dirname, '.' + rel);
        if (!fp.startsWith(dataRoot) || !existsSync(fp)) return next();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(readFileSync(fp));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), dataDir()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    // 多入口：保留现役单文件应用 index.html（生产入口），
    // 同时构建 preview.html（V7.0 React 工程外壳，用于验证 Vite/React/TS 工具链）。
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        preview: resolve(__dirname, 'preview.html'),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
