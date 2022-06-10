import { FileLocation } from "../../shared/sharedTypes";
// import {JSX } from 'react';

export type InteractableElement = {
  interactable?: boolean;
  interactableConfig?: InteractionConfig;
};

export type InteractionConfig = {
  action: InteractionType;
  payload: InteractionPayload;
};

export enum InteractionType {
  showModal = "Show Modal",
}

export type InteractionPayload = ShowModalConfig;
export type AssetDetailFileType = "self" | "image" | "video" | "model";
export type ShowModalConfig = {
  contentHTML: string | JSX.Element | null | undefined;
  backgroundColor: string;
  maxDistance?: number;
  showDetail?: boolean;
  detailFileType?: AssetDetailFileType;
  detailFile?: FileLocation;
  contentVerticalAlignment?: "top" | "center";
};
