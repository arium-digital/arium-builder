import { useMemo } from "react";
import { useStyles } from "../../styles";
import { useChangeHandlers } from "Editor/hooks/useChangeHandlers";

export { useChangeHandlers };

export function updateOrDelete<T, K extends keyof T>(
  values: T,
  prop: K,
  value?: T[K]
) {
  if (typeof value === "undefined") {
    const toUpdate = {
      ...values,
    };
    delete toUpdate[prop];

    return toUpdate;
  }
  return {
    ...values,
    [prop]: value,
  };
}

export const buildChangedHandler = <T, K extends keyof T>(
  values: T,
  handleChanged: (newValues: T) => void
) => {
  return (prop: K) => (value?: T[K]) => {
    handleChanged(updateOrDelete(values, prop, value));
  };
};

export type AggregateResultDict = {
  [key: string]: {
    value: any;
    valid: boolean;
  };
};

export const aggregateUpdates = (
  existing: AggregateResultDict = {},
  { path, valid, value }: PartialUpdate
) => {
  return {
    ...existing,
    [path.join(".")]: {
      valid,
      value,
    },
  };
};

export interface PartialUpdate {
  path: string[];
  value: any;
  valid: boolean;
}

// export const useAutoSaveAndValidate = <T>({
//   schema,
//   initial,
//   autoSave,
//   handleSave,
// }: {
//   schema: ObjectSchema;
//   initial: T;
//   autoSave: boolean;
//   handleSave: (values: T) => void;
// }) => {
//   const [errors, setErrors] = useState<FormErrors<T>>({});
//   const [values, setValues] = useState(initial);

//   const [changes$] = useState(new Subject<{ path: string[]; value: any }>());

//   const takeUntilUnmount = useTakeUntilUnmount();

//   const autoSave$ = useBehaviorSubjectFromCurrentValue(autoSave);
//   const schema$ = useBehaviorSubjectFromCurrentValue(schema);

//   const [valuesAndValidation$] = useState(
//     new Subject<{
//       values: T;
//       validationResult: {
//         valid: boolean;
//         errors: FormErrors<T>;
//       };
//     }>()
//   );

//   // useEffect(() => {
//   //   console.log('updated values', values);
//   // }, [values]);

//   useEffect(() => {
//     const values$ = changes$.pipe(
//       scan((acc: T, change: Partial<T>): T => {
//         const key = Object.keys(change)[0];
//         // @ts-ignore
//         const val = change[key];
//         // @ts-ignore
//         return updateOrDelete(acc, key, val);
//       }, initial)
//     );

//     values$
//       .pipe(
//         tap((values) => setValues(values)),
//         // tap((values) => console.log('aggregate', values)),
//         withLatestFrom(schema$),
//         switchMap(async ([values, schema]) => {
//           const validationResult = await runValidation(values, schema);

//           return {
//             validationResult,
//             values,
//           };
//         }),
//         tap(
//           ({ validationResult }) => setErrors(validationResult.errors),
//           takeUntilUnmount()
//         )
//       )
//       .subscribe(valuesAndValidation$);
//   }, [changes$, initial, schema$, takeUntilUnmount, valuesAndValidation$]);

//   useEffect(() => {
//     combineLatest([autoSave$, valuesAndValidation$])
//       .pipe(
//         // if autosave
//         filter(
//           ([autoSave, { validationResult }]) =>
//             autoSave && validationResult.valid
//         ),
//         takeUntilUnmount()
//       )
//       .subscribe({
//         next: ([, { values }]) => handleSave(values),
//       });
//   }, [autoSave$, handleSave, takeUntilUnmount, valuesAndValidation$]);

//   const [saveRequests$] = useState(new Subject<void>());

//   const handleManualSave = useCallback(
//     async (e: SyntheticEvent) => {
//       e.preventDefault();
//       saveRequests$.next();
//     },
//     [saveRequests$]
//   );

//   useEffect(() => {
//     saveRequests$
//       .pipe(
//         withLatestFrom(valuesAndValidation$),
//         filter(([, { validationResult }]) => validationResult.valid),
//         takeUntilUnmount()
//       )
//       .subscribe({
//         next: ([, { values }]) => handleSave(values),
//       });
//   }, [handleSave, saveRequests$, takeUntilUnmount, valuesAndValidation$]);

//   // const [changeHandlers, setChangeHandlers] = useState<ChangeHandlers<T>>({});

//   const handleUpdate = useCallback(
//     (path: string[], value: any, errors: FormErrors<any> | null) => {
//       changes$.next({ path, value });
//     },
//     [changes$]
//   );

//   return {
//     handleManualSave,
//     values,
//     handleUpdate,
//   };
// };

export type FieldSize = "sm" | "md" | "lg" | "xl" | "fullWidth";

export const useFieldClassForSize = (size: FieldSize) => {
  const classes = useStyles();

  const fieldClass = useMemo(() => {
    if (size === "sm") return classes.numberFieldSmall;
    if (size === "md") return classes.numberFieldMedium;
    if (size === "lg") return classes.numberFieldLarge;
    if (size === "xl") return classes.numberFieldExtraLarge;
    return classes.fullWidth;
  }, [size, classes]);

  return fieldClass;
};
