import { MouseEvent } from "react";
import cta from "css/cta.module.scss";
import clsx from "clsx";

const CtaButton = ({
  buttonText,
  handleClick,
  bottomFixedOnSmall,
  disabled,
  submitButton,
}: {
  buttonText: string;
  handleClick?: (e: MouseEvent) => void;
  bottomFixedOnSmall?: boolean;
  disabled?: boolean;
  submitButton?: boolean;
}) => {
  return (
    <div
      className={clsx(cta.container, {
        [cta.bottomFixedOnSmall]: bottomFixedOnSmall,
      })}
    >
      <button
        onClick={handleClick}
        className={cta.primary}
        id="enter"
        disabled={disabled}
        type={submitButton ? "submit" : undefined}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default CtaButton;
