import { useCallback, useState } from 'react';

export function useModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const changeOpen = (value: boolean) => {
    setIsModalOpen(value);
  };

  return {
    isModalOpen,
    openModal,
    closeModal,
    changeOpen,
  };
}
