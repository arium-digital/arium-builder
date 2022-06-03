// import debug from "debug";
import { useEffect, useState } from "react";

const aecOnPositionalAudioSupported = () =>
  /Firefox/i.test(navigator.userAgent);

// const isHeadphoneDevice = (deviceLabel: string) => {
//   const lowerCased = deviceLabel.toLowerCase();

//   return lowerCased.includes("head") || lowerCased.includes("air");
// };

const useEnableSpatialAudio = ({ initialized }: { initialized: boolean }) => {
  const [browserHasAec] = useState(() => aecOnPositionalAudioSupported());

  const [enablePositionalAudio, setEnablePositionalAudio] = useState(false);

  useEffect(() => {
    // if (browserHasAec) {
    //   setEnablePositionalAudio(true);
    //   return;
    // }

    setEnablePositionalAudio(browserHasAec);

    if (!initialized) return;

    // const updateDevices = async () => {
    //   const devices = await navigator.mediaDevices.enumerateDevices();

    //   const outputDeviceLabels = devices
    //     .filter((device) => device.kind === "audiooutput")
    //     .map((device) => device.label);

    //   // hack - first device is the default, which is the output device;
    //   // this determines the currently selected device until we allow the user to change it.
    //   const firstDevice = outputDeviceLabels[0];
    //   // hack - if there is an output device, and the name contains head or air, then
    //   // we can assume its headphones.
    //   const headphonesAreOutput = firstDevice
    //     ? isHeadphoneDevice(firstDevice)
    //     : false;

    //   const enableSpatialAudio = headphonesAreOutput;

    //   debug("media:enablePositionalAudio")({
    //     enableSpatialAudio,
    //     deviceLabel: firstDevice,
    //   });

    //   setEnablePositionalAudio(enableSpatialAudio);
    // };

    // updateDevices();

    // navigator.mediaDevices.addEventListener("devicechange", updateDevices);

    // return () => {
    //   navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
    // };
  }, [browserHasAec, initialized]);

  return enablePositionalAudio;
};

export default useEnableSpatialAudio;
