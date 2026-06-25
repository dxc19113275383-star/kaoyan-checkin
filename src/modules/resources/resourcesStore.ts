/**
 * resourcesStore —— 资料/网课条目读写。统一走 kaoyan_v2（state.resources）。
 */
import { readSlice, writeSlice } from '@/lib/storage/appStateStore';
import type { ResourcesState, ResourceItem } from './resourceTypes';

export const getResources = (): ResourcesState => readSlice('resources');
export const setResources = (next: ResourcesState): void => writeSlice('resources', next);

/** 新增一条资料，返回新建的条目。 */
export function addResource(input: Omit<ResourceItem, 'id' | 'createdAt'>): ResourceItem {
  const state = getResources();
  const item: ResourceItem = {
    id: `res_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
  state.resources = [item, ...state.resources];
  setResources(state);
  return item;
}

/** 删除一条资料。 */
export function removeResource(id: string): void {
  const state = getResources();
  state.resources = state.resources.filter((r) => r.id !== id);
  setResources(state);
}
