import { ALGO_DECIMALS } from '.';
import BigNumber from 'bignumber.js';

export const base64ToUTF8String = (base64String: string) => {
  return Buffer.from(base64String, 'base64').toString('utf-8');
};

export const utf8ToBase64String = (utf8String: string) => {
  return Buffer.from(utf8String, 'utf8').toString('base64');
};

export const stringToMicroAlgos = (str: string) => {
  if (!str) return;
  let bigNumber = new BigNumber(str);
  return bigNumber.shiftedBy(ALGO_DECIMALS).toNumber();
};
