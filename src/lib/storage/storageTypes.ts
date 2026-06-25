/**
 * storageTypes —— V7.0 新版 AppState 信封类型。
 *
 * 这是「目标」数据结构：把现役 `kaoyan_v2` 单体状态按模块切分聚合，
 * 并加入 `userId`（为 V7.1 云同步预留）与 `updatedAt`（冲突合并 / 多设备同步用）。
 *
 * 重要：V7.0 不替换现役应用的运行时状态。index.html 仍读写 `kaoyan_v2`。
 * AppState 信封单独存在新键 `ky_app_state_v7`，由 migration 层从旧数据派生，
 * 供未来 React 版与云同步消费。两者互不干扰（见 ARCHITECTURE.md「数据流」）。
 */
import type { CheckinState } from '@/modules/checkin/checkinTypes';
import type { DashboardState } from '@/modules/dashboard/dashboardTypes';
import type { VocabState } from '@/modules/learn/vocab/vocabTypes';
import type { MathState } from '@/modules/learn/math/mathTypes';
import type { ReadingState } from '@/modules/learn/reading/readingTypes';
import type { SyntaxState } from '@/modules/learn/syntax/syntaxTypes';
import type { MistakesState } from '@/modules/learn/mistakes/mistakesTypes';
import type { AiState } from '@/modules/ai/aiTypes';
import type { PushState } from '@/modules/push/pushTypes';
import type { ResourcesState } from '@/modules/resources/resourceTypes';

/** 新版 schema 语义化版本号。 */
export const SCHEMA_VERSION = '7.0.0';

export interface AppState {
  /** 语义化 schema 版本（区别于现役数值 version=8）。 */
  version: string;
  /** 用户标识 —— V7.0 恒为空 / undefined；V7.1 云同步后写入。 */
  userId?: string;
  checkin: CheckinState;
  dashboard: DashboardState;
  vocab: VocabState;
  math: MathState;
  reading: ReadingState;
  syntax: SyntaxState;
  mistakes: MistakesState;
  ai: AiState;
  push: PushState;
  resources: ResourcesState;
  /** 最后更新时间 ISO，供同步冲突比较。 */
  updatedAt: string;
}
