export type { FileLocation } from "../../shared/sharedTypes";

export interface IVector2 {
  x: number;
  y: number;
}

export interface IVector3 extends IVector2 {
  z: number;
}

export interface IVector4 extends IVector3 {
  w: number;
}

export type Color = string;

export interface Transform {
  position?: IVector3;
  rotation?: IVector3;
  scale?: IVector3;
}
