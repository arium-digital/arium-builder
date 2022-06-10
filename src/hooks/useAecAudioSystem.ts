import { useEffect, useState } from "react";
import { BehaviorSubject, forkJoin, Observable } from "rxjs";
import { take, map } from "rxjs/operators";
import * as THREE from "three";
import isMobile from "../libs/deviceDetect";
import { filterUndefined } from "../libs/rx";

async function enableChromeAEC(gainNode: GainNode, context: AudioContext) {
  /**
   *  workaround for: https://bugs.chromium.org/p/chromium/issues/detail?id=687574
   *  1. grab the GainNode from the scene's THREE.AudioListener
   *  2. disconnect the GainNode from the AudioDestinationNode (basically the audio out), this prevents hearing the audio twice.
   *  3. create a local webrtc connection between two RTCPeerConnections (see this example: https://webrtc.github.io/samples/src/content/peerconnection/pc1/)
   *  4. create a new MediaStreamDestination from the scene's THREE.AudioContext and connect the GainNode to it.
   *  5. add the MediaStreamDestination's track  to one of those RTCPeerConnections
   *  6. connect the other RTCPeerConnection's stream to a new audio element.
   *  All audio is now routed through Chrome's audio mixer, thus enabling AEC, while preserving all the audio processing that was performed via the WebAudio API.
   */

  const audioEl = new Audio();
  audioEl.setAttribute("autoplay", "autoplay");
  audioEl.setAttribute("playsinline", "playsinline");

  const loopbackDestination = context.createMediaStreamDestination();
  const outboundPeerConnection = new RTCPeerConnection();
  const inboundPeerConnection = new RTCPeerConnection();

  const onError = (e: Error) => {
    console.error("RTCPeerConnection loopback initialization error", e);
  };

  outboundPeerConnection.addEventListener("icecandidate", (e) => {
    if (!e || !e.candidate) return;
    inboundPeerConnection.addIceCandidate(e.candidate).catch(onError);
  });

  inboundPeerConnection.addEventListener("icecandidate", (e) => {
    if (!e || !e.candidate) return;
    outboundPeerConnection.addIceCandidate(e.candidate).catch(onError);
  });

  inboundPeerConnection.addEventListener("track", (e) => {
    audioEl.srcObject = e.streams[0];
  });

  try {
    //The following should never fail, but just in case, we won't disconnect/reconnect the gainNode unless all of this succeeds
    loopbackDestination.stream.getTracks().forEach((track, i) => {
      outboundPeerConnection.addTrack(track, loopbackDestination.stream);
    });

    const offer = await outboundPeerConnection.createOffer();
    outboundPeerConnection.setLocalDescription(offer);
    await inboundPeerConnection.setRemoteDescription(offer);

    const answer = await inboundPeerConnection.createAnswer();
    inboundPeerConnection.setLocalDescription(answer);
    outboundPeerConnection.setRemoteDescription(answer);

    gainNode.disconnect();
    gainNode.connect(loopbackDestination);
  } catch (e) {
    onError(e as Error);
  }
}

export interface AecStream {
  sourceNode: MediaStreamAudioSourceNode;
  gainNode: GainNode;
}

export interface AecAudioSystem {
  addStreamToOutboundAudio: (mediaStream: MediaStream) => AecStream;
  removeStreamFromOutboundAudio: (aecStream: AecStream) => void;
}

// this will implement echo correction on chrome, when there is positional audio
// for outbount streams
const aecAudioSystem = (
  listener: THREE.AudioListener,
  audioContext: AudioContext
): AecAudioSystem => {
  const outboundGainNode = audioContext.createGain();

  if (!isMobile() && /chrome/i.test(navigator.userAgent)) {
    enableChromeAEC(listener.gain, audioContext);
  }

  const addStreamToOutboundAudio = (mediaStream: MediaStream): AecStream => {
    const sourceNode = audioContext.createMediaStreamSource(mediaStream);
    const gainNode = audioContext.createGain();
    sourceNode.connect(gainNode);
    gainNode.connect(outboundGainNode);

    return {
      sourceNode,
      gainNode,
    };
  };

  const removeStreamFromOutboundAudio = ({
    sourceNode,
    gainNode,
  }: AecStream) => {
    sourceNode.disconnect();
    gainNode.disconnect();
  };

  return {
    addStreamToOutboundAudio,
    removeStreamFromOutboundAudio,
  };
};

export const useAecAudioSystem = ({
  listener$,
  audioContext$,
}: {
  listener$: Observable<THREE.AudioListener | undefined>;
  audioContext$: Observable<AudioContext | undefined>;
}) => {
  const [aecAudioSystem$] = useState(
    new BehaviorSubject<AecAudioSystem | undefined>(undefined)
  );

  useEffect(() => {
    forkJoin({
      listener: listener$.pipe(filterUndefined(), take(1)),
      audioContext: audioContext$.pipe(filterUndefined(), take(1)),
    })
      .pipe(
        map(({ listener, audioContext }) => {
          return aecAudioSystem(listener, audioContext);
        })
      )
      .subscribe(aecAudioSystem$);
  }, [listener$, audioContext$, aecAudioSystem$]);

  return aecAudioSystem$;
};
