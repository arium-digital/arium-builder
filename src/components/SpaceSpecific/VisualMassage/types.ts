import { Vector3 } from "three";

export type TokenParams = {
  tokenId: number;
  videoFile: string;
  gifFile: string;
  title: string;
  position: Vector3;
  rotation: Vector3;
  minted?: boolean;
};
