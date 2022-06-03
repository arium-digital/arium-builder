import { useCallback, useEffect, useState } from "react";
import { serverRequest } from "../../communicationTypes";

import * as mediasoupClient from "mediasoup-client";
// this hook creates a send Transport from a given mediasoup device and connects
// that transport to the router

const forceTcp = false;

const PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{ googDscp: true }],
};

export const useSendTransport = ({
  transportInfo,
  mediasoupDevice,
  request,
  invisible,
}: {
  transportInfo: any;
  mediasoupDevice?: mediasoupClient.Device;
  request?: serverRequest;
  invisible: boolean | undefined;
}) => {
  const [
    sendTransport,
    setSendTransport,
  ] = useState<mediasoupClient.types.Transport>();

  const createSendTransport = useCallback(
    ({
      transportInfo,
      mediasoupDevice,
      request,
    }: {
      transportInfo: any;
      mediasoupDevice: mediasoupClient.Device;
      request: serverRequest;
    }) => {
      // console.log('creating send transport');
      const {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
      } = transportInfo;

      const newSendTransport = mediasoupDevice.createSendTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        iceServers: [],
        proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS,
      });

      setSendTransport(newSendTransport);

      newSendTransport.on(
        "connect",
        (
          { dtlsParameters },
          callback,
          errback // eslint-disable-line no-shadow
        ) => {
          request("connectWebRtcTransport", {
            transportId: newSendTransport.id,
            dtlsParameters,
          })
            .then(callback)
            .catch(errback);
        }
      );

      newSendTransport.on(
        "produce",
        async ({ kind, rtpParameters, appData }, callback, errback) => {
          // console.log(
          //   "producing from send transport",
          //   kind,
          //   rtpParameters,
          //   appData
          // );
          try {
            // eslint-disable-next-line no-shadow
            const { id } = await request("produce", {
              transportId: newSendTransport.id,
              kind: appData.kind,
              rtpParameters,
              appData,
            });

            // console.log("produced with id", id);

            callback({ id });
          } catch (error) {
            errback(error);
          }
        }
      );

      newSendTransport.observer.on("close", () => {
        // console.log("send transport closed");
        setSendTransport(undefined);
      });
    },
    []
  );

  useEffect(() => {
    // if lost device, and sending, then close it and set undefined.
    if (!mediasoupDevice && sendTransport) {
      setSendTransport(undefined);
    }
  }, [mediasoupDevice, sendTransport]);

  useEffect(() => {
    if (invisible || !transportInfo || !request || !mediasoupDevice) return;

    if (sendTransport) return;

    createSendTransport({
      transportInfo,
      mediasoupDevice,
      request,
    });
  }, [
    transportInfo,
    mediasoupDevice,
    request,
    invisible,
    sendTransport,
    createSendTransport,
  ]);

  return sendTransport;
};

// This hook creates a recv transport from a given mediasoup device and connects
// that transport to the router.
export const useRecvTransport = ({
  mediasoupDevice,
  request,
  transportInfo,
}: {
  mediasoupDevice?: mediasoupClient.Device;
  request?: serverRequest;
  transportInfo?: any;
}) => {
  const [
    recvTransport,
    setRecvTransport,
  ] = useState<mediasoupClient.types.Transport>();

  const createRecvTransport = useCallback(
    ({
      mediasoupDevice,
      request,
      transportInfo,
    }: {
      mediasoupDevice: mediasoupClient.Device;
      request: serverRequest;
      transportInfo: any;
    }) => {
      // console.log("creating recv transport");
      const {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
      } = transportInfo;

      const newRecvTransport = mediasoupDevice.createRecvTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        iceServers: [],
      });

      setRecvTransport(newRecvTransport);

      // once transport has been made locally
      // connect it to the router
      newRecvTransport.on(
        "connect",
        (
          { dtlsParameters },
          callback,
          errback // eslint-disable-line no-shadow
        ) => {
          request("connectWebRtcTransport", {
            transportId: newRecvTransport.id,
            dtlsParameters,
          })
            .then(callback)
            .catch(errback);
        }
      );

      newRecvTransport.observer.on("close", () => {
        // console.log("recvTransport closed");
        setRecvTransport(undefined);
      });
    },
    []
  );

  useEffect(() => {
    if (!transportInfo || !request || !mediasoupDevice) return;

    if (recvTransport) return;

    createRecvTransport({ transportInfo, mediasoupDevice, request });
  }, [
    transportInfo,
    mediasoupDevice,
    request,
    recvTransport,
    createRecvTransport,
  ]);

  useEffect(() => {
    // if lost device, and sending, then close it and set undefined.
    if (!mediasoupDevice && recvTransport) {
      // console.log('closing recv');
      recvTransport.close();
      setRecvTransport(undefined);
    }
  }, [mediasoupDevice, recvTransport]);

  return recvTransport;
};

export const useWebRtcTransport = (
  request?: serverRequest,
  mediasoupDevice?: mediasoupClient.Device
) => {
  const [producerTransportInfo, setProducerTransportInfo] = useState<any>();
  const [consumerTransportInfo, setConsumerTransportInfo] = useState<any>();

  const [creatingSendTransport, setCreatingSendTransport] = useState(false);
  const [creatingRecvTransport, setCreatingRecvTransport] = useState(false);

  const createSendWebRtcTransport = useCallback(
    ({
      request,
      mediasoupDevice,
    }: {
      request: serverRequest;
      mediasoupDevice: mediasoupClient.Device;
    }) => {
      // create producer transport
      if (creatingSendTransport) return;
      setCreatingSendTransport(true);
      request("createWebRtcTransport", {
        forceTcp: forceTcp,
        producing: true,
        consuming: false,
        sctpCapabilities: mediasoupDevice.sctpCapabilities,
      })
        .then((transportInfo) => {
          setProducerTransportInfo(transportInfo);
        })
        .finally(() => {
          setCreatingSendTransport(false);
        });
    },
    [creatingSendTransport]
  );

  const createRecvWebRtcTransport = useCallback(
    ({ request }: { request: serverRequest }) => {
      if (creatingRecvTransport) return;
      setCreatingRecvTransport(true);
      request("createWebRtcTransport", {
        forceTcp,
        producing: false,
        consuming: true,
      })
        .then((transportInfo) => {
          setConsumerTransportInfo(transportInfo);
        })
        .finally(() => {
          setCreatingRecvTransport(false);
        });
    },
    [creatingRecvTransport]
  );

  // useWhyDidYouUpdate('transports', { request, mediasoupDevice });

  useEffect(() => {
    if (producerTransportInfo) return;
    if (request && mediasoupDevice && !producerTransportInfo) {
      createSendWebRtcTransport({ request, mediasoupDevice });
    }
  }, [
    createSendWebRtcTransport,
    mediasoupDevice,
    producerTransportInfo,
    request,
  ]);

  useEffect(() => {
    if (request && !consumerTransportInfo && mediasoupDevice) {
      createRecvWebRtcTransport({ request });
    }
  }, [
    consumerTransportInfo,
    createRecvWebRtcTransport,
    request,
    mediasoupDevice,
  ]);

  useEffect(() => {
    if (!mediasoupDevice) {
      setProducerTransportInfo(undefined);
      setConsumerTransportInfo(undefined);
    }
  }, [mediasoupDevice]);

  // ;

  return {
    producerTransportInfo,
    consumerTransportInfo,
  };
};
