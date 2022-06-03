import { defaultTheme } from "defaultConfigs/theme";
import { useState, useCallback, useMemo } from "react";
import { themeDocument } from "shared/documentPaths";
import { Theme } from "spaceTypes/theme";
import useDocument from "./useDocument";
import { useMousetrap } from "./useMousetrap";

const playAllOverride = (): Theme => ({
  video: {
    playSettings: {
      maxDistance: 1000,
      // playPlaneExtension: 1000,
    },
  },
  nftPlacard: {
    detailsVisibleDistance: 300,
    titleVisibleDistance: 300,
  },
});

const useTheme = ({
  documentationMode,
  spaceId,
}: {
  documentationMode: boolean | undefined;
  spaceId: string;
}) => {
  const [playAll, setPlayAll] = useState(false);

  const togglePlayAll = useCallback(() => {
    setPlayAll((existing) => !existing);
  }, []);

  const themeOverride = useMemo(() => {
    if (!playAll || !documentationMode) return null;

    return playAllOverride();
  }, [playAll, documentationMode]);

  useMousetrap("\\", togglePlayAll);

  const themeDocumentRef = useMemo(() => themeDocument(spaceId), [spaceId]);

  const theme$ = useDocument<Theme>({
    path: themeDocumentRef.path,
    override: themeOverride,
    defaultValue: defaultTheme,
  });

  return theme$;
};
export default useTheme;
