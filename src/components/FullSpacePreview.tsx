import {
  AuthenticatedAuthState,
  useAuthentication,
} from "hooks/auth/useAuthentication";
import { AnimatedAriumLogo } from "./AnimatedAriumLogo";
import Space from "./Space";
import dynamic from "next/dynamic";
import { useShouldWeb3BeEnabled } from "web3/contexts";
import { useBehaviorSubjectAndSetterFromCurrentValue } from "hooks/useObservable";
import { defaultPlayerLocation } from "hooks/useUpdateRemotePlayerPosition";
import { PlayerLocation } from "types";

const SpaceWithWeb3 = dynamic(() => import("./SpaceRoute/SpaceWithWeb3"));

const FullSpacePreview = ({ spaceId }: { spaceId: string }) => {
  const authState = useAuthentication({ ensureSignedInAnonymously: true });

  const shouldWeb3BeEnabled = useShouldWeb3BeEnabled({ spaceId });

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
