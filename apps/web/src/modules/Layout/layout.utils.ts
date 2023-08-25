import { useLocalStorage } from 'usehooks-ts';

type TLayoutStorageKey = 'isSidebarOpen' | 'isSidebarCollapsed';

interface LayoutStorageData {
  isSidebarOpen?: boolean;
  isSidebarCollapsed?: boolean;
}

export const useLayoutStorage = <T>(
  storageKey: TLayoutStorageKey,
  initialValue: T | undefined = undefined,
) => {
  const [value, setValue] = useLocalStorage(storageKey, initialValue);
  return { value, setValue };
};

export const useSidebarCollapsedStorage = () =>
  useLayoutStorage<boolean>('isSidebarCollapsed');
