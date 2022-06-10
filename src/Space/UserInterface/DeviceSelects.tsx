/* eslint-disable jsx-a11y/accessible-emoji */
import React, { memo, ReactNode, useCallback, useRef, useState } from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import Tooltip from "@material-ui/core/Tooltip";
import clsx from "clsx";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import styles from "../../css/controls.module.scss";
import { preventHighlight } from "Space/utils/controls";

export type DevicePauseAvatarProps = {
  resumeText: string;
  pauseText: string;
  offIcon: ReactNode;
  onIcon: ReactNode;
  onStatus?: ReactNode;
  off: boolean;
  toggle: () => void;
  alertColorWhenOn?: boolean;
};

export const ToggleButton = memo(
  ({
    resumeText,
    pauseText,
    offIcon,
    onIcon,
    onStatus,
    off: paused,
    toggle,
    alertColorWhenOn,
  }: DevicePauseAvatarProps) => {
    const handleClick = useCallback(
      (e: React.SyntheticEvent) => {
        preventHighlight(e);

        toggle();
      },
      [toggle]
    );

    return (
      <>
        <Tooltip title={paused ? resumeText : pauseText} placement="top">
          <button
            className={clsx(paused ? styles.resumeButton : styles.pauseButton, {
              [styles.alertButtonOn]: !paused && alertColorWhenOn,
            })}
            onClick={handleClick}
          >
            {paused ? offIcon : onIcon}
          </button>
        </Tooltip>
        {!paused && onStatus}
      </>
    );
  }
);

export const DeviceSelect = memo(
  ({
    paused,
    resumeText,
    pauseText,
    label,
    toggle,
    refreshAvailableDevices,
    devices,
    select,
    currentDeviceId,
    offIcon,
    onIcon,
    disabled,
  }: {
    paused: boolean;
    resumeText: string;
    pauseText: string;
    label: string;
    toggle: () => void;
    refreshAvailableDevices: () => void;
    devices: MediaDeviceInfo[];
    select: (deviceId: string) => Promise<void>;
    currentDeviceId: string | undefined;
    offIcon: ReactNode;
    onIcon: ReactNode;
    disabled?: boolean;
  }) => {
    const toggleControls = `toggle-${label}-active`;

    const anchorEl = useRef<HTMLDivElement>(null);

    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenuOpen = useCallback(() => {
      if (disabled) return;
      setMenuOpen((existing) => !existing);
    }, [disabled]);

    return (
      <div className={clsx(styles.buttonContainer, styles.field)}>
        <Tooltip title={paused ? resumeText : pauseText} placement="top">
          <IconButton
            aria-controls={toggleControls}
            aria-haspopup="true"
            onClick={() => toggle()}
          >
            {paused ? offIcon : onIcon}
          </IconButton>
        </Tooltip>

        <Tooltip title={`Select ${label}`} placement="top">
          <>
            <Button
              aria-controls="camera-selection-menu"
              aria-haspopup="true"
              onClick={toggleMenuOpen}
            >
              <ArrowDropDownIcon className={styles.icon}></ArrowDropDownIcon>
            </Button>
            <div className={styles.anchor} ref={anchorEl} />
          </>
        </Tooltip>
        {menuOpen && (
          <Menu
            id="camera-selection-menu"
            anchorEl={anchorEl.current}
            keepMounted
            open={Boolean(anchorEl)}
            onEnter={refreshAvailableDevices}
            disableRestoreFocus
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            transformOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            {devices.map((device) => {
              return (
                <MenuItem
                  className={clsx(styles.clickableMenu)}
                  key={device.deviceId}
                  onClick={() => {
                    setMenuOpen(false);
                    select(device.deviceId);
                  }}
                  selected={device.deviceId === currentDeviceId}
                >
                  {device.label}
                </MenuItem>
              );
            })}
          </Menu>
        )}
      </div>
    );
  }
);

export const SimpleDeviceSelect = memo(
  ({
    paused,
    resumeText,
    pauseText,
    label,
    toggle,
    refreshAvailableDevices,
    devices,
    select,
    currentDeviceId,
    offIcon,
    onIcon,
    disabled,
  }: {
    paused: boolean;
    resumeText: string;
    pauseText: string;
    label: string;
    toggle: () => void;
    refreshAvailableDevices: () => void;
    devices: MediaDeviceInfo[];
    select: (deviceId: string) => Promise<void>;
    currentDeviceId: string | undefined;
    offIcon: ReactNode;
    onIcon: ReactNode;
    disabled?: boolean;
  }) => {
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      if (event.target.value !== undefined) {
        select(event.target.value as string);
      }
    };

    return (
      <>
        <FormControl className={styles.fullWidth}>
          <InputLabel id={`${label}-select-label`}>{label}</InputLabel>
          <Select
            labelId={`${label}-select-label`}
            id={`${label}-select`}
            value={currentDeviceId}
            onChange={handleChange}
            onOpen={refreshAvailableDevices}
          >
            {devices.map((device) => {
              return (
                <MenuItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </>
    );
  }
);
