import { MediaTrackKind } from "../../shared/communication";
import { store } from "../db";

export const producingPeers = ({
  spaceId,
  kind,
}: {
  spaceId: string;
  kind: MediaTrackKind;
}) => `producingPeers/${spaceId}/${kind}`;
export const producingPeer = ({
  spaceId,
  kind,
  sessionId,
}: {
  spaceId: string;
  kind: MediaTrackKind;
  sessionId: string;
}) => `${producingPeers({ spaceId, kind })}/${sessionId}`;

export class SessionPaths {
  userId: string;
  sessionId: string;

  constructor({ userId, sessionId }: { userId: string; sessionId: string }) {
    this.userId = userId;
    this.sessionId = sessionId;
  }

  private prefix() {
    return `userCommunication/${this.userId}/${this.sessionId}`;
  }

  private addPrefix(path: string) {
    return `${this.prefix()}/${path}`;
  }

  communicatonCollection() {
    return store
      .collection("users")
      .doc(this.userId)
      .collection("sessions")
      .doc(this.sessionId)
      .collection("messages");
  }

  router() {
    return this.addPrefix("router");
  }
  webRtcTransport() {
    return this.addPrefix("webrtcTransport");
  }
  clientWebRtcTransportConnected({ transportId }: { transportId: string }) {
    return this.addPrefix(`clientWebrtcTransportsConnected/${transportId}`);
  }
  serverWebRtcTransportConnected({ transportId }: { transportId: string }) {
    return this.addPrefix(`serverWebrtcTransportsConnected/${transportId}`);
  }
  clientConsuming({ consumerId }: { consumerId: string }) {
    return this.addPrefix(`clientConsuming/${consumerId}`);
  }
  serverConsumerPaused({ consumerId }: { consumerId: string }) {
    return this.addPrefix(`serverConsumerPaused/${consumerId}`);
  }
  serverProducing({
    transportId,
    kind,
  }: {
    transportId: string;
    kind: MediaTrackKind;
  }) {
    return this.addPrefix(`serverProducing/${transportId}/${kind}`);
  }
  clientProducerPaused({ producerId }: { producerId: string }) {
    return this.addPrefix(`clientProducerPaused/${producerId}`);
  }
  peersToConsume({ kind }: { kind: MediaTrackKind }) {
    return this.addPrefix(`peersToConsume/${kind}`);
  }
  peerToConsume({ kind, peerId }: { kind: MediaTrackKind; peerId: string }) {
    return this.addPrefix(`peersToConsume/${kind}/${peerId}`);
  }
  peersToConsumeDeltas() {
    return this.addPrefix(`peersToConsumeDeltas`);
  }
  allServerConsumers() {
    return this.addPrefix("serverConsumers");
  }
  serverConsumers({
    producingSessionId,
    kind,
  }: {
    producingSessionId: string;
    kind: MediaTrackKind;
  }) {
    return `${this.allServerConsumers()}/${producingSessionId}/${kind}`;
  }
}
