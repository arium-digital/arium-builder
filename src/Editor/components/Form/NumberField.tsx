import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  DragEvent,
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  FC,
  useRef,
  MutableRefObject,
} from "react";
import clsx from "clsx";
import { useStyles } from "Editor/styles";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import { FieldSize, useFieldClassForSize } from "./helpers";
import LabelWithTooltip from "./LabelWithTooltip";
import { Subject, combineLatest, BehaviorSubject, asyncScheduler } from "rxjs";
import { map, withLatestFrom, throttleTime } from "rxjs/operators";
import {
  useBehaviorSubjectFromCurrentValue,
  useCurrentValueFromBehaviorSubject,
} from "hooks/useObservable";
import { filterUndefined } from "libs/rx";
import { animated } from "react-spring";
import { degreesToRadians, radiansToDegrees } from "libs/utils";
import { useEditingElementStatus } from "./useEditingElementState";
import round from "lodash/round";

const isValidNumber = (value: string) => {
  return !isNaN(+value);
};

const getFormHelperText = ({
  error,
  invalidNumberError,
  help,
}: {
  error?: string;
  invalidNumberError?: string;
  help?: string;
}) => {
  if (error) return error;
  else if (invalidNumberError) return invalidNumberError;
  else if (help) return help;
  return;
};

const ENTER_KEY = 13;

const getPrecision = (step: number) => {
  const stepString = step.toString();
  const decimalPlace = stepString.indexOf(".");
  if (decimalPlace < 0) return 1;

  const distanceFromEnd = stepString.length - decimalPlace - 1;

  const precisionNumber = Math.pow(10, distanceFromEnd);

  return precisionNumber;
};

export const roundToPrecision = (value: number, precision: number) => {
  return round(value, precision);
};

const useClamp = ({
  min,
  max,
}: {
  min: number | undefined;
  max: number | undefined;
}) => {
  const clampToMin = useCallback(
    (value: number) => {
      if (typeof min === "number") {
        return Math.max(min, value);
      }
      return value;
    },
    [min]
  );

  const clampToMax = useCallback(
    (value: number) => {
      if (typeof max === "number") {
        return Math.min(max, value);
      }
      return value;
    },
    [max]
  );

  const clamp = useCallback(
    (value: number) => {
      return clampToMax(clampToMin(value));
    },
    [clampToMin, clampToMax]
  );

  return clamp;
};

const preventDefault = (e: Event) => {
  e.preventDefault();
};

export const DisabledNumberField: FC<{
  label: string;
  value: React.MutableRefObject<number>;
}> = ({ label, value }) => {
  const classes = useStyles();

  return (
    <FormControl className={classes.fieldMargin} style={{ opacity: 0.2 }}>
      <LabelWithTooltip label={label} />
      <a href="#" title={label}>
        <animated.span>{value.current}</animated.span>
      </a>
    </FormControl>
  );
};

export type NumberProps = {
  initialValue?: number;
  setValue: (value: number) => void;
  label?: string;
  description?: string;
  error?: string;
  step?: number;
  size?: FieldSize;
  help?: string;
  max?: number;
  min?: number;
  isAngle?: boolean;
  setEditing?: () => void;
  setDoneEditing?: () => void;
  uniformDisplayValueRef?: MutableRefObject<number | null>;
  useUniform?: boolean;
  precision?: number;
  // sourceValueRef?: MutableRefObject<number>;
  dragValueChanged?: (dragValue: number) => void;
  noFormControl?: boolean;
};

const NumberField: FC<NumberProps> = ({
  initialValue,
  setValue: saveValueToDB,
  label,
  description,
  error,
  step = 0.01,
  size = "md",
  help,
  min,
  max,
  isAngle,
  setEditing,
  setDoneEditing,
  uniformDisplayValueRef,
  useUniform,
  // sourceValueRef,
  dragValueChanged,
  precision,
  noFormControl,
}) => {
  const precisionToUse = useMemo(() => precision || getPrecision(step), [
    precision,
    step,
  ]);

  const { locked } = useEditingElementStatus();

  const [value$] = useState(() => {
    const initial =
      isAngle && initialValue !== undefined
        ? radiansToDegrees(initialValue)
        : initialValue;

    return new BehaviorSubject(initial);
  });

  const [textEditValue, setTextEditValue] = useState(
    roundToPrecision(initialValue || 0, precisionToUse).toString()
  );
  const [editingText, setEditingText] = useState(false);

  useEffect(() => {
    if (locked) setEditingText(false);
  }, [locked]);

  const [invalidNumberError, setInvalidNumberError] = useState<string>();
  // need this internal state to avoid rerender. Yang, Feb 23, 2021
  const classes = useStyles();

  const fieldClass = useFieldClassForSize(size);

  const [formHelperText, setFormHelperText] = useState<string | undefined>(
    getFormHelperText({
      error,
      invalidNumberError,
      help,
    })
  );

  useEffect(() => {
    setFormHelperText(
      getFormHelperText({
        error,
        invalidNumberError,
        help,
      })
    );
  }, [error, invalidNumberError, help]);

  const [saveValue$] = useState(new Subject<number>());

  const isAngle$ = useBehaviorSubjectFromCurrentValue(!!isAngle);

  useEffect(() => {
    const subscription = saveValue$
      .pipe(
        throttleTime(500, asyncScheduler, {
          leading: false,
          trailing: true,
        }),
        withLatestFrom(isAngle$),
        map(([value, isAngle]) => (isAngle ? degreesToRadians(value) : value))
      )
      .subscribe({
        next: (value) => {
          saveValueToDB(value);
        },
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [isAngle$, saveValue$, saveValueToDB]);

  // eslint-disable-next-line
  const clamp = useClamp({
    min,
    max,
  });

  const [startDragX$] = useState(new Subject<number>());
  const [startDrag$] = useState(new Subject<void>());

  const [dragUpdates$] = useState(new Subject<number>());

  const [config$] = useState(
    () =>
      new BehaviorSubject<{
        clamp: (value: number) => number;
        precision: number;
        step: number;
      }>({
        clamp,
        precision: precisionToUse,
        step,
      })
  );

  const value = useCurrentValueFromBehaviorSubject(value$);

  const dragValueRef = useRef(roundToPrecision(value || 0, precisionToUse));

  // const dragValueRef = sourceValueRef || origValueRef;

  useEffect(() => {
    config$.next({
      clamp,
      precision: precisionToUse,
      step,
    });
  }, [clamp, config$, precisionToUse, step]);

  useEffect(() => {
    const startDragValue$ = startDrag$.pipe(
      withLatestFrom(value$),
      map(([, value]) => value),
      filterUndefined()
    );

    const startDragValueAndXAndConfig$ = combineLatest([
      startDragX$,
      startDragValue$,
      config$,
    ]);

    const dragValue$ = dragUpdates$.pipe(
      withLatestFrom(startDragValueAndXAndConfig$),
      map(
        ([pageX, [startDragX, startDragValue, { precision, clamp, step }]]) => {
          const diff = pageX - startDragX;
          const newValue = startDragValue + diff * step;
          const rounded = roundToPrecision(newValue, precision);
          const clamped = clamp(rounded);
          return clamped;
        }
      )
    );

    const subscription = dragValue$.subscribe({
      next: (dragValue) => {
        dragValueRef.current = dragValue;
        if (uniformDisplayValueRef) uniformDisplayValueRef.current = dragValue;
        if (dragValueChanged) {
          const updateValue = isAngle ? degreesToRadians(dragValue) : dragValue;
          dragValueChanged(updateValue);
        }
        saveValue$.next(dragValue);
        value$.next(dragValue);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    config$,
    dragUpdates$,
    dragValueRef,
    saveValue$,
    startDrag$,
    startDragX$,
    uniformDisplayValueRef,
    value$,
    dragValueChanged,
    isAngle,
  ]);

  const handleDragStarted = useCallback(
    (e: DragEvent) => {
      document.addEventListener("dragover", preventDefault);
      document.addEventListener("drop", preventDefault);

      startDrag$.next();
      startDragX$.next(e.pageX);
      setEditing && setEditing();
    },
    [startDrag$, startDragX$, setEditing]
  );

  const handleDrag = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.pageX === 0) return;
      dragUpdates$.next(e.pageX);
    },
    [dragUpdates$]
  );

  const handleDragEnd = useCallback(() => {
    document.removeEventListener("dragover", preventDefault);
    document.removeEventListener("drop", preventDefault);
    startDrag$.next();
    setDoneEditing && setDoneEditing();
    // handleUpdateFromDrag(currentDragValue);
  }, [startDrag$, setDoneEditing]);

  const handleTextEditChanged = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setTextEditValue(e.target.value);
    },
    []
  );

  const tryFinishEditingText = useCallback(() => {
    if (isValidNumber(textEditValue)) {
      saveValue$.next(+textEditValue);
      value$.next(+textEditValue);
      dragValueRef.current = +textEditValue;
      setInvalidNumberError(undefined);
      setEditingText(false);
      if (uniformDisplayValueRef)
        uniformDisplayValueRef.current = +textEditValue;

      setDoneEditing && setDoneEditing();
    } else {
      setInvalidNumberError("Invalid number");
    }
  }, [
    textEditValue,
    saveValue$,
    value$,
    dragValueRef,
    uniformDisplayValueRef,
    setDoneEditing,
  ]);

  const handleTextEditBlur = useCallback(() => tryFinishEditingText(), [
    tryFinishEditingText,
  ]);

  const handleLabelDoubleClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      setTextEditValue(roundToPrecision(value || 0, precisionToUse).toString());
      setEditingText(true);
      setEditing && setEditing();
    },
    [value, precisionToUse, setEditing]
  );

  const handleInputTextKeypress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.charCode === ENTER_KEY) {
        e.preventDefault();
        tryFinishEditingText();
      }
    },
    [tryFinishEditingText]
  );

  let input;

  const handleClicked = useCallback((e: MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!useUniform && typeof uniformDisplayValueRef?.current === "number") {
      value$.next(uniformDisplayValueRef?.current);
      dragValueRef.current = uniformDisplayValueRef?.current;
    }
  }, [useUniform, uniformDisplayValueRef, value$, dragValueRef]);
  // useEffect(() => {
  //   if (!useUniform && editingText) {
  //     setEditingText(false);
  //   }
  // }, [useUniform, editingText]);

  if (editingText) {
    input = (
      <input
        type="text"
        value={textEditValue}
        onChange={handleTextEditChanged}
        onBlur={handleTextEditBlur}
        onKeyPress={handleInputTextKeypress}
        className={clsx(classes.numberFieldSmall, fieldClass)}
        disabled={locked}
      />
    );
  } else if (useUniform) {
    input = (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a href="#" style={{ opacity: locked ? 0.1 : 0.5 }}>
        <animated.span>{uniformDisplayValueRef?.current}</animated.span>
      </a>
    );
  } else {
    input = (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <animated.a
        href="#"
        onClick={handleClicked}
        style={{
          cursor: locked ? undefined : "ew-resize",
          opacity: locked ? 0.5 : 1,
        }}
        onDragStart={handleDragStarted}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onDoubleClick={handleLabelDoubleClick}
      >
        <animated.span>{dragValueRef.current}</animated.span>
      </animated.a>
    );
  }

  if (noFormControl) {
    return input;
  }

  return (
    <FormControl
      className={clsx(classes.fieldMargin, fieldClass)}
      error={!!error || !!invalidNumberError}
    >
      {label && <LabelWithTooltip label={label} toolTip={description} />}
      {input}
      {formHelperText && (
        <FormHelperText id="standard-weight-helper-text">
          {formHelperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default NumberField;
