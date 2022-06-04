import { Loader, Texture, RGBAFormat, TextureLoader } from "three";
import parseAPNG, { APNG } from "apng-js";
import Player from "apng-js/types/library/player";

function checkStatus(response: Response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

class AnimatedImageTexture extends Texture {
  update() {
    this.needsUpdate = true;
  }
}

export const isAnimatedImageLoader = (
  loader: AnimatedImageLoader | TextureLoader
): loader is AnimatedImageLoader => {
  return (loader as AnimatedImageLoader)?.isAnimated === true;
};

interface Cache {
  [url: string]: {
    player: Player;
    canvas: HTMLCanvasElement;
  };
}

const cache: Cache = {};

// const cached = {
// 	[url: string]:
// }

const getPlayerAndCanvas = async (url: string) => {
  const response = await fetch(url);
  checkStatus(response);

  const buffer = await response.arrayBuffer();

  const parsed = parseAPNG(buffer) as APNG;

  const canvas = document.createElement("canvas");

  canvas.width = parsed.width;
  canvas.height = parsed.height;

  const player = await parsed.getPlayer(
    canvas.getContext("2d") as CanvasRenderingContext2D,
    true
  );

  return {
    player,
    canvas,
  };
};

export default class AnimatedImageLoader extends Loader {
  isAnimated = true;
  player?: Player;

  async load(
    url: string,
    onLoad?: (texture: Texture) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ) {
    if (this.path !== undefined) url = this.path + url;

    let player: Player;
    let canvas: HTMLCanvasElement;

    if (cache[url]) {
      player = cache[url].player;
      canvas = cache[url].canvas;
    } else {
      const result = await getPlayerAndCanvas(url);
      player = result.player;
      canvas = result.canvas;

      cache[url] = {
        player,
        canvas,
      };
    }

    const texture = new AnimatedImageTexture();
    texture.format = RGBAFormat;
    texture.needsUpdate = true;
    texture.image = canvas;

    player.on("frame", () => {
      texture.needsUpdate = true;
    });

    if (onLoad) {
      onLoad(texture);
    }

    return canvas;
  }

  // update() {
  // 	// @ts-ignore
  // 	this.needsUpdate = true;
  // }
}
