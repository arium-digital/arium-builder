export const visualMassageSpaceIds = [
  "visual-massage",
  "tvm-w3",
  "testspacevm",
];

export const useShouldWeb3BeEnabled = ({ spaceId }: { spaceId: string }) => {
  return visualMassageSpaceIds.includes(spaceId);
};
