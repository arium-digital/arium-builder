export type DtlsFingerprint = {
  algorithm: string;
  value: string;
};

export type DtlsRole = "auto" | "client" | "server";

export type DtlsParameters = {
  role?: DtlsRole;
  fingerprints: DtlsFingerprint[];
};

export interface ProducerIds {
  audio?: string;
  video?: string;
}

export interface ClientState {
  [peerId: string]: {
    producers: ProducerIds;
  };
}
export type MediaTrackKind =
  | "webcamAudio"
  | "webcamVideo"
  | "screenAudio"
  | "screenVideo";

export type SctpStreamParameters = {
  /**
   * SCTP stream id.
   */
  streamId: number;

  /**
   * Whether data messages must be received in order. If true the messages will
   * be sent reliably. Default true.
   */
  ordered?: boolean;

  /**
   * When ordered is false indicates the time (in milliseconds) after which a
   * SCTP packet will stop being retransmitted.
   */
  maxPacketLifeTime?: number;

  /**
   * When ordered is false indicates the maximum number of times a packet will
   * be retransmitted.
   */
  maxRetransmits?: number;
};

export type TransportProtocol = "udp" | "tcp";

export type IceCandidate = {
  foundation: string;
  priority: number;
  ip: string;
  protocol: TransportProtocol;
  port: number;
  type: "host";
  tcpType: "passive" | undefined;
};

export type SctpParameters = {
  /**
   * Must always equal 5000.
   */
  port: number;

  /**
   * Initially requested number of outgoing SCTP streams.
   */
  OS: number;

  /**
   * Maximum number of incoming SCTP streams.
   */
  MIS: number;

  /**
   * Maximum allowed size for SCTP messages.
   */
  maxMessageSize: number;
};
