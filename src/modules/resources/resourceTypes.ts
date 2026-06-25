/**
 * resources 模块类型 —— 资料 / 网课入口。
 * 对应现役 `state.resources` 与 `state.studySessions`。
 */

export interface ResourceItem {
  id: string;
  title: string;
  /** 类型：资料 / 网课 / 链接等。 */
  type?: string;
  url?: string;
  note?: string;
  createdAt?: string;
}

export interface StudySession {
  id: string;
  date: string;
  durMin?: number;
  subject?: string;
  note?: string;
}

export interface ResourcesState {
  resources: ResourceItem[];
  studySessions: StudySession[];
}

export const defaultResourcesState = (): ResourcesState => ({
  resources: [],
  studySessions: [],
});
