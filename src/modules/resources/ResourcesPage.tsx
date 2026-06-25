import { useState } from 'react';
import { ModuleScaffold } from '@/app/ModuleScaffold';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getResources, addResource, removeResource } from './resourcesStore';

export function ResourcesPage() {
  const [, force] = useState(0);
  const refresh = () => force((x) => x + 1);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('网课');

  const list = getResources().resources;

  const add = () => {
    const t = title.trim();
    if (!t) return;
    addResource({ title: t, url: url.trim() || undefined, type });
    setTitle('');
    setUrl('');
    refresh();
  };

  const del = (id: string) => {
    removeResource(id);
    refresh();
  };

  return (
    <ModuleScaffold
      title="资料 / 网课"
      legacyHash="#resources"
      responsibilities={['资料 / 网课入口的增删与管理（统一走 kaoyan_v2）']}
    >
      <Card title="新增资料">
        <div className="ky-form">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题（必填）" className="ky-field" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="链接（可选）" className="ky-field" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="ky-field ky-field--sm">
            <option>网课</option>
            <option>资料</option>
            <option>真题</option>
            <option>其它</option>
          </select>
          <Button onClick={add} disabled={!title.trim()}>添加</Button>
        </div>
      </Card>

      {list.length === 0 ? (
        <Card>还没有资料。在上面添加你的网课/资料链接。</Card>
      ) : (
        <ul className="ky-res__list">
          {list.map((r) => (
            <li key={r.id} className="ky-res__item">
              <div className="ky-res__main">
                {r.type && <span className="ky-tag">{r.type}</span>}
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
                ) : (
                  <span>{r.title}</span>
                )}
              </div>
              <button className="ky-link" onClick={() => del(r.id)}>删除</button>
            </li>
          ))}
        </ul>
      )}
    </ModuleScaffold>
  );
}
