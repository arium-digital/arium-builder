export function getProtooUrl({
  domain,
  port,
  spaceId,
  userId,
  peerId,
  forceH264,
  forceVP9,
}: {
  domain: string;
  port?: string;
  spaceId: string;
  userId: string;
  peerId: string;
  forceH264: boolean;
  forceVP9: boolean;
}) {
  const formattedPort = port ? `:${port}` : "";

  let builtUrl = `wss://${domain}${formattedPort}/?spaceId=${spaceId}&peerId=${peerId}&userId=${userId}`;
  if (forceH264) builtUrl = `${domain}&forceH264=true`;
  else if (forceVP9) builtUrl = `${domain}&forceVP9=true`;

  return builtUrl;
}

export function getHttpUrl({
  domain,
  port,
}: {
  domain: string;
  port: string | undefined;
}) {
  const formattedPort = port ? `:${port}` : "";

  return `https://${domain}${formattedPort}`;
}
