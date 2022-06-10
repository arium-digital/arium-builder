import {
  AuthenticatedAuthState,
  useAuthentication,
} from "hooks/auth/useAuthentication";
import { AnimatedAriumLogo } from "../AnimatedAriumLogo";
import Space from "../SpaceContainer";
import dynamic from "next/dynamic";
import { useBehaviorSubjectAndSetterFromCurrentValue } from "hooks/useObservable";
import { defaultPlayerLocation } from "hooks/useUpdateRemotePlayerPosition";
import { PlayerLocation } from "types";

const SpaceWithWeb3 = dynamic(() => import("../SpaceContainerWithWeb3"));

const FullSpacePreview = ({ spaceId }: { spaceId: string }) => {
  const authState = useAuthentication({ ensureSignedInAnonymously: true });

  const shouldWeb3BeEnabled = true;

  const [
    playerLocation$,
    updatePlayerLocation,
  ] = useBehaviorSubjectAndSetterFromCurrentValue<PlayerLocation>(
    defaultPlayerLocation
  );

  if (!authState.authenticated || !authState.userId || !authState.user)
    return <AnimatedAriumLogo hint="Authenticating..." />;

  const SpaceComponent = shouldWeb3BeEnabled ? SpaceWithWeb3 : Space;

  return (
    <SpaceComponent
      authState={authState as AuthenticatedAuthState}
      spaceSlugFromPath={""}
      spaceId={spaceId}
      invisible
      muted
      autoInitialize
      autoEnter
      UserInterface={undefined}
      fullScreen={false}
      spaceSlug="demo"
      disableChat
      // this is needed for capturing screenshots
      playerLocation$={playerLocation$}
      updatePlayerLocation={updatePlayerLocation}
    />
  );
};

export default FullSpacePreview;
