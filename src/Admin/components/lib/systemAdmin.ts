import {
  RouterCountShard,
  PeerRouterCounts,
} from "../../../../shared/sharedTypes";

export interface AggregateCounts {
  routerCounts: PeerRouterCounts;
  spaceCounts: { [spaceId: string]: number };
}

export const toAggregateCounts = (
  routerShardCounts: RouterCountShard[]
): AggregateCounts => {
  const routerCounts: PeerRouterCounts = {};

  const spaceCounts: { [spaceId: string]: number } = {};

  routerShardCounts.forEach((routerShardCount) => {
    const { routerId } = routerShardCount;

    if (!routerCounts[routerId]) {
      routerCounts[routerId] = {
        bySpace: {},
        total: 0,
      };
    }

    Object.entries(routerShardCount).forEach(([key, value]) => {
      if (key !== "hostName" && key !== "routerId") {
        const spaceId = key;

        const ofRouter = routerCounts[routerId];

        ofRouter.total += +value;
        if (!ofRouter.bySpace[spaceId]) {
          ofRouter.bySpace[spaceId] = +value;
        } else {
          ofRouter.bySpace[spaceId] += +value;
        }

        if (!spaceCounts[spaceId]) {
          spaceCounts[spaceId] = +value;
        } else {
          spaceCounts[spaceId] += +value;
        }
      }
    });
  });

  return { routerCounts, spaceCounts };
};
