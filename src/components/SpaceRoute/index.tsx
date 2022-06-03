import React, { useEffect, useState } from "react";
import { useSpaceQueryParams } from "components/SpaceRoute/useSpaceQueryParams";
// import Space from "../Space";
import UserInterface from "../UserInterface";
import globalStyles from "css/globalStyles";
import SpacePasswordForm from "./SpacePasswordForm";
import { SpaceMeta } from "../../../shared/spaceMeta";
import SpaceLayout from "./SpaceLayout";
import {
  AuthenticatedAuthState,
  useAuthentication,
} from "hooks/auth/useAuthentication";
import { AnimatedAriumLogo } from "components/AnimatedAriumLogo";
import { FourOFourCSR } from "components/404";
import { useShortcutToggledBoolean } from "hooks/useMousetrap";
import {
  EditorContext,
  useInitEditorState,
} from "components/InSpaceEditor/hooks/useEditorState";
import { SpaceAccessContext, useSpaceAccess } from "hooks/auth/useSpaceAccess";
import Space from "../Space";
import { useInitAnalyticsAndIdentify } from "analytics/init";
import { useShouldWeb3BeEnabled } from "web3/contexts";
import dynamic from "next/dynamic";
import { spaceIdForSlug } from "hooks/useSpaceIdForSlug";
import { useBehaviorSubjectAndSetterFromCurrentValue } from "hooks/useObservable";
import { PartialRootState, PlayerLocation, ThreeContextType } from "types";
import { defaultPlayerLocation } from "hooks/useUpdateRemotePlayerPosition";
import ThreeContext from "components/ThreeContext";

const SpaceWithWeb3 = dynamic(() => import("./SpaceWithWeb3"));

type BaseSpaceRouteProps = {
  spaceId: string;
  requirePassword?: boolean;
  spaceSlug: string;
  spaceMetadata: SpaceMeta;
};

const SpaceRoute = ({
  spaceId,
  spaceSlug,
  requirePassword,
  spaceMetadata,
}: BaseSpaceRouteProps) => {
  const queryParams = useSpaceQueryParams();

  const authState = useAuthentication({ ensureSignedInAnonymously: true });

  const spaceAccess = useSpaceAccess({
    ...authState,
    spaceId,
  });

  const [three, setThree] = useState<PartialRootState | null>(null);

  const threeContext: ThreeContextType = {
    setThree: setThree,
    three: three,
  };

  useInitAnalyticsAndIdentify(authState);
  const [passwordValidated, setPasswordValidated] = useState(false);

  const promptPassword = requirePassword && !passwordValidated;

  const [hideUI] = useShortcutToggledBoolean("h", false);

  const [validSpaceSlug, setValidSpaceSlug] = useState(true);
  const [spaceIdToUse, setSpaceIdToUse] = useState<string | undefined>();
  const spaceExist: boolean = !spaceMetadata.doesNotExist || !validSpaceSlug;

  useEffect(() => {
    const slugFromQuery = queryParams.targetSlug;
    if (!slugFromQuery) {
      setSpaceIdToUse(spaceId);
    } else {
      if (!authState.authenticated) return;
      (async () => {
        const { exists, id } = await spaceIdForSlug(slugFromQuery);
        if (exists) {
          setValidSpaceSlug(true);
          setSpaceIdToUse(id);
        } else {
          setValidSpaceSlug(false);
          setSpaceIdToUse(undefined);
        }
      })();
    }
  }, [spaceId, queryParams.targetSlug, authState.authenticated]);

  const canEdit = !!spaceAccess?.canEdit;

  const editorState = useInitEditorState(spaceIdToUse, canEdit);

  const shouldWeb3BeEnabled = useShouldWeb3BeEnabled({ spaceId });

  const [
    playerLocation$,
    updatePlayerLocation,
  ] = useBehaviorSubjectAndSetterFromCurrentValue<PlayerLocation>(
    defaultPlayerLocation
  );

  // console.log(authState.authenticated, authState.userId);
  if (!spaceExist) return <FourOFourCSR type="space" id={spaceId} />;
  const authenticatedAuthState = authState as AuthenticatedAuthState;
  if (!spaceIdToUse || !authState.authenticated)
    return <AnimatedAriumLogo hint="Loading space..." />;

  const currentSpaceSlug = queryParams.targetSlug || spaceSlug;

  const SpaceComponent = shouldWeb3BeEnabled ? SpaceWithWeb3 : Space;

  return (
    <>
      <style jsx global>
        {globalStyles}
      </style>
      <ThreeContext.Provider value={threeContext}>
        <SpaceAccessContext.Provider value={spaceAccess}>
          <EditorContext.Provider value={editorState}>
            <SpaceLayout
              spaceId={spaceIdToUse}
              spaceSlug={currentSpaceSlug}
              showHeader={!queryParams.documentation}
              authState={authenticatedAuthState}
              editorState={editorState}
              hideUI={hideUI}
              playerLocation$={playerLocation$}
            >
              <>
                {promptPassword && (
                  <SpacePasswordForm
                    spaceId={spaceIdToUse}
                    setPasswordValidated={setPasswordValidated}
                  />
                )}
                {spaceExist && !promptPassword && (
                  <SpaceComponent
                    authState={authenticatedAuthState}
                    spaceSlugFromPath={spaceSlug}
                    spaceId={spaceIdToUse}
                    {...queryParams}
                    UserInterface={UserInterface}
                    //@ts-ignore
                    pushState={undefined}
                    autoInitialize={requirePassword && passwordValidated}
                    spaceMetadata={spaceMetadata}
                    hideUI={hideUI}
                    canEdit={canEdit}
                    spaceSlug={currentSpaceSlug}
                    playerLocation$={playerLocation$}
                    updatePlayerLocation={updatePlayerLocation}
                  />
                )}
              </>
            </SpaceLayout>
          </EditorContext.Provider>
        </SpaceAccessContext.Provider>
      </ThreeContext.Provider>
    </>
  );
};

export default SpaceRoute;
