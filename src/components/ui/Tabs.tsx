export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

/** 标签切换条。 */
export function Tabs({ items, active, onChange }: TabsProps) {
  return (
    <nav className="ky-tabs" role="tablist">
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          aria-selected={active === it.id}
          className={`ky-tabs__tab ${active === it.id ? 'is-active' : ''}`}
          onClick={() => onChange(it.id)}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}
