# Roadmap

## V7.0 工程化重构（本次，已完成）
- 拆分单文件：建立 Vite + React + TypeScript 工程结构（`src/`），现役 `index.html` 保持完整可用。
- 模块化：按 checkin / dashboard / learn(vocab,math,reading,syntax,mistakes) / resources / ai / push 划分，明确职责边界。
- TypeScript：为现役数据结构补齐类型（`AppState` 信封 + 各模块 `*Types`）。
- 基础工程脚本：`dev / build / preview / test / test:watch / lint / typecheck`。
- 文档补齐：README / ARCHITECTURE / ROADMAP / CHANGELOG / CONTRIBUTING / .env.example。
- localStorage migration：统一 storage client + 迁移层（备份/版本/失败回滚/预留 userId）。
- PWA / Push 文档化：安装方式、iOS 限制、SW 注册、Web Push 配置、本地/生产差异。

## V7.1 云同步
- **用户系统**：邮箱/第三方登录，匿名 → 登录的本地数据合并。
- **数据库选型**：Supabase（Postgres + Auth + Realtime，推荐）/ Firebase / Neon。
- **表结构设计（草案）**：
  - `users(id, email, created_at)`
  - `app_state(user_id, version, updated_at, payload jsonb)`（整包优先，快速落地）
  - 或拆表：`checkin_log`、`mistakes`、`vocab_progress`、`reading_progress`、`ai_chats`（细粒度同步）
- **打卡同步** / **错题同步** / **单词同步** / **阅读同步** / **AI 对话同步**。
- **离线优先同步策略**：local-first 写本地 → 后台推远端 → 拉取按 `updatedAt` 合并（LWW 起步，关键集合做并集合并）。
- **多设备恢复**：登录即拉取 `app_state` 重建本地。
- **数据导出 / 导入兼容**：保留现役导出格式，迁移层做 schema 双向映射。

## V7.2 内容库扩充
- 考研词库扩充、数学题库扩充、阅读文章扩充、长难句扩充。
- 396 / 434 模块扩展（专业课方向）。
- 内容继续以静态 JSON 放在 `data/` 下，与组件逻辑分离。

## V7.3 AI 学习调度
- AI 读取学习状态（log / weakness / daily）。
- AI 生成今日任务、识别薄弱点、生成复习计划、生成同类题。
- 把 `ai` 模块从「聊天框」升级为学习调度引擎（提示词与接口已在 V7.0 抽离）。

## V7.4 产品体验升级
- 移动端体验优化、多邻国式提醒、游戏化学习路径、成就系统、学习报告。
- React 版逐步接管现役 `index.html` 的页面（迁移收尾）。
