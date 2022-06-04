import { useStyles } from "../../../styles";
import Paper from "@material-ui/core/Paper";
import { UseChangeHandlerResult } from "Editor/hooks/useChangeHandlers";
import {
  useMakeNestedFormChangeHandlers,
  useNullableChangeHandlersWithDefaults,
} from "Editor/hooks/useNullableChangeHandlers";
import * as Forms from "../../Form";
import * as Text from "../../VisualElements/Text";
import Grid from "@material-ui/core/Grid/Grid";
import { ArtworkDisplayConfig, NftConfig } from "spaceTypes/nftConfig";
import {
  SyntheticEvent,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import * as Previews from "../../Form/Previews";
import {
  isEthereumToken,
  isManualEntryToken,
  isSuperrareToken,
  isTezosToken,
  TokenTextInfo,
  useTokenMetadata,
  getMediaFileAndType,
  TokenMedia,
} from "Space/Elements/Nft/tokenConversion";
import { Editors, FormDescription } from "Editor/types";
import useFormFields from "Editor/hooks/useFormFields";
import { functions } from "db";
import { DEFAULT_SUPERRARE_VERSION } from "defaultConfigs";
import * as themeDefaults from "defaultConfigs/theme";
import { useConfigOrThemeDefault } from "hooks/spaceHooks";
import {
  FetchOpenSeaTokenAndUpdateNftParams,
  FetchTezosTokenAndUpdateNftParams,
  FetchTokenAndUpdateNftParams,
  ManualEntryToken,
  NftUpdateStatus,
  Token,
  UpdateTokenMediaParams,
} from "../../../../../shared/nftTypes";
import { IconButton, LinearProgress } from "@material-ui/core";
import { SpaceContext } from "hooks/useCanvasAndModalContext";
import ManualEntryNftTokenForm from "./ManualEntryNftTokenForm";
import { useFileDownloadUrl } from "fileUtils";
import { ModelConfig } from "spaceTypes";
import FormSection from "Editor/components/Form/FormSection";
import RefreshIcon from "@material-ui/icons/Refresh";
import AdvancedNftSettingsForm from "./AdvancedNftSettingsForm";
import { HasFrameForm } from "Editor/components/Elements/FrameForm";
import VideoSettingsForm from "../Video/VideoSettingsForm";
import { ImageSettingsForm } from "../ImageForm";
import { fetchAndUpdateSuperrareToken } from "Space/Elements/Nft/apis/superrareApi";

const ModelPreview = ({ url }: { url: string }) => {
  const modelConfig: ModelConfig = useMemo(() => {
    return {
      modelFile: {
        fileType: "external",
        url,
      },
      bundledMaterial: true,
      materialConfig: undefined,
    };
  }, [url]);

  return <Previews.ModelElement config={modelConfig} />;
};

export const TokenPreview = ({
  tokenMedia,
  tokenTextInfo,
  loading,
  shapeDetermined,
}: {
  tokenMedia: TokenMedia | undefined;
  tokenTextInfo: TokenTextInfo;
  loading: boolean;
  shapeDetermined: (shape: { width: number; height: number }) => void;
}) => {
  const mediaType = tokenMedia?.originalMediaFileType;

  const handleLoadedImageMedata = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      const imageWidth = (e.target as HTMLImageElement).naturalWidth;
      const imageHeight = (e.target as HTMLImageElement).naturalHeight;
      shapeDetermined({ width: imageWidth, height: imageHeight });
    },
    [shapeDetermined]
  );

  const fileUrl = useFileDownloadUrl(tokenMedia?.originalMediaFile);

  return (
    <FormSection title="Token" defaultExpanded>
      {loading && "...loading"}
      {!loading && (
        <>
          <p>
            Title: {tokenTextInfo?.name}
            <br />
            Artist: {tokenTextInfo?.creatorName}
          </p>
          {mediaType === "video" && (
            <video src={fileUrl} width={400} controls />
          )}
          {(mediaType === "image" || mediaType === "gif") && (
            <img
              src={fileUrl}
              alt="Nft"
              width={400}
              onLoad={handleLoadedImageMedata}
            />
          )}
          {mediaType === "model" && fileUrl && <ModelPreview url={fileUrl} />}
        </>
      )}
    </FormSection>
  );
};

export const nftDisplayFormDescription: FormDescription<
  ArtworkDisplayConfig,
  "showMedia" | "showPlacard"
> = {
  showMedia: {
    editor: Editors.switch,
    editorConfig: {
      label: "Show Media",
    },
  },
  showPlacard: {
    editor: Editors.switch,
    editorConfig: {
      label: "Show Media",
    },
  },
};

const nftFormDescription: FormDescription<
  NftConfig,
  | "description"
  | "fetchPricing"
  | "overrideNftLink"
  | "overrideNftLinkUrl"
  | "overrideNftLinkText"
> = {
  description: {
    editor: Editors.freeText,
    editorConfig: {
      label: "Override Description",
      help:
        "If desired to override the description from the token, then set that here.",
      fullWidth: true,
      size: "fullWidth",
      multiline: true,
    },
  },
  fetchPricing: {
    editor: Editors.switch,
    editorConfig: {
      label: "Show Auction/Pricing Data",
      description: "If auction and pricing data should be shown.",
    },
  },
  overrideNftLink: {
    editor: Editors.switch,
    editorConfig: {
      label: "Override the nft link",
    },
  },
  overrideNftLinkText: {
    editor: Editors.freeText,
    editorConfig: {
      label: "Override link text",
      size: "xl",
    },
  },
  overrideNftLinkUrl: {
    editor: Editors.freeText,
    editorConfig: {
      label: "Override link url",
      size: "xl",
    },
  },
};

const defaultManualEntryToken = (): ManualEntryToken => ({});

const fetchTokenAndUpdateNft = (params: FetchTokenAndUpdateNftParams) =>
  functions().httpsCallable("fetchTokenAndUpdateNft")(params);

const updateTokenMedia = (params: UpdateTokenMediaParams) =>
  functions().httpsCallable("updateTokenMedia")(params);

export const changingToken: Token = {
  tokenId: "",
  metadata: {
    fileType: "image/png",
    name: "Nft",
    description: "...awaiting token info entry",
  },
};

export const hicetnuncContract = "KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton";
export const tezosContracts: { alias: string; address: string | null }[] = [
  { alias: "hicetnunc", address: hicetnuncContract },
  {
    alias: "randomly common skeles",
    address: "KT1HZVd9Cjc2CMe3sQvXgbxhpJkdena21pih",
  },
  { alias: "other", address: null },
  // {name: 'fxhashgenesis', address: },
];

const useNftFields = ({
  values,
  handleUpdates,
  elementId,
  setUpdating,
}: {
  values: NftConfig;
  handleUpdates: Forms.UpdateHandlers;
  elementId?: string;
  setUpdating: (updating: boolean) => void;
}) => {
  const [fetchFailed, setFetchFailed] = useState(false);

  const superrareVersion = isSuperrareToken(values)
    ? values.superrareVersion || DEFAULT_SUPERRARE_VERSION
    : undefined;

  const nftType = values.nftType === "opensea" ? "ethereum" : values.nftType;

  const tokenAddress =
    isEthereumToken(values) || isSuperrareToken(values)
      ? values.tokenAddress
      : undefined;

  const contractAddress = isTezosToken(values)
    ? values.contractAddress
    : undefined;
  const contract = isTezosToken(values) ? values.contractAlias : undefined;

  const spaceId = useContext(SpaceContext)?.spaceId;

  const fetchAndUpdateToken = useCallback(
    async ({ tokenId }: { tokenId: string }) => {
      if (!spaceId || !elementId) return;
      setFetchFailed(false);
      try {
        if (nftType === "superrare") {
          if (!superrareVersion) throw new Error("missing superrare version");

          if (superrareVersion === "custom" && !tokenAddress)
            throw new Error("missing token address");

          // for superrare, we cannot fetch the data from node as we now get a 403;
          // we need to fetch it from the browser; then we can save it on the element.
          const superrareToken = await fetchAndUpdateSuperrareToken({
            fetchData: {
              spaceId,
              elementId,
              tokenId,
              tokenAddress,
              superrareVersion,
              nftType: "superrare",
            },
            handleUpdates,
          });

          if (superrareToken) {
            await updateTokenMedia({
              elementId,
              spaceId,
              tokenInfo: {
                nftType: "ethereum",
                token: superrareToken.token,
              },
            });
          }
        } else if (nftType === "ethereum") {
          if (!tokenAddress) throw new Error("missing token address");

          const params: FetchOpenSeaTokenAndUpdateNftParams = {
            elementId,
            spaceId,
            tokenId,
            tokenAddress,
            nftType: "opensea",
          };

          await fetchTokenAndUpdateNft(params);
        } else if (nftType === "tezos") {
          if (!contractAddress) throw new Error("missing contract address");

          const params: FetchTezosTokenAndUpdateNftParams = {
            elementId,
            spaceId,
            tokenId,
            contractAddress,
            nftType: "tezos",
          };

          await fetchTokenAndUpdateNft(params);
        }
      } catch (e) {
        console.error(e);
        setFetchFailed(true);
      }
    },
    [
      spaceId,
      elementId,
      nftType,
      superrareVersion,
      tokenAddress,
      handleUpdates,
      contractAddress,
    ]
  );

  const handleTokenIdChanged = useCallback(
    async (tokenId: string | undefined, forceUpdate = false) => {
      if (!forceUpdate && tokenId === values.tokenId) return;
      handleUpdates({
        "nft.tokenId": tokenId,
        "nft.token": null,
        "nft.updateStatus": tokenId ? updatingStatus : inputtingStatus,
      });
      if (tokenId) {
        setUpdating(true);
        try {
          await fetchAndUpdateToken({ tokenId });
        } finally {
          setUpdating(false);
        }
      }
    },
    [fetchAndUpdateToken, handleUpdates, setUpdating, values.tokenId]
  );

  const handleVersionChanged = useCallback(
    (version: string | undefined) => {
      if (version === superrareVersion) return;
      handleUpdates({
        "nft.superrareVersion": version,
        "nft.tokenId": null,
        "nft.token": null,
        "nft.updateStatus": inputtingStatus,
      });
    },
    [handleUpdates, superrareVersion]
  );

  const handleTokenAddressChanged = useCallback(
    (address: string | undefined) => {
      if (address === tokenAddress) return;

      handleUpdates({
        "nft.tokenAddress": address,
        "nft.tokenId": null,
        "nft.token": changingToken,
        "nft.updateStatus": inputtingStatus,
      });
    },
    [handleUpdates, tokenAddress]
  );

  const handleContractAliasChanged = useCallback(
    (newContract: string | undefined) => {
      if (newContract === contract) return;

      const contractAddress = tezosContracts.find(
        (contract) => contract.alias === newContract
      )?.address;

      handleUpdates({
        "nft.contractAlias": newContract,
        "nft.contractAddress": contractAddress,
        "nft.tokenId": null,
        "nft.tezosToken": null,
        "nft.updateStatus": inputtingStatus,
      });
    },
    [handleUpdates, contract]
  );

  const handleContractAddressChanged = useCallback(
    (address: string | undefined) => {
      if (address === contractAddress) return;

      handleUpdates({
        "nft.contractAddress": address,
        "nft.tokenId": null,
        "nft.tezosToken": null,
        "nft.updateStatus": inputtingStatus,
      });
    },
    [handleUpdates, contractAddress]
  );

  const handleNftTypeChanged = useCallback(
    (newNftType: string | undefined) => {
      if (!newNftType) return;
      if (nftType === newNftType) return;
      handleUpdates({
        "nft.nftType": newNftType,
        "nft.tokenId": null,
        "nft.token": null,
        "nft.updateStatus": inputtingStatus,
      });
    },
    [handleUpdates, nftType]
  );

  const contractKeys = useMemo(
    () => tezosContracts.map((contract) => contract.alias),
    []
  );

  const refreshToken = useCallback(() => {
    if (!values.tokenId) return;
    handleTokenIdChanged(values.tokenId, true);
  }, [values.tokenId, handleTokenIdChanged]);

  const updatingStatus: NftUpdateStatus = "updating";
  const inputtingStatus: NftUpdateStatus = "awaitingInput";

  return {
    handleVersionChanged,
    handleTokenIdChanged,
    handleTokenAddressChanged,
    handleContractAliasChanged,
    handleContractAddressChanged,
    handleNftTypeChanged,
    contractKeys,
    fetchFailed,
    nftType,
    refreshToken,
  };
};

const superrareOptions: { label: string; value: string }[] = [
  {
    label: "v1",
    value: "v1",
  },
  { label: "v2", value: "v2" },
  {
    label: "Superrare Spaces",
    value: "custom",
  },
];

export const TokenConfigForm = (
  sourceProps: UseChangeHandlerResult<NftConfig> & {
    setUpdating: (updating: boolean) => void;
    elementId: string | undefined;
    updating: boolean;
  }
) => {
  const { FormFields, props } = useFormFields(
    nftFormDescription,
    sourceProps.handleFieldChanged,
    sourceProps.values
  );

  const {
    handleVersionChanged,
    handleTokenIdChanged,
    handleTokenAddressChanged,
    handleContractAliasChanged,
    handleContractAddressChanged,
    handleNftTypeChanged,
    contractKeys,
    fetchFailed,
    nftType,
    refreshToken,
  } = useNftFields(sourceProps);

  const { values, updating, makeNestedFormProps } = sourceProps;

  const updatingOnServer =
    sourceProps.sourceValues?.updateStatus === "updating";

  // useEffect(() => {

  //   console.log('object', { status: sourceProps.values?.updateStatus })
  // }, [sourceProps.sourceValues?.updateStatus])

  const nftPlacardSettings = useConfigOrThemeDefault(
    props.values.display?.nftPlacardSettings,
    themeDefaults.nftPlacard
  );

  const disableNftChanges = updating;

  return (
    <>
      <FormSection defaultExpanded title="Nft Token">
        <Grid container>
          <Grid item xs={12}>
            <Forms.DropdownSelect
              options={["ethereum", "superrare", "tezos", "manual entry"]}
              setValue={handleNftTypeChanged}
              value={nftType}
              label="Nft Type"
              disabled={disableNftChanges}
            />
          </Grid>
          {isSuperrareToken(values) && (
            <Grid item xs={12}>
              <Forms.DropdownSelect
                options={superrareOptions}
                // @ts-ignore
                setValue={handleVersionChanged}
                value={values.superrareVersion || DEFAULT_SUPERRARE_VERSION}
                label="Superrare token version"
                disabled={disableNftChanges}
              />
            </Grid>
          )}
          {(isEthereumToken(values) ||
            (isSuperrareToken(values) &&
              values.superrareVersion === "custom")) && (
            <Grid item xs={12}>
              <Forms.FreeText
                label="Token Address"
                value={values.tokenAddress}
                setValue={handleTokenAddressChanged}
                size="fullWidth"
                disabled={disableNftChanges}
              />
            </Grid>
          )}
          {isTezosToken(values) && (
            <>
              <Grid item xs={12}>
                <Forms.DropdownSelect
                  label="Contract"
                  options={contractKeys}
                  // @ts-ignore
                  value={values.contractAlias}
                  setValue={handleContractAliasChanged}
                  size="fullWidth"
                  disabled={disableNftChanges}
                />
              </Grid>
              <Grid item xs={12}>
                <Forms.FreeText
                  label="Contract Address"
                  value={values.contractAddress}
                  setValue={handleContractAddressChanged}
                  size="fullWidth"
                  disabled={
                    disableNftChanges || values.contractAlias !== "other"
                  }
                />
              </Grid>
            </>
          )}
          {!isManualEntryToken(values) && (
            <Grid item xs={12}>
              <Forms.FreeText
                size="lg"
                value={values.tokenId || undefined}
                setValue={handleTokenIdChanged}
                label="Token id"
                error={fetchFailed ? "Error fetching token" : undefined}
                disabled={disableNftChanges}
              />
              <IconButton
                disabled={!values.tokenId || disableNftChanges}
                onClick={refreshToken}
                aria-label="Refresh"
              >
                <RefreshIcon />
              </IconButton>
            </Grid>
          )}
          {isEthereumToken(values) && (
            <Grid item xs={12}>
              <FormFields.fetchPricing {...props} />
              <FormFields.overrideNftLink {...props} />
              {values.overrideNftLink && (
                <>
                  <FormFields.overrideNftLinkText {...props} />
                  <FormFields.overrideNftLinkUrl {...props} />
                </>
              )}
            </Grid>
          )}
        </Grid>
        {updatingOnServer && (
          <Grid item xs={12}>
            <p>loading token...</p>
            <LinearProgress />
          </Grid>
        )}

        {!isManualEntryToken(values) && (
          <Grid item xs={12}>
            {nftPlacardSettings.showDescription && (
              <FormFields.description {...props} />
            )}
          </Grid>
        )}
      </FormSection>
      {isManualEntryToken(values) && (
        // @ts-ignore
        <ManualEntryNftTokenForm
          // @ts-ignore
          nestedForm={makeNestedFormProps("manualEntryToken")}
          defaults={defaultManualEntryToken}
        />
      )}
    </>
  );
};

export const useExtractToken = (sourceValues: NftConfig | undefined) => {
  const mediaAndFileType = useMemo(() => getMediaFileAndType(sourceValues), [
    sourceValues,
  ]);
  const tokenMetadata = useTokenMetadata(sourceValues);

  const [mediaShape, setMediaShape] = useState<{
    width: number;
    height: number;
  }>();

  return {
    tokenMetadata,
    mediaAndFileType,
    mediaShape,
    setMediaShape,
  };
};

const NftForm = (
  sourceProps: Forms.StandardFormPropsNullable<NftConfig> & {
    elementId?: string;
  }
) => {
  const classes = useStyles();

  const changHandlerResult = useNullableChangeHandlersWithDefaults({
    nestedForm: sourceProps.nestedForm,
    defaultValues: sourceProps.defaults,
  });

  const {
    values,
    makeNestedFormProps,
    handleFieldChanged,
  } = changHandlerResult;

  const {
    mediaAndFileType,
    tokenMetadata,
    mediaShape,
    setMediaShape,
  } = useExtractToken(sourceProps.nestedForm.sourceValues);

  const displayConfig = sourceProps.nestedForm.sourceValues?.display;

  const [updating, setUpdating] = useState(false);

  const displayNestedForm = makeNestedFormProps("display");

  const displayMakeNestedFormProps = useMakeNestedFormChangeHandlers({
    nestedForm: displayNestedForm,
  });

  const mediaFileType = mediaAndFileType.originalMediaFileType;

  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={6}>
          <TokenConfigForm
            {...changHandlerResult}
            updating={updating}
            setUpdating={setUpdating}
            elementId={sourceProps.elementId}
          />
          {!isManualEntryToken(values) && (
            <TokenPreview
              tokenMedia={mediaAndFileType}
              tokenTextInfo={tokenMetadata}
              loading={updating}
              shapeDetermined={setMediaShape}
            />
          )}
          <HasFrameForm
            nestedForm={displayMakeNestedFormProps("mediaFrame")}
            getThemeDefault={themeDefaults.defaultFrame}
          />

          {(mediaFileType === "video" || mediaFileType === "gif") && (
            <VideoSettingsForm
              nestedForm={displayMakeNestedFormProps("video")}
              getThemeDefault={themeDefaults.videoSettings}
              mediaShape={mediaShape}
              storedVideo={mediaAndFileType.originalMediaFile}
              type={"stored video"}
            />
          )}

          {mediaFileType === "image" && (
            <ImageSettingsForm
              nestedForm={displayMakeNestedFormProps("image")}
              getThemeDefault={themeDefaults.getDefaultImageSettings}
              mediaShape={mediaShape}
            />
          )}

          <AdvancedNftSettingsForm
            nestedForm={makeNestedFormProps("display")}
            mediaFileType={mediaAndFileType.originalMediaFileType}
            mediaFile={mediaAndFileType.inSpaceMediaFile || undefined}
            mediaShape={mediaShape}
          />
          {/* // hack for now put this in advanced tab at the bottom */}
          <FormSection defaultExpanded title="Interactable Config">
            <Forms.Switch
              value={values.interactable}
              label="Open details model on click"
              setValue={handleFieldChanged("interactable")}
              description="If enabled, when a user clicks on this nft element, a modal will open with details about the element and a link to the marketplace its listed on"
            />
          </FormSection>
        </Grid>
        <Grid item lg={6} xs={12}>
          <Paper className={classes.paper}>
            <Text.SubElementHeader>Nft Element Preview</Text.SubElementHeader>
            {sourceProps.nestedForm.sourceValues && (
              <Previews.Nft
                config={{
                  ...sourceProps.nestedForm.sourceValues,
                  display: displayConfig,
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default NftForm;
