import { useCallback, useEffect, useState } from "react";

type LoadingState = {
  numberLoaded?: number;
  loadedElements: Set<string>;
};

export const useElementsLoadedProgress = () => {
  const [elementsLoadedProgress, setElementLoadedProgress] = useState<number>(
    0
  );

  const fullyLoaded = (elementsLoadedProgress || 0) >= 1;

  return {
    fullyLoaded,
    elementsLoadedProgress,
    setElementLoadedProgress,
  };
};

const debug = false;

const useLoadedState = ({
  totalInitialElements,
  initialElements,
  handleProgressChanged,
  spaceId,
}: {
  totalInitialElements: number | undefined;
  initialElements: Set<string> | undefined;
  handleProgressChanged?: (progress: number) => void;
  spaceId: string;
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loadedElements: new Set<string>(),
    numberLoaded: 0,
  });

  useEffect(() => {
    // with new space id, reset loading state
    setLoadingState({
      loadedElements: new Set<string>(),
      numberLoaded: 0,
    });
  }, [spaceId]);

  const handleLoaded = useCallback((elementId: string) => {
    setLoadingState((existing) => {
      const loadedElements = new Set(Array.from(existing.loadedElements));

      loadedElements.add(elementId);

      return {
        ...existing,
        numberLoaded: loadedElements.size,
        loadedElements,
      };
    });
  }, []);

  useEffect(() => {
    if (!initialElements || !debug) return;

    const loadedElements = Array.from(loadingState.loadedElements.values());

    const initialArray = Array.from(initialElements.values());

    const diff = initialArray.filter((v) => !loadedElements.includes(v));

    console.log(diff);
  }, [loadingState.loadedElements, initialElements]);

  const { numberLoaded } = loadingState;

  useEffect(() => {
    if (typeof totalInitialElements === "undefined" || !handleProgressChanged)
      return;

    const percentLoaded =
      totalInitialElements === 0
        ? 1
        : (numberLoaded || 0) / totalInitialElements;

    handleProgressChanged(percentLoaded);
  }, [numberLoaded, totalInitialElements, handleProgressChanged]);

  return {
    handleLoaded,
    ...loadingState,
  };
};

export default useLoadedState;
