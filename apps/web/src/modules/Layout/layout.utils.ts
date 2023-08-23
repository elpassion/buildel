import { useLocalStorage } from '@mantine/hooks';

interface LayoutStorageData {
  isSidebarOpen?: boolean;
  isSidebarCollapsed?: boolean;
}

export const useLayoutStorage = (storageKey: string) => {
  const [value, setValue] = useLocalStorage({
    key: storageKey,
  });

  return { value, setValue };
};
