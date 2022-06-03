import { Typography } from "@material-ui/core";
import { useTrackOnce } from "analytics/init";
import { LoadingLinear } from "components/Loading";
import { functions } from "db";
import { useAuthentication } from "hooks/auth/useAuthentication";
import React, { useCallback, useEffect, useState } from "react";
import layoutStyles from "website/css/layout.module.scss";
import { Layout2 } from "website/Layout/Layout2";
import { PreviewModal } from "./PreviewModal";
import SelectSpace from "./SelectSpace";
import { SpaceTemplateConfig } from "./types";

import { useInitAnalyticsAndIdentify } from "analytics/init";
import { useRouter } from "next/router";
import {
  OPENED_SPACE_CREATION_PAGE_EVENT,
  trackSelectedSpace,
  trackSpaceCreated,
} from "analytics/acquisition";
import { useSpaceAccess } from "hooks/auth/useSpaceAccess";
import useSpaceCreationStatus from "website/spaceCreation/useSpaceCreationStatus";

const CannotCreateSpaceError = () => {
  return (
    <Typography variant="h4">
      We're sorry, but it look like you've create the maximum number of spaces
      available to your account. If you want to create more spaces, email us at{" "}
      <a href="mailto:info@arium.xyz">info@arium.xyz</a>
    </Typography>
  );
};

const createSpace = async ({ templateId }: { templateId: string }) => {
  const result = await functions().httpsCallable("createSpaceV2")({
    templateId,
  });

  return result.data as {
    spaceId: string;
    slug: string;
  };
};

const SpaceCreation = () => {
  const authState = useAuthentication({
    ensureSignedInAnonymously: false,
  });

  const { isAnonymous, userId, isNewUser } = authState;

  useInitAnalyticsAndIdentify({ userId, isAnonymous, isNewUser });

  const router = useRouter();

  useTrackOnce(OPENED_SPACE_CREATION_PAGE_EVENT);

  const [creating, setCreating] = useState(false);

  const handleCreateSpace = useCallback(
    async (templateId: string | null) => {
      if (!templateId) return;
      setCreating(true);

      try {
        const { spaceId } = await createSpace({
          templateId,
        });

        trackSpaceCreated({
          selectedSpaceTemplate: templateId,
        });

        router.push(`/spaces/${spaceId}/created`);
      } catch (e) {
        console.error(e);
        setCreating(false);
      }
    },
    [router]
  );

  const spaceAccess = useSpaceAccess({
    ...authState,
    spaceId: undefined,
  });

  const createdSpacesStatus = useSpaceCreationStatus({
    userId,
    spaceAccess,
  });

  // console.log(
  //   "can create",
  //   canCreateSpace,
  //   userAccount?.maxSpaces,
  //   userAccount?.createdSpaces
  // );

  const [previewSpace, setPreviewSpace] = useState<SpaceTemplateConfig | null>(
    null
  );

  useEffect(() => {
    if (previewSpace) {
      trackSelectedSpace({ selectedSpaceTemplate: previewSpace.spaceId });
    }
  }, [previewSpace]);

  const closePreview = useCallback(() => {
    setPreviewSpace(null);
  }, []);

  return (
    <>
      <Layout2 navProps={{ navItems: ["documentation", "my-spaces"] }}>
        {previewSpace && (
          <PreviewModal
            createSpace={handleCreateSpace}
            show={true}
            onClose={closePreview}
            space={previewSpace}
            creating={creating}
          />
        )}
        <Typography variant="h1">Create a Space</Typography>
        {authState.pending ? (
          <LoadingLinear height="320px" />
        ) : (
          <div className={layoutStyles.mainActions}>
            {!createdSpacesStatus.canCreate && <CannotCreateSpaceError />}
            {!!createdSpacesStatus.canCreate && (
              <>
                <Typography variant="h4" style={{ marginTop: 0 }}>
                  {createdSpacesStatus.text}
                </Typography>

                <SelectSpace
                  setSelectedSpace={handleCreateSpace}
                  setPreviewSpace={setPreviewSpace}
                  creating={creating}
                />
              </>
            )}
          </div>
        )}
      </Layout2>
    </>
  );
};

export default SpaceCreation;
