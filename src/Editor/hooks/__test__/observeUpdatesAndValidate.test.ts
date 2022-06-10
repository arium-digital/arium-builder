import { describe, expect, beforeEach } from "@jest/globals";
import { Update, UpdateDict } from "Editor/components/Form";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { scan, skip, take, takeLast } from "rxjs/operators";
import * as yup from "yup";
import {
  observeUpdatesAndValidate,
  ValidationResultAndChanges,
} from "../updateAndCreate";

interface Pet {
  name?: string;
  behavior?: {
    crankiness?: number;
    morning?: {
      tired?: boolean;
    };
    evening?: {
      sleepy?: boolean;
      alertLevel: number;
    };
  };
}

const petSchema = yup.object().shape({
  name: yup.string().required(),
  behavior: yup.object().shape({
    crankiness: yup.number(),
    morning: yup.object().shape({
      tired: yup.boolean(),
    }),
    evening: yup.object().shape({
      sleepy: yup.boolean(),
      alertLevel: yup.number(),
    }),
  }),
});

const toUpdateDict = (update: Update): UpdateDict => {
  return {
    [update.path]: update.change,
  };
};

describe("observeUpdatesAndValidate", () => {
  let initial$: Subject<Pet>;
  let updates$: Subject<UpdateDict>;
  let observed$: Observable<ValidationResultAndChanges<Pet>>;
  let resultReplay$: ReplaySubject<ValidationResultAndChanges<Pet>>;

  test("it emits the initial value on start with no updates", (done) => {
    const initial = {
      name: "charlie",
    };

    initial$ = new Subject<Pet>();
    updates$ = new Subject<UpdateDict>();
    observed$ = observeUpdatesAndValidate({
      initial$,
      updates$,
      schema: petSchema,
    });
    observed$.pipe(take(1)).subscribe({
      next: (result) => {
        expect(result.current).toStrictEqual(initial);
        expect(result.changesToSave).toBeUndefined();
        expect(result.validationResult).toBeUndefined();
        done();
      },
    });

    // seed initial value
    initial$.next(initial);
  });

  describe("when the updates are not valid", () => {
    const updates: Update[] = [
      // bad update
      {
        change: 5,
        path: "name",
      },
      // bad update
      {
        path: "behavior.crankiness",
        change: "charlie",
      },
      // good update (but still not valid)
      {
        path: "name",
        change: "Mika",
      },
      // good update
      {
        path: "behavior.crankiness",
        change: 3,
      },
    ];
    beforeEach(() => {
      initial$ = new Subject<Pet>();
      updates$ = new Subject<UpdateDict>();
      resultReplay$ = new ReplaySubject<ValidationResultAndChanges<Pet>>();
      observed$ = observeUpdatesAndValidate({
        initial$,
        updates$,
        schema: petSchema,
      });
      observed$.subscribe(resultReplay$);

      // seed initial value
      initial$.next({
        name: "charlie",
      });

      // apply all updates - resultReplay will be able to replay all emitted values
      updates.forEach((update) => updates$.next(toUpdateDict(update)));
    });
    afterEach(() => {
      initial$.complete();
      updates$.complete();
      resultReplay$.complete();
    });
    test("does not have changes", (done) => {
      resultReplay$.pipe(skip(1), take(2)).subscribe({
        next: (current) => {
          expect(current.validationResult?.valid).toBeFalsy();
          expect(current.changesToSave).toBeUndefined();
        },
        complete: () => done(),
      });
    });

    test("it still accumulates the value", (done) => {
      resultReplay$.pipe(skip(1), take(2), skip(1)).subscribe({
        next: (current) => {
          expect(current.current).toStrictEqual({
            name: 5,
            behavior: {
              crankiness: "charlie",
            },
          });
        },
        complete: () => done(),
      });
    });

    test("it emits changes when it becomes valid", (done) => {
      resultReplay$.pipe(skip(1), take(4), takeLast(1)).subscribe({
        next: (current) => {
          expect(current.validationResult?.valid).toBeTruthy();
          expect(current.current).toStrictEqual({
            name: "Mika",
            behavior: {
              crankiness: 3,
            },
          });
          expect(current.changesToSave).toStrictEqual({
            name: "Mika",
            "behavior.crankiness": 3,
          });
        },
        complete: () => done(),
      });
    });
  });

  describe("when the updates are valid", () => {
    const updates: Update[] = [
      {
        path: "name",
        change: "Mika",
      },
      {
        path: "behavior.crankiness",
        change: 2,
      },
      {
        path: "behavior.morning",
        change: {
          tired: true,
        },
      },
    ];

    beforeEach(() => {
      initial$ = new Subject<Pet>();
      updates$ = new Subject<UpdateDict>();
      resultReplay$ = new ReplaySubject<ValidationResultAndChanges<Pet>>();
      observed$ = observeUpdatesAndValidate({
        initial$,
        updates$,
        schema: petSchema,
      });
      observed$.subscribe(resultReplay$);

      initial$.next({
        name: "charlie",
      });

      updates.forEach((update) => updates$.next(toUpdateDict(update)));
    });

    afterEach(() => {
      initial$.complete();
      updates$.complete();
      resultReplay$.complete();
    });

    test("it accumulates the updates onto the current value", (done) => {
      resultReplay$.pipe(skip(1), skip(2)).subscribe({
        next: (result) => {
          expect(result.current).toStrictEqual({
            name: "Mika",
            behavior: {
              crankiness: 2,
              morning: {
                tired: true,
              },
            },
          });
          done();
        },
      });
    });

    test("it has the change to save in the changes to save on each update", (done) => {
      resultReplay$
        .pipe(
          skip(1),
          take(2),
          scan(
            (result: ValidationResultAndChanges<Pet>[], current) => [
              ...result,
              current,
            ],
            []
          ),
          skip(1)
        )
        .subscribe({
          next: (results) => {
            expect(results[0].changesToSave).toStrictEqual({
              [updates[0].path]: updates[0].change,
            });
            expect(results[1].changesToSave).toStrictEqual({
              [updates[1].path]: updates[1].change,
            });

            done();
          },
        });
    });
  });
});
