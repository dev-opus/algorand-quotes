import { quotesService } from '.';
import { selectRows } from '../db';
import { algodClient } from '../utils';
import { microalgosToAlgos } from 'algosdk';

export const miscService = {
  /**
   *
   * Get user analytics
   *
   */

  async getUserAnalytics(senderAddress: string) {
    const accountInfo = await algodClient
      .accountInformation(senderAddress)
      .do();

    const microAlgoBalance = accountInfo.amount as number;
    const algoBalance = microalgosToAlgos(microAlgoBalance);

    const quotes = await quotesService.get();

    const userQuotes = quotes.map((quote) => {
      if (quote.owner === senderAddress) {
        return quote;
      }
    });

    let numOfQuotes = userQuotes.length;
    let timesTipped = 0;
    let tipAlgos = 0;
    let timesRated = 0;
    let ratingScore = 0;

    for (let i = 0; i < userQuotes.length; i++) {
      timesRated += userQuotes[i]?.times_rated as number;
      timesTipped += userQuotes[i]?.times_tipped as number;
      tipAlgos += userQuotes[i]?.tip_received as number;
      ratingScore += userQuotes[i]?.total_rating as number;
    }

    return {
      numOfQuotes,
      timesRated,
      timesTipped,
      tipAlgos,
      ratingScore,
      userBalance: algoBalance.toString(),
    };
  },

  /**
   *
   * Get Faucet Analytics
   *
   */

  async getFaucetAnalytics(senderAddress: string) {
    const faucetRows = (await selectRows(
      `SELECT * FROM faucets WHERE address=?`,
      [senderAddress]
    )) as any;

    console.log(faucetRows);
    const faucetsDone = faucetRows.length;

    let faucetAlgos = 0;
    for (let i = 0; i < faucetRows.length; i++) {
      faucetAlgos += Number(faucetRows[i].amount);
    }

    return { faucetAlgos, faucetsDone };
  },
};
