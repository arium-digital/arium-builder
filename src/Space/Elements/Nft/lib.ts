import { useBehaviorSubjectFromCurrentValue } from "hooks/useObservable";
import { useEffect, useState } from "react";
import { combineLatest, EMPTY, interval, merge, Subject } from "rxjs";
import { distinctUntilChanged, map, switchMap } from "rxjs/operators";
import { Auction } from "../../../../shared/nftTypes/superrare";
import { functions } from "db";
import { MediaType } from "../../../../shared/nftTypes";

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type { MediaType };

const getTimeRemainingFromDelta = (delta: number) => {
  // calculate (and subtract) whole days
  const days = Math.floor(delta / 86400);
  delta -= days * 86400;

  // calculate (and subtract) whole hours
  const hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;

  // calculate (and subtract) whole minutes
  const minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  // what's left is seconds
  const seconds = Math.round(delta % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
};

const getCurrentBlock = async () => {
  let blockNumber: number | null = null;

  try {
    const response = await functions().httpsCallable("getEthBlockNumber")();

    blockNumber = response.data.blockNumber;
  } catch (e) {
    console.error(e);
  }

  return blockNumber;
};

const blockDurationInSections = 13.2;

export const useTimeRemaining = ({ auction }: { auction: Auction }) => {
  const auction$ = useBehaviorSubjectFromCurrentValue(auction);

  const [timeRemaining$] = useState(() => new Subject<TimeRemaining>());

  useEffect(() => {
    const currentBlock$ = merge(
      getCurrentBlock(),
      interval(60 * 1000).pipe(switchMap(() => getCurrentBlock()))
    ).pipe(distinctUntilChanged());

    const sub = combineLatest([auction$, currentBlock$])
      .pipe(
        map(([auction, currentBlock]) => {
          if (!auction.lengthOfAuction) return;

          const lengthOfAuction = +auction.lengthOfAuction;

          if (currentBlock) {
            const startingBlock = auction.startingBlock;
            if (!startingBlock) return;

            const endingBlock = +startingBlock + lengthOfAuction;
            const blocksRemaining = endingBlock - currentBlock;

            // console.log({ blocksRemaining });

            const deltaInSeconds = blocksRemaining * blockDurationInSections;

            return deltaInSeconds;
          }
        }),
        switchMap((startingTimeRemaining) => {
          if (!startingTimeRemaining) return EMPTY;
          const startTime = new Date().getTime();

          return interval(1000).pipe(
            map(() => {
              const timeSinceStartTime =
                (new Date().getTime() - startTime) / 1000;
              const timeRemaining = startingTimeRemaining - timeSinceStartTime;
              return getTimeRemainingFromDelta(timeRemaining);
            })
          );
        })
      )
      .subscribe(timeRemaining$);

    return () => sub.unsubscribe();
  }, [timeRemaining$, auction$]);

  return timeRemaining$;
};
