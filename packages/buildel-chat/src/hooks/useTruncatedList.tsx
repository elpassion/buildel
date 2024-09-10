import { useEffect, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';

export function useTruncatedList(
  ref: React.MutableRefObject<HTMLUListElement | null>,
  elements?: number,
) {
  const [showAll, setShowAll] = useState(false);
  const { width } = useWindowSize();

  const [hiddenElements, setHiddenElements] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const listElements = getListElements(ref.current);

    const listWidth = ref.current.offsetWidth;

    const elements = hideElementsThatNotFit(listElements, listWidth);

    setHiddenElements(elements.hiddenElements);
  }, [width, showAll, elements]);

  function getListElements(list: HTMLUListElement) {
    return Array.from(list.querySelectorAll('li'));
  }

  function hideElementsThatNotFit(
    elements: HTMLElement[],
    containerWidth: number,
  ) {
    return elements.reduce(
      (acc, el) => {
        const nextTagsWidth = acc.tagsWidth + el.offsetWidth;
        let nextHiddenElements = acc.hiddenElements;

        if (nextTagsWidth + 60 > containerWidth && !showAll) {
          el.style.position = 'absolute';
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          nextHiddenElements++;
        } else {
          el.removeAttribute('style');
        }
        return { tagsWidth: nextTagsWidth, hiddenElements: nextHiddenElements };
      },
      { tagsWidth: 0, hiddenElements: 0 },
    );
  }

  const toggleShowAll = () => {
    setShowAll((prev) => !prev);
  };

  return { hiddenElements, toggleShowAll, showAll };
}
