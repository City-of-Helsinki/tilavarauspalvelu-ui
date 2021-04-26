import { useEffect, useState } from 'react';

export type ApiData<T> = {
  data?: T;
  status: State;
};

type State = 'init' | 'loading' | 'error' | 'done';

export function useApiData<T, P>(
  apiFunction: (params: P) => Promise<T>,
  apiParams?: P
): ApiData<T> {
  const [data, setData] = useState<ApiData<T>>({
    status: 'init',
  });
  useEffect(() => {
    async function fetchData() {
      try {
        if (apiParams) {
          const loadedData = await apiFunction(apiParams);
          setData({ data: loadedData, status: 'done' });
        }
      } catch (e) {
        setData({ data: undefined, status: 'error' });
      }
    }
    if (data.status === 'init' && apiParams) {
      setData({ data: undefined, status: 'loading' });
      fetchData();
    }
  }, [apiFunction, apiParams, data]);

  return { ...data };
}
