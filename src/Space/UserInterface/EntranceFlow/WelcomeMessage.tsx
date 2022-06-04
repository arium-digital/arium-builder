import { FC } from "react";
import parse from "html-react-parser";
import { SpaceMeta } from "spaceTypes";
import { useConfigOrDefault } from "hooks/spaceHooks";
import { getDefaultWelcomeHTML } from "defaultConfigs";
import styles from "../styles/welcomeScreen.module.scss";
import clsx from "clsx";

const WelcomMessage: FC<{ welcomeHTML?: string }> = ({ welcomeHTML }) => {
  welcomeHTML = useConfigOrDefault<string>(welcomeHTML, getDefaultWelcomeHTML);
  return <>{parse(welcomeHTML)}</>;
};

const WelcomMessageWrapper: FC<{
  spaceSlug: string;
  spaceMetadata: SpaceMeta | undefined;
}> = ({ spaceSlug, spaceMetadata }) => {
  return (
    <>
      <div className={clsx(styles.welcomeScreenContainers, "p-2 p-md-4")}>
        <div className={clsx(styles.welcomeScreenContent, "my-md-4")}>
          <h1 className="eventTitle">
            Welcome to {spaceMetadata?.name || spaceSlug} in Arium
          </h1>
          <div
            className={clsx(
              styles.welcomeMessageContainer,
              "d-none d-md-block"
            )}
          >
            <WelcomMessage welcomeHTML={spaceMetadata?.welcomeHTML} />
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomMessageWrapper;
