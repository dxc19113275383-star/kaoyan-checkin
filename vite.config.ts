/// <reference types="node" />
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { cpSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 静态资源插件（零依赖）。
 *
 * 仓库根目录是「零构建静态站点」的真相来源：index.html / data/ / manifest.json / sw.js /
 * icon.svg 都直接放在根，无需构建即可部署（GitHub Pages、Netlify 拖拽、任意静态托管）。
 *
 * 本插件让 `npm run build`（React 工程外壳）也能产出完整 dist：
 *  - 构建期（closeBundle）：把根 `data/` 与 PWA 静态文件拷进 `dist/`，URL 不变。
 *  - 开发期（configureServer）：Vite 默认不服务非 public 的根目录文件，这里加中间件把
 *    `/data/*` 映射到根 `data/`，使 `npm run dev` 下也能 fetch 到内容。
 */
function staticAssets(): Plugin {
  const dataRoot = resolve(__dirname, 'data');
  const rootFiles = ['manifest.json', 'sw.js', 'icon.svg'];
  return {
    name: 'kaoyan-static-assets',
    closeBundle() {
      if (existsSync(dataRoot)) {
        cpSync(dataRoot, resolve(__dirname, 'dist/data'), { recursive: true });
      }
      for (const f of rootFiles) {
        const from = resolve(__dirname, f);
        if (existsSync(from)) cpSync(from, resolve(__dirname, 'dist', f));
      }
      // eslint-disable-next-line no-console
      console.log('[kaoyan-static-assets] data/ + PWA files -> dist/');
    },
    configureServer(server) {
      const types: Record<string, string> = {
        '.json': 'application/json; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.svg': 'image/svg+xml',
      };
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const path = decodeURIComponent(req.url.split('?')[0]);
        // 根 PWA 静态文件
        if (rootFiles.includes(path.replace(/^\//, ''))) {
          const fp = resolve(__dirname, path.replace(/^\//, ''));
          if (existsSync(fp)) {
            const ext = path.slice(path.lastIndexOf('.'));
            res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
            res.end(readFileSync(fp));
            return;
          }
        }
        // data/ 内容库
        if (path.startsWith('/data/')) {
          const fp = resolve(__dirname, '.' + path);
          if (fp.startsWith(dataRoot) && existsSync(fp)) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(readFileSync(fp));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), staticAssets()],
  // PWA 静态文件放在仓库根（零构建部署用），不再用 public/；构建时由插件拷贝。
  publicDir: false,
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
