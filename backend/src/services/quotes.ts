import fs from 'node:fs';
import path from 'node:path';
import { selectRow, updateRow } from '../db';
import algosdk, {
  Transaction,
  algosToMicroalgos,
  microalgosToAlgos,
} from 'algosdk';
import {
  base64ToUTF8String,
  utf8ToBase64String,
  algodClient,
  indexerClient,
  kmdClient,
  minRound,
  numGlobalBytes,
  numGlobalInts,
  numLocalBytes,
  numLocalInts,
  quotesNote,
} from '../utils';
import { miscService } from '.';

/**
 *
 * Source Programs
 *
 */

const approvalProgram = fs.readFileSync(
  path.resolve('src', 'contracts', 'quotes_approval.teal'),
  {
    encoding: 'utf-8',
  }
);
const clearProgram = fs.readFileSync(
  path.resolve('src', 'contracts', 'quotes_clear.teal'),
  {
    encoding: 'utf-8',
  }
);

/**
 *
 * Types
 *
 */

type CreateQuotePayload = {
  author: string;
  body: string;
  image: string;
};

interface Quote extends CreateQuotePayload {
  tip_received: number;
  total_rating: number;
  times_rated: number;
  times_tipped: number;
  appId: number;
  owner: string;
}

/**
 *
 * Classes
 *
 */

class Quote implements Quote {
  constructor(params: Quote) {
    this.author = params.author;
    this.body = params.body;
    this.image = params.image;
    this.appId = params.appId;
    this.owner = params.owner;
    this.times_rated = params.times_rated;
    this.times_tipped = params.times_tipped;
    this.tip_received = params.tip_received;
    this.total_rating = params.total_rating;
  }
}

/**
 *
 * Functions
 *
 */

export const quotesService = {
  /**
   *
   * Create Quote
   *
   */
  async create(senderAddress: string, quote: CreateQuotePayload) {
    console.log('Adding Quote...');

    const suggestedParams = await algodClient.getTransactionParams().do();

    // Compile programs
    const compiledApprovalProgram = await compileProgram(approvalProgram);
    const compiledClearProgram = await compileProgram(clearProgram);

    const note = new TextEncoder().encode(quotesNote);
    const author = new TextEncoder().encode(quote.author);
    const body = new TextEncoder().encode(quote.body);
    const image = new TextEncoder().encode(quote.image);

    const appArgs = [author, body, image];

    // Create ApplicationCreateTxn
    const txn = algosdk.makeApplicationCreateTxnFromObject({
      from: senderAddress,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: compiledApprovalProgram,
      clearProgram: compiledClearProgram,
      numLocalInts: numLocalInts,
      numLocalByteSlices: numLocalBytes,
      numGlobalInts: numGlobalInts,
      numGlobalByteSlices: numGlobalBytes,
      note,
      appArgs,
    });

    const sender = (await selectRow(`SELECT * FROM users where address=?`, [
      senderAddress,
    ])) as any;

    const { txId } = await signAndSendTransaction(
      sender.walletId,
      sender.password,
      txn
    );

    // Get created application id and notify about completion
    let transactionResponse = await algodClient
      .pendingTransactionInformation(txId)
      .do();

    let appId = transactionResponse['application-index'];
    console.log('Created new app-id: ', appId);

    return appId;
  },

  /**
   *
   * Tip a Quote
   *
   */
  async tip(
    senderAddress: string,
    amount: number,
    appId: number,
    owner: string
  ) {
    console.log('Tipping a Quote...');

    const suggestedParams = await algodClient.getTransactionParams().do();

    const tipArg = new TextEncoder().encode('tip');
    const appArgs = [tipArg];

    // txn1 = app transaction
    const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
      from: senderAddress,
      appIndex: appId,
      suggestedParams,
      appArgs,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
    });

    // txn2 = payment transaction
    let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: senderAddress,
      to: owner,
      amount: algosToMicroalgos(amount),
      suggestedParams,
    });

    const sender = (await selectRow(`SELECT * FROM users where address=?`, [
      senderAddress,
    ])) as any;

    let txnArray = [appCallTxn, paymentTxn];
    const txnGroup = algosdk.assignGroupID(txnArray);

    const res1 = await kmdClient.initWalletHandle(
      sender.walletId,
      sender.password
    );
    const walletHandle1 = res1.wallet_handle_token;

    const signedAppTxn = await kmdClient.signTransaction(
      walletHandle1,
      sender.password,
      txnGroup[0]
    );

    const res2 = await kmdClient.initWalletHandle(
      sender.walletId,
      sender.password
    );
    const walletHandle2 = res2.wallet_handle_token;

    const signedPymTxn = await kmdClient.signTransaction(
      walletHandle2,
      sender.password,
      txnGroup[1]
    );

    const signedTxns = [signedAppTxn, signedPymTxn];
    const { txId } = await algodClient.sendRawTransaction(signedTxns).do();

    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      txId,
      4
    );

    const ownerBalance = (await miscService.getUserAnalytics(owner))
      .userBalance;
    const senderBalance = (await miscService.getUserAnalytics(senderAddress))
      .userBalance;
    const dateString = new Date().toISOString();

    await updateRow(
      `UPDATE users SET algoBalance=?, updatedAt=? WHERE address=?`,
      [ownerBalance, dateString, owner]
    );

    await updateRow(
      `UPDATE users SET algoBalance=?, updatedAt=? WHERE address=?`,
      [senderBalance, dateString, senderAddress]
    );

    //Notify about completion
    console.log(
      'Group transaction ' +
        txId +
        ' confirmed in round ' +
        confirmedTxn['confirmed-round']
    );
  },

  /**
   *
   * Rate a Quote
   *
   */
  async rate(senderAddress: string, rating: number, appId: number) {
    console.log('Rating a Quote...');
    const suggestedParams = await algodClient.getTransactionParams().do();

    const rateArg = new TextEncoder().encode('rate');
    const ratingArg = algosdk.encodeUint64(rating);
    const appArgs = [rateArg, ratingArg];

    const txn = algosdk.makeApplicationCallTxnFromObject({
      from: senderAddress,
      appIndex: appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams,
      appArgs,
    });

    const sender = (await selectRow(`SELECT * FROM users where address=?`, [
      senderAddress,
    ])) as any;

    const { confirmedTxn } = await signAndSendTransaction(
      sender.walletId,
      sender.password,
      txn
    );

    return confirmedTxn;
  },

  /**
   *
   * Get Quotes
   *
   */
  async get() {
    console.log('Getting Quotes...');

    // Get latest round for minRound filter
    const latestRound = await getStatus();

    // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
    const transactionInfo = await indexerClient
      .searchForTransactions()
      .minRound(latestRound)
      .do();

    const quotes: Quote[] = [];
    for (const transaction of transactionInfo.transactions) {
      let appId = transaction['created-application-index'];
      if (appId) {
        // Step 2: Get each application by application id
        let quote = await getApplication(appId);
        if (quote) {
          quotes.push(quote);
        }
      }
    }
    console.log('Quotes fetched.');
    return quotes;
  },

  /**
   *
   * Delete a Quote
   *
   */
  async delete(senderAddress: string, index: number) {
    console.log('Deleting Quote (application)...');

    let suggestedParams = await algodClient.getTransactionParams().do();

    // Create ApplicationDeleteTxn
    let txn = algosdk.makeApplicationDeleteTxnFromObject({
      from: senderAddress,
      suggestedParams,
      appIndex: index,
    });

    const sender = (await selectRow(`SELECT * FROM users where address=?`, [
      senderAddress,
    ])) as any;

    const { txId } = await signAndSendTransaction(
      sender.walletId,
      sender.password,
      txn
    );

    // Get application id of deleted application and notify about completion
    let transactionResponse = await algodClient
      .pendingTransactionInformation(txId)
      .do();
    let appId = transactionResponse['txn']['txn'].apid;
    console.log('Deleted app-id: ', appId, index);
  },
};

/**
 *
 * Helpers
 *
 */

async function getStatus() {
  try {
    const status = await algodClient.status().do();
    const latestRound = status['last-round'];

    if (!latestRound) {
      return minRound;
    }

    return Number(latestRound) - 1000 || minRound;
  } catch (error) {
    console.error('Error getting status:', error);
    throw error;
  }
}

async function getApplication(appId: number) {
  try {
    // 1. Get application by appId
    let response = await indexerClient
      .lookupApplications(appId)
      .includeAll(true)
      .do();
    if (response.application.deleted) {
      return null;
    }
    let globalState = response.application.params['global-state'];

    // 2. Parse fields of response and return event
    let owner = response.application.params.creator;
    let image = '';
    let body = '';
    let author = '';
    let tip_received = 0;
    let total_rating = 0;
    let times_rated = 0;
    let times_tipped = 0;

    function getField(fieldName: string, globalState: any) {
      return globalState.find((state: any) => {
        return state.key === utf8ToBase64String(fieldName);
      });
    }

    if (getField('AUTHOR', globalState) !== undefined) {
      let field = getField('AUTHOR', globalState).value.bytes;
      author = base64ToUTF8String(field);
    }

    if (getField('IMAGE', globalState) !== undefined) {
      let field = getField('IMAGE', globalState).value.bytes;
      image = base64ToUTF8String(field);
    }

    if (getField('BODY', globalState) !== undefined) {
      let field = getField('BODY', globalState).value.bytes;
      body = base64ToUTF8String(field);
    }
    if (getField('TIP_RECEIVED', globalState) !== undefined) {
      tip_received = getField('TIP_RECEIVED', globalState).value.uint;
    }

    if (getField('TOTAL_RATING', globalState) !== undefined) {
      total_rating = getField('TOTAL_RATING', globalState).value.uint;
    }

    if (getField('TIMES_RATED', globalState) !== undefined) {
      times_rated = getField('TIMES_RATED', globalState).value.uint;
    }

    if (getField('TIMES_TIPPED', globalState) !== undefined) {
      times_tipped = getField('TIMES_TIPPED', globalState).value.uint;
    }

    return new Quote({
      author,
      body,
      image,
      appId,
      owner,
      times_rated,
      times_tipped,
      tip_received: microalgosToAlgos(tip_received),
      total_rating,
    });
  } catch (err) {
    return null;
  }
}

// Compile smart contract in .teal format to program
async function compileProgram(programSource: string) {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await algodClient.compile(programBytes).do();
  return new Uint8Array(Buffer.from(compileResponse.result, 'base64'));
}

// Function to handle the signing and sending of transactions using algodClient and kmdClient
async function signAndSendTransaction(
  walletId: string,
  password: string,
  txn: Transaction
) {
  try {
    const res = await kmdClient.initWalletHandle(walletId, password);
    const walletHandle = res.wallet_handle_token;

    const signedTxn = await kmdClient.signTransaction(
      walletHandle,
      password,
      txn
    );
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(
      algodClient,
      txId,
      4
    );

    console.log(
      'Transaction confirmed in round:',
      confirmedTxn['confirmed-round']
    );

    return { confirmedTxn, txId };
  } catch (error) {
    console.error('Failed to sign and send transaction:', error);
    throw error;
  }
}
