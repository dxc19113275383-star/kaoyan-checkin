/**
 * storageKeys —— localStorage 键的唯一真相来源（single source of truth）。
 *
 * 规则（见 CONTRIBUTING.md）：任何模块都不得在代码里散落硬编码 localStorage 的键名，
 * 一律从这里引用。这样未来要重命名键、加前缀、做云同步映射时只需改一处。
 *
 * 现役单文件应用（index.html）历史上使用的真实键：
 *  - `kaoyan_v2`               主状态（打卡 / 任务 / learn 脊柱 / 提醒 / 推送设置），数值 version=8
 *  - `vocab_lib_<id>`          用户自建/缓存词库（含 `vocab_lib_reading` 阅读生词本）
 *  - `reading_<id>`            用户自建阅读文章
 *  - `math_set_<id>`           用户自建数学题集
 *  - `kaoyan_notify_hint_shown` 通知引导一次性标记
 *
 * V7.0 新增：
 *  - `ky_app_state_v7`         新版 AppState 信封（含 userId/updatedAt，为 V7.1 云同步预留）
 *  - `ky_backup_<ts>`          迁移前的旧数据快照（迁移失败不删原数据）
 *  - `ky_schema_version`       新版 schema 版本号
 */

/** 现役单文件应用的主状态键（数值版本链 v1→v8 仍由 index.html 内的 migrate 维护）。 */
export const LEGACY_STATE_KEY = 'kaoyan_v2';

/** 旧版一次性引导标记。 */
export const LEGACY_NOTIFY_HINT_KEY = 'kaoyan_notify_hint_shown';

/** V7.0 新版 AppState 信封键。 */
export const APP_STATE_KEY = 'ky_app_state_v7';

/** 新版 schema 版本号键。 */
export const SCHEMA_VERSION_KEY = 'ky_schema_version';

/** 迁移备份键前缀，完整键形如 `ky_backup_1719300000000`。 */
export const BACKUP_KEY_PREFIX = 'ky_backup_';

/** 动态键前缀（用于导出/导入时遍历筛选）。 */
export const VOCAB_LIB_PREFIX = 'vocab_lib_';
export const READING_PREFIX = 'reading_';
export const MATH_SET_PREFIX = 'math_set_';

/** 动态键构造器：用户词库 `vocab_lib_<id>`。 */
export const vocabLibKey = (id: string): string => `${VOCAB_LIB_PREFIX}${id}`;

/** 动态键构造器：用户阅读文章 `reading_<id>`。 */
export const readingKey = (id: string): string => `${READING_PREFIX}${id}`;

/** 动态键构造器：用户数学题集 `math_set_<id>`。 */
export const mathSetKey = (id: string): string => `${MATH_SET_PREFIX}${id}`;

/** 阅读生词本固定库 id。 */
export const READING_VOCAB_LIB_ID = 'reading';

/** 备份键构造器。 */
export const backupKey = (ts: number): string => `${BACKUP_KEY_PREFIX}${ts}`;

/** 所有「静态命名」键的集合，便于调试 / 导出 / 清理时遍历。 */
export const STATIC_KEYS = {
  LEGACY_STATE_KEY,
  LEGACY_NOTIFY_HINT_KEY,
  APP_STATE_KEY,
  SCHEMA_VERSION_KEY,
} as const;
