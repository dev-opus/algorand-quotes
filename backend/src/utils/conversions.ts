import { ALGO_DECIMALS } from '.'; // Assuming ALGO_DECIMALS is defined in another file
import BigNumber from 'bignumber.js';

/**
 * Converts a base64 encoded string to a UTF-8 string
 * @param base64String The base64 encoded string
 * @returns The UTF-8 string
 */
export const base64ToUTF8String = (base64String: string) => {
  return Buffer.from(base64String, 'base64').toString('utf-8');
};

/**
 * Converts a UTF-8 string to a base64 encoded string
 * @param utf8String The UTF-8 string
 * @returns The base64 encoded string
 */
export const utf8ToBase64String = (utf8String: string) => {
  return Buffer.from(utf8String, 'utf8').toString('base64');
};

/**
 * Converts a string to microAlgos
 * @param str The input string
 * @returns The microAlgos equivalent of the input string
 */
export const stringToMicroAlgos = (str: string) => {
  if (!str) return;
  let bigNumber = new BigNumber(str);
  return bigNumber.shiftedBy(ALGO_DECIMALS).toNumber();
};
