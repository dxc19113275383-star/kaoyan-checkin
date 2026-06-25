import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: unknown;
}

/** 极简异步加载 hook：deps 变化时重新执行 loader。 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: undefined });
  useEffect(() => {
    let alive = true;
    setState({ data: undefined, loading: true, error: undefined });
    loader()
      .then((data) => alive && setState({ data, loading: false, error: undefined }))
      .catch((error) => alive && setState({ data: undefined, loading: false, error }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}
