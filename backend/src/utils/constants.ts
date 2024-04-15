require('dotenv/config');
import algosdk from 'algosdk';

export const ALGO_DECIMALS = 6;

export const config = {
  driver: 'sqlite',
  token: 'a'.repeat(64),
  server: 'http://localhost',
  kmdPort: 4002,
  algodPort: 4001,
  indexPort: 8980,
};

export const kmdClient = new algosdk.Kmd(
  config.token,
  config.server,
  config.kmdPort
);
export const algodClient = new algosdk.Algodv2(
  config.token,
  config.server,
  config.algodPort
);

export const indexerClient = new algosdk.Indexer(
  config.token,
  config.server,
  config.indexPort
);

export const minRound = 29556983;

export const quotesNote = 'algorand-quotes:uv1';

// Maximum local storage allocation, immutable
export const numLocalInts = 0;
export const numLocalBytes = 0;
// Maximum global storage allocation, immutable
export const numGlobalInts = 4; // Global variables stored as Int: count, sold
export const numGlobalBytes = 3; // Global variables stored as Bytes: name, description, image
