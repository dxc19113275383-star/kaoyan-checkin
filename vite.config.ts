/// <reference types="node" />
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 把仓库根目录的 `data/`（静态学习内容库：词库 / 阅读 / 数学 / 长难句 / 作文）
 * 拷贝进构建产物 `dist/data/`。
 *
 * 设计原因：V7.0 要求 data 内容继续放在仓库根 `data/`（验收标准 7），
 * 但 Vite 默认只会把 `public/` 拷进 dist。这里用一个零依赖的内联插件，
 * 在构建结束时把 `data/` 原样复制到 `dist/data/`，保持运行期 `fetch('data/...')` 的 URL 不变。
 */
function copyDataDir(): Plugin {
  return {
    name: 'copy-data-dir',
    apply: 'build',
    closeBundle() {
      const from = resolve(__dirname, 'data');
      const to = resolve(__dirname, 'dist/data');
      if (existsSync(from)) {
        cpSync(from, to, { recursive: true });
        // eslint-disable-next-line no-console
        console.log('[copy-data-dir] data/ -> dist/data/');
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyDataDir()],
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
