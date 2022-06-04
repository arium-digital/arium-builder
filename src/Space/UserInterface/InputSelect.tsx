import React, { memo, useState, useEffect, useCallback } from "react";
import { Form } from "react-bootstrap";

const InputSelect = memo(
  ({
    title,
    currentDeviceId,
    inputSelect,
    refreshAvailableDevices,
    devices,
    disabled,
    icon,
  }: {
    title: string;
    inputSelect: (deviceId: string) => Promise<void>;
    currentDeviceId?: string;
    refreshAvailableDevices: () => void;
    devices: MediaDeviceInfo[] | undefined;
    disabled?: boolean;
    icon?: string;
  }) => {
    const [selected, setSelected] = useState<string>(currentDeviceId || "");

    useEffect(() => {
      setSelected(currentDeviceId || "");
    }, [currentDeviceId]);

    const handleChanged = useCallback(
      (event: React.ChangeEvent<{ value: unknown }>) => {
        inputSelect(event.target.value as string);
        setSelected(event.target.value as string);
      },
      [inputSelect]
    );

    return (
      <Form.Group className="m-0">
        <Form.Label srOnly>{title}</Form.Label>
        <Form.Control
          as="select"
          disabled={disabled}
          value={selected}
          onChange={handleChanged}
          onClick={refreshAvailableDevices}
        >
          {devices?.map((device) => {
            return (
              <option value={device.deviceId} key={device.deviceId}>
                {device.label}
              </option>
            );
          })}
        </Form.Control>
      </Form.Group>
    );
  }
);
export default InputSelect;
