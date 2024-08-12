import { useEffect, useRef } from 'react';
import type { CategoricalChartState } from 'recharts/types/chart/types';

export const useHighlightedRows = (data: { id: string | number }[]) => {
  const elementsRef = useRef<HTMLTableRowElement[] | null>(null);

  const clearHighlightedRows = () => {
    elementsRef.current?.forEach((element) => {
      element.style.backgroundColor = 'transparent';
    });
  };

  const onMouseMove = (state: CategoricalChartState) => {
    if (
      state.activePayload?.[0].payload.id === undefined ||
      !elementsRef.current
    ) {
      return;
    }

    clearHighlightedRows();

    const currentElement = elementsRef.current?.find(
      (element) =>
        element.dataset.rowKey ===
        state.activePayload![0].payload.id.toString(),
    );

    if (!currentElement) return;

    currentElement.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
  };

  const onMouseLeave = () => {
    clearHighlightedRows();
  };

  useEffect(() => {
    elementsRef.current = data.map((item) => {
      return document.querySelector(`[data-row-key="${item.id}"]`);
    }) as HTMLTableRowElement[];
  }, [data]);

  return { onMouseMove, onMouseLeave };
};
