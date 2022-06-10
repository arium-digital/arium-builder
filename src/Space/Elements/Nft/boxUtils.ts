import { useEffect, useLayoutEffect, useState } from "react";
import { Box3, Mesh, Vector3 } from "three";
import { AuctionBid } from "../../../../shared/nftTypes/superrare";

export interface BoxResult {
  max: Vector3;
  min: Vector3;
  center: Vector3;
}

export const computeBoxFromMesh = (mesh: Mesh): BoxResult => {
  const bbox = new Box3();

  mesh.geometry.computeBoundingBox();

  bbox.copy(mesh.geometry.boundingBox as Box3);

  const center = new Vector3();
  const size = new Vector3();

  bbox.getCenter(center);

  bbox.getSize(size);

  const absCenter = center.clone().add(mesh.position);

  const halfSize = size.clone().multiplyScalar(0.5);

  return {
    max: absCenter.clone().add(halfSize),
    min: absCenter.clone().sub(halfSize),
    center: absCenter,
  };
};

export interface BoundingPlane {
  center: Vector3;
  size: Vector3;
}

export type Boxes = { [key: string]: BoxResult | undefined };

export const useBoundingPlane = ({
  boxes,
  setBoundingPlane,
  padding = 0,
}: {
  boxes: Boxes;
  setBoundingPlane?: (boundingPlane: BoundingPlane) => void;
  padding?: number;
}) => {
  const [planeParams, setPlaneParams] = useState<BoundingPlane>();
  const [showPlane, setShowPlane] = useState(false);

  useLayoutEffect(() => {
    setShowPlane(false);
    setTimeout(() => {
      setShowPlane(true);
    }, 100);
  }, [planeParams]);
  useLayoutEffect(() => {
    const boxValues = Object.values(boxes).filter((x) => !!x) as BoxResult[];

    if (boxValues.length === 0) {
      setPlaneParams(undefined);
      return;
    }

    const min = minVectors(boxValues.map(({ min }) => min)).addScalar(-padding);
    const max = maxVectors(boxValues.map(({ max }) => max)).addScalar(padding);

    const size = max.clone().sub(min);
    const center = min.clone().add(size.clone().multiplyScalar(0.5));

    setPlaneParams({
      size,
      center,
    });
  }, [boxes, padding]);

  useEffect(() => {
    setBoundingPlane && planeParams && setBoundingPlane(planeParams);
  }, [planeParams, setBoundingPlane]);

  return { planeParams, showPlane };
};

const minVectors = (vectors: Vector3[]) => {
  return new Vector3(
    Math.min(...vectors.map((vector) => vector.x)),
    Math.min(...vectors.map((vector) => vector.y)),
    Math.min(...vectors.map((vector) => vector.z))
  );
};

const maxVectors = (vectors: Vector3[]) => {
  return new Vector3(
    Math.max(...vectors.map((vector) => vector.x)),
    Math.max(...vectors.map((vector) => vector.y)),
    Math.max(...vectors.map((vector) => vector.z))
  );
};

const toEthValue = (value: number) => value / 1000000000000000000;

export const toFormattedEthString = (value: number) =>
  `${toEthValue(value)}ETH`;

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const toUsdAmount = (amount: number) => formatter.format(amount);

export const toFormattedEthAndUsdString = (eth: number, usd?: number) => {
  const usdString = usd ? ` ${toUsdAmount(usd)}` : "";
  return `${toEthValue(eth)}ETH${usdString}`;
};

export const formatBid = (bid: AuctionBid) => {
  return `@${bid.bidder.username} made an offer of ${toFormattedEthString(
    bid.amount
  )}`;
};

export const formatCurrentBid = (bid: AuctionBid) => {
  return `${toFormattedEthString(bid.amount)} by @${bid.bidder.username}`;
};
