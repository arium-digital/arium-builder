// @ts-nocheck
import { Texture, LinearFilter, RGBAFormat, PixelFormat } from "three";

class VideoTexture extends Texture {
  constructor(
    video: HTMLVideoElement,
    magFilter: LinearFilter = LinearFilter,
    minFilter: LinearFilter = LinearFilter,
    format: PixelFormat = RGBAFormat
  ) {
    super(video, undefined, undefined, undefined, magFilter, minFilter, format);

    this.format = format !== undefined ? format : RGBFormat;

    this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
    this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;

    // this.generateMipmaps = false;
    this.isVideoTexture = true;
    this.needsUpdate = true;
  }

  update() {
    const video = this.image;

    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      this.needsUpdate = true;
    }
  }
}

export default VideoTexture;
