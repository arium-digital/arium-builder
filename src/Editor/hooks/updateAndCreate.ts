import { useCallback, useEffect, useMemo, useState } from "react";
import { ObjectSchema } from "yup";
import { FormErrors } from "../types";
import { combineLatest, from, Observable, Subject } from "rxjs";
import {
  filter,
  mergeScan,
  // subscribeOn,
  switchMap,
  map,
  withLatestFrom,
  startWith,
  tap,
  first,
} from "rxjs/operators";
import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";
import {
  Update,
  NestedFormProp,
  UpdateDict,
  NestedFormPropWithUpdatedId,
} from "../components/Form";
import { filterUndefined } from "libs/rx";
import objectPath from "object-path";
import { cloneDeep } from "lodash";
import { DocumentRef } from "db";
import { setNullIfUndefined } from "libs/utils";
import { runValidation } from "./validation";
import throttledBuffer from "libs/throttledBuffer";
import { PushUndoItemFunction } from "./useUndo";
import { Optional } from "types";

const applyChanges = <T>(current: T, updates: UpdateDict): T => {
  const result = cloneDeep(current);

  Object.entries(updates).forEach(([path, change]) => {
    objectPath.set(result as Object, path, change);
  });

  return result;
};

export interface ValidationResultAndChanges<T> {
  current: T;
  validationResult?: {
    valid: boolean;
    errors: FormErrors<T>;
  };
  accumulatedChanges?: UpdateDict;
  changesToSave?: UpdateDict;
}

/**
 * Takes an observable of an intial value for an object,
 * and its validation schema.  It observes updates to the object
 * applying them to the object one by one.  Each time the update
 * is applied, it validates the object using the schema.  If the
 * object is deemed valid, the observed result will include
 * changes to save.  Otherwise, the observed result will include errors
 * The observed result also includes the updates object itself as `current`
 */
export const observeUpdatesAndValidate = <T>({
  initial$,
  updates$,
  schema,
}: {
  initial$: Observable<T>;
  updates$: Observable<UpdateDict>;
  schema: ObjectSchema | undefined;
}): Observable<ValidationResultAndChanges<T>> => {
  return initial$.pipe(
    switchMap((initial) => {
      const start: ValidationResultAndChanges<T> = {
        current: initial,
      };
      return updates$.pipe(
        mergeScan(
          async (
            acc: ValidationResultAndChanges<T>,
            updates
          ): Promise<ValidationResultAndChanges<T>> => {
            const updated = applyChanges(acc.current, updates);

            let validationResult;
            if (schema) {
              validationResult = await runValidation(updated, schema);
            } else {
              validationResult = {
                valid: true,
                errors: {},
              };
            }

            const allChanges = {
              ...(acc.accumulatedChanges || {}),
              ...updates,
            };

            if (validationResult.valid) {
              return {
                current: updated,
                validationResult,
                accumulatedChanges: {},
                changesToSave: allChanges,
              };
            } else {
              return {
                current: updated,
                validationResult,
                accumulatedChanges: allChanges,
              };
            }
          },
          start,
          1
        ),
        startWith({
          current: initial,
        })
      );
    })
  );
};

const observeIsNew$ = (ref: DocumentRef) => {
  return new Observable<boolean>((subscribe) => {
    const unsubscribe = ref.onSnapshot((querySnapshot) => {
      // once we get the element config, we dont need to continue updating,
      // as we dont keep the tree up to date (for now).
      if (querySnapshot.exists) {
        subscribe.next(false);
        subscribe.complete();
      } else {
        subscribe.next(true);
      }
    });

    // cleanup
    return () => {
      unsubscribe();
    };
  });
};

const observeFirstValue$ = <T>(
  ref: DocumentRef,
  converter?: (source: T) => T
) => {
  return new Observable<T>((subscribe) => {
    const unsubscribe = ref.onSnapshot(async (querySnapshot) => {
      // once we get the element config, we dont need to continue updating,
      // as we dont keep the tree up to date (for now).
      if (querySnapshot.exists) {
        const data = querySnapshot.data() as T;
        subscribe.next(converter ? converter(data) : data);
      } else {
        subscribe.next(undefined);
      }
    });

    // cleanup
    return () => {
      unsubscribe();
    };
  }).pipe(first());
};

/**
 * Provides a function that can trigger a validation and manual save if the validation
 * succeeds.  The saving wont be performed here, but a returned `save$` observable will
 * emit a value upon successful save requests (where validation passes).
 * @param valuesAndValidation$
 * @returns `save` function which can be used to trigger the manual save, and
 * save$ observable, which emits a value for each successful save request
 */
const useValidManualSaves = <T>(
  valuesAndValidation$: Observable<ValidationResultAndChanges<T> | undefined>
): {
  save: () => void;
  saves$: Observable<T>;
} => {
  const [save$] = useState(new Subject<void>());

  const [saves$] = useState(new Subject<T>());

  useEffect(() => {
    const sub = save$
      .pipe(
        withLatestFrom(valuesAndValidation$),
        map(([, valuesAndValidation]) => valuesAndValidation),
        filterUndefined(),
        filter(
          (valuesAndValidation) => !!valuesAndValidation.validationResult?.valid
        ),
        map((valuesAndValidation) => valuesAndValidation.current)
      )
      .subscribe(saves$);

    return () => {
      sub.unsubscribe();
    };
  }, [save$, saves$, valuesAndValidation$]);

  const save = useCallback(() => {
    save$.next();
  }, [save$]);

  return {
    save,
    saves$,
  };
};

type ValidateAndUpdateProps<T> = {
  /** Document to update, and to fetch initial value from the db */
  ref: Optional<DocumentRef>;
  /** Validation schema of object */
  initialValues?: T;
  schema: ObjectSchema | undefined;
  /** If should autosave when validation passes */
  autoSave: boolean;
  /** If set, transforms the value before saving */
  transformBeforeSave?: (value: T) => any;
  /** Default value if cannot fetch existing value from the db */
  defaultIfMissing?: () => T;
  /** If useUndo, pass this function to push latest change to undoStack */
  pushUndoItem?: PushUndoItemFunction;
  /** If true, it'll update if there's new changes */
  keepAlive?: boolean;
  /** if set, converts value when pulling from db */
  converter?: (value: T) => T;
};

type ValidateAndUpdateReturn<T> = {
  /** The form props to pass to the nested form */
  nestedForm: NestedFormPropWithUpdatedId<T> | null;
  /** Can be called to try to manually save the object, this will
   * also trigger validation, and if validation fails, will
   * not save
   */
  manualSave: () => void;
  /** If currently saving */
  saving: boolean;
  /** Observable of successful manual saves */
  saves$: Observable<T>;
};

const aggregateUpdates = (updates: UpdateDict[]) => {
  let result: UpdateDict = {};

  updates.forEach((update) => {
    result = {
      ...result,
      ...update,
    };
  });

  return result;
};

const useUpdates = () => {
  const [updates$] = useState(() => new Subject<UpdateDict>());

  const handleUpdates = useCallback(
    (updates: UpdateDict) => {
      if (updates$) updates$.next(updates);
    },
    [updates$]
  );

  const handleUpdate = useCallback(
    (update: Update) => {
      handleUpdates({
        [update.path]: update.change,
      });
    },
    [handleUpdates]
  );

  return {
    updates$,
    handleUpdates,
    handleUpdate,
  };
};

/**
 * Hook that fetches an initial value from a document reference,
 * and applies updates and validates the object after the updates are applied.
 * If autosave is set to true, then whenever the object is updated and
 * considered valid, the updates are saved to the db.
 * It also returns a function that can be used to manually save the updates.
 * @param param0
 * @returns
 */
export const useValidateAndUpdate = <T>({
  schema,
  ref,
  autoSave,
  transformBeforeSave,
  initialValues,
  defaultIfMissing,
  pushUndoItem,
  keepAlive,
  converter,
}: ValidateAndUpdateProps<T>): ValidateAndUpdateReturn<T> => {
  const [valuesAndValidation, setValuesAndValidation] = useState<
    (ValidationResultAndChanges<T> & { id: string }) | undefined
  >();

  const { updates$, handleUpdate, handleUpdates } = useUpdates();

  useEffect(() => {
    setValuesAndValidation(undefined);
  }, [ref]);

  const initialValues$ = useBehaviorSubjectFromCurrentValue(initialValues);
  const defaultIfMissing$ = useBehaviorSubjectFromCurrentValue(
    defaultIfMissing
  );

  const ref$ = useBehaviorSubjectFromCurrentValue(ref);

  useEffect(() => {
    const initialAndDefaults$ = combineLatest([
      initialValues$,
      defaultIfMissing$,
    ]);
    const initial$ = ref$.pipe(
      withLatestFrom(initialAndDefaults$),
      switchMap(([ref, [initial, defaults]]) => {
        if (!ref) return from([undefined]);
        if (initial)
          return from([
            {
              value: initial,
              id: ref.id,
            },
          ]);

        return observeFirstValue$(ref, converter).pipe(
          map((firstValue) => {
            if (firstValue) return firstValue;
            if (defaults) return defaults();
          }),
          map((value) => ({
            value,
            id: ref.id,
          }))
        );
      })
    );

    const sub = initial$
      .pipe(
        switchMap((initialValueAndId) => {
          if (!initialValueAndId || !initialValueAndId?.value)
            return from([undefined]);

          const initial$ = from([initialValueAndId.value]);

          return observeUpdatesAndValidate<T>({
            initial$,
            updates$,
            schema,
          }).pipe(
            map((values) => ({
              ...values,
              id: initialValueAndId.id,
            })),
            // start with undefined to make sure to clear out state when we get a new
            // initial
            startWith(undefined)
          );
        })
      )
      .subscribe(setValuesAndValidation);

    return () => {
      sub.unsubscribe();
    };
  }, [converter, defaultIfMissing$, initialValues$, ref$, schema, updates$]);

  const valuesAndValidation$ = useBehaviorSubjectFromCurrentValue(
    valuesAndValidation
  );

  useEffect(() => {
    if (!autoSave || !ref) return;
    const isNew$ = observeIsNew$(ref);
    const updates$ = valuesAndValidation$.pipe(
      map((values) => values?.changesToSave),
      filterUndefined(),
      throttledBuffer(1000),
      filter((x) => x.length > 0),
      map((updates) => {
        // aggregate all buffered updates
        return aggregateUpdates(updates);
      }),
      // filter out if no updates exist
      filter((x) => Object.keys(x).length > 0),
      map((aggregateUpdates) => setNullIfUndefined(aggregateUpdates))
    );

    const sub = updates$
      .pipe(withLatestFrom(isNew$, valuesAndValidation$))
      .subscribe({
        next: async ([updates, isNew, values]) => {
          // order matters, call this before updating the document
          if (pushUndoItem) {
            const current = await ref.get().then((res) => res.data());
            current && pushUndoItem(ref, current, updates, isNew);
          }
          if (isNew) {
            ref.set(updates);
          } else {
            ref.update(updates);
          }
        },
      });

    return () => {
      sub.unsubscribe();
    };
  }, [valuesAndValidation$, ref, autoSave, pushUndoItem]);

  const { save, saves$ } = useValidManualSaves(valuesAndValidation$);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const sub = saves$.subscribe({
      next: async (value) => {
        let toSave = transformBeforeSave ? transformBeforeSave(value) : value;
        setSaving(true);
        await ref.set(toSave);
        setSaving(false);
      },
    });

    return () => sub.unsubscribe();
  }, [saves$, ref, transformBeforeSave]);

  const [sourceValues, setSourceValues] = useState<T>();

  useEffect(() => {
    if (!ref) return;
    const sub = ref.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data() as T;
        const converted = converter ? converter(data) : data;
        setSourceValues(converted);
      } else {
        setSourceValues(undefined);
      }
    });

    return () => sub();
  }, [ref, converter]);

  const nestedForm: NestedFormPropWithUpdatedId<T> | null = useMemo(() => {
    if (!valuesAndValidation) return null;
    return {
      handleUpdate,
      handleUpdates,
      path: null,
      values: valuesAndValidation.current,
      sourceValues: sourceValues,
      errors: valuesAndValidation.validationResult?.errors,
      updatedId: valuesAndValidation.id,
    };
  }, [handleUpdate, handleUpdates, valuesAndValidation, sourceValues]);

  return {
    nestedForm,
    manualSave: save,
    saving,
    saves$,
  };
};

type ValidateAndCreateProps<T> = {
  /** The validation schema for the object */
  schema: ObjectSchema;
  /** Initial value for the object */
  initial: () => T;
  /** Callback for when save is triggered, and validation succeeds, this
   * will be invoked and can be used to save the object */
  handleSave: (toSave: T) => Promise<void>;
};

type ValidateAndCreateReturn<T> = {
  /** Props to pass to the nested form */
  nestedForm: NestedFormProp<T> | null;
  /** Triggered to start the save, which validates the updates
   * and will invoke `handleSave` if validation succeeds
   */
  manualSave: () => void;
};

/** Hook that is used to validate new object and save them.  It doesn't
 * actually perform the save, but takes a callback that is used to perform
 * the save on the outside.
 */
export const useValidateAndCreate = <T>({
  schema,
  initial,
  handleSave,
}: ValidateAndCreateProps<T>): ValidateAndCreateReturn<T> => {
  const { updates$, handleUpdate, handleUpdates } = useUpdates();

  const initialCreator$ = useBehaviorSubjectFromCurrentValue(initial);

  const [valuesAndValidation$] = useState(
    new Subject<ValidationResultAndChanges<T>>()
  );

  const [valuesAndValidation, setValuesAndValidation] = useState<
    ValidationResultAndChanges<T> | undefined
  >();

  useEffect(() => {
    if (!updates$) return;

    const initial$ = initialCreator$.pipe(map((creator) => creator()));

    const sub = observeUpdatesAndValidate<T>({
      initial$,
      updates$,
      schema,
    })
      .pipe(tap((x) => setValuesAndValidation(x)))
      .subscribe(valuesAndValidation$);

    return () => {
      sub.unsubscribe();
      updates$.complete();
    };
  }, [valuesAndValidation$, initialCreator$, schema, updates$]);

  const { save, saves$ } = useValidManualSaves(valuesAndValidation$);

  useEffect(() => {
    const sub = saves$.pipe(first()).subscribe({
      next: (toSave) => {
        handleSave(toSave);
      },
    });

    return () => {
      sub.unsubscribe();
    };
  }, [saves$, handleSave]);

  const nestedForm: NestedFormProp<T> | null = useMemo(() => {
    if (!valuesAndValidation) return null;
    return {
      handleUpdate,
      handleUpdates,
      path: null,
      values: valuesAndValidation.current,
      sourceValues: undefined,
      errors: valuesAndValidation.validationResult?.errors,
    };
  }, [handleUpdate, handleUpdates, valuesAndValidation]);

  return {
    nestedForm,
    manualSave: save,
  };
};
