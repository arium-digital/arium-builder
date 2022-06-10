export interface TokenFormat {
  mimeType: string;
  uri: string;
}

export interface LegacyTezosToken {
  contract: string;
  network: string;
  level: number;
  timestamp: string; // example: '2021-10-31T02:52:22Z',
  token_id: number;
  symbol: string; // 'OBJKT',
  name: string;
  decimals: 0;
  description: string;
  artifact_uri: string; // original url: 'ipfs://Qmc7sYaxhSNveV2WpzbFzCPd5s9NjrzGADuyWfKt5B16qa',
  display_uri: string; // display url: 'ipfs://QmZkHcRJpgFvQHbqvdhEd1oS68GejHLpeYN7qjZL7V12oA',
  thumbnail_uri: string; //'ipfs://QmNrhZHUaEqxhyLfqoq1mtHSipkWHeT31LNHb1QEbDHgnc',
  is_transferable: true;
  creators: string[];
  tags: string[];
  formats: TokenFormat[];
  token_info: {
    [key: string]: string; //'@@empty': 'ipfs://Qme9VEuBuyekQSkoHnEs213Bu3VmZR252wPB9g4FUF2kYq'
  };
}

export interface LegacyTezosTokenDetails extends LegacyTezosToken {
  supply: string; // '60'
  transfered: number;
}

export interface TezosTokenMetadata {
  symbol: string; // 'OBJKT',
  name: string;
  formats: TokenFormat[];
  creators: string[];
  decimals: 0;
  description: string;
  artifactUri: string; // original url: 'ipfs://Qmc7sYaxhSNveV2WpzbFzCPd5s9NjrzGADuyWfKt5B16qa',
  displayUri: string; // display url: 'ipfs://QmZkHcRJpgFvQHbqvdhEd1oS68GejHLpeYN7qjZL7V12oA',
  thumbnailUri: string; //'ipfs://QmNrhZHUaEqxhyLfqoq1mtHSipkWHeT31LNHb1QEbDHgnc',
  tags: string[];
}

export interface TezosTokenV2 {
  contract: {
    alias: string;
    address: string;
  };
  network: string;
  level: number;
  timestamp: string; // example: '2021-10-31T02:52:22Z',
  tokenId: string;
  metadata: TezosTokenMetadata;
  // is_transferable: true;
  // token_info: {
  //   [key: string]: string; //'@@empty': 'ipfs://Qme9VEuBuyekQSkoHnEs213Bu3VmZR252wPB9g4FUF2kYq'
  // };
}

export interface TezosTokenDetailsV2 extends TezosTokenV2 {
  totalSupply: string;
}

export type TezosTokenDetails = LegacyTezosTokenDetails | TezosTokenDetailsV2;

export type OwnedTezoToken = LegacyTezosToken & {
  balance: string; // '1'
};

export interface TezosAccountMetadata {
  type: "person";
  address: string;
  alias?: string | null;
  description?: string;
  site?: string;
  email?: string;
  twitter?: string;
  intagram?: string;
}
