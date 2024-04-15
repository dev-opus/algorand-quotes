// import fs from 'node:fs';
// import path from 'node:path';
// import { base64ToUTF8String, utf8ToBase64String } from '.';
// import { selectRow } from '../db';
// import algosdk, { Transaction } from 'algosdk';
// import {
//   algodClient,
//   indexerClient,
//   kmdClient,
//   minRound,
//   quotesNote,
//   numGlobalBytes,
//   numGlobalInts,
//   numLocalBytes,
//   numLocalInts,
// } from '.';

// const approvalProgram = fs.readFileSync(
//   path.resolve('src', 'contracts', 'events_approval.teal'),
//   {
//     encoding: 'utf-8',
//   }
// );
// const clearProgram = fs.readFileSync(
//   path.resolve('src', 'contracts', 'events_clear.teal'),
//   {
//     encoding: 'utf-8',
//   }
// );

// type EventPayload = {
//   name: string;
//   image: string;
//   desc: string;
//   price: number;
// };

// type BookEventPayload = {
//   owner: string;
//   price: number;
//   count: number;
//   appId: number;
// };

// class Event {
//   name: string;
//   image: string;
//   desc: string;
//   price: number;
//   tickets_sold: number;
//   total_ratings: number;
//   num_of_times_rated: number;
//   num_of_times_flagged: number;
//   appId: number;
//   owner: string;

//   constructor(
//     name: string,
//     image: string,
//     desc: string,
//     price: number,
//     tickets_sold: number,
//     total_ratings: number,
//     num_of_times_rated: number,
//     num_of_times_flagged: number,
//     appId: number,
//     owner: string
//   ) {
//     this.name = name;
//     this.image = image;
//     this.desc = desc;
//     this.price = price;
//     this.tickets_sold = tickets_sold;
//     this.total_ratings = total_ratings;
//     this.num_of_times_rated = num_of_times_rated;
//     this.num_of_times_flagged = num_of_times_flagged;
//     this.appId = appId;
//     this.owner = owner;
//   }
// }

// /**
//  *
//  * Function to create an Event application on the blockchain
//  *
//  */
// export async function createEventAction(
//   senderAddress: string,
//   event: EventPayload
// ) {
//   console.log('Adding event...');

//   const suggestedParams = await algodClient.getTransactionParams().do();

//   // Compile programs
//   const compiledApprovalProgram = await compileProgram(approvalProgram);
//   const compiledClearProgram = await compileProgram(clearProgram);

//   // Build note to identify transaction later and required app args as Uint8Arrays
//   const note = new TextEncoder().encode(quotesNote);
//   const name = new TextEncoder().encode(event.name);
//   const image = new TextEncoder().encode(event.image);
//   const desc = new TextEncoder().encode(event.desc);
//   const price = algosdk.encodeUint64(event.price);

//   const appArgs = [name, image, desc, price];

//   // Create ApplicationCreateTxn
//   const txn = algosdk.makeApplicationCreateTxnFromObject({
//     from: senderAddress,
//     suggestedParams,
//     onComplete: algosdk.OnApplicationComplete.NoOpOC,
//     approvalProgram: compiledApprovalProgram,
//     clearProgram: compiledClearProgram,
//     numLocalInts: numLocalInts,
//     numLocalByteSlices: numLocalBytes,
//     numGlobalInts: numGlobalInts,
//     numGlobalByteSlices: numGlobalBytes,
//     note,
//     appArgs,
//   });

//   const sender = (await selectRow(`SELECT * FROM users where address=?`, [
//     senderAddress,
//   ])) as any;

//   const { confirmedTxn, txId } = await signAndSendTransaction(
//     sender.walletId,
//     sender.password,
//     txn
//   );

//   console.log(
//     'Transaction ' +
//       txId +
//       ' confirmed in round ' +
//       confirmedTxn['confirmed-round']
//   );

//   // Get created application id and notify about completion
//   let transactionResponse = await algodClient
//     .pendingTransactionInformation(txId)
//     .do();
//   let appId = transactionResponse['application-index'];
//   console.log('Created new app-id: ', appId);
//   return appId;
// }

// /**
//  *
//  * Function to buy a ticket on Event in the blockchain
//  *
//  */

// export async function bookEventAction(
//   senderAddress: string,
//   event: BookEventPayload
// ) {
//   const { owner, appId, count, price } = event;
//   console.log('Buying ticket...');

//   let suggestedParams = await algodClient.getTransactionParams().do();

//   // Build required app args as Uint8Array
//   let bookArg = new TextEncoder().encode('book');
//   let countArg = algosdk.encodeUint64(count);
//   let appArgs = [bookArg, countArg];

//   // Create ApplicationCallTxn
//   let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
//     from: senderAddress,
//     appIndex: appId,
//     onComplete: algosdk.OnApplicationComplete.NoOpOC,
//     suggestedParams,
//     appArgs: appArgs,
//   });

//   // Create PaymentTxn
//   let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
//     from: senderAddress,
//     to: owner,
//     amount: price * count,
//     suggestedParams,
//   });

//   const sender = (await selectRow(`SELECT * FROM users where address=?`, [
//     senderAddress,
//   ])) as any;

//   let txnArray = [appCallTxn, paymentTxn];
//   const txnGroup = algosdk.assignGroupID(txnArray);

//   const signedAppTxn = await kmdClient.signTransaction(
//     sender.walletId,
//     sender.password,
//     txnGroup[0]
//   );
//   const signedPymTxn = await kmdClient.signTransaction(
//     sender.walletId,
//     sender.password,
//     txnGroup[1]
//   );

//   const signedTxns = [signedAppTxn, signedPymTxn];
//   const { txId } = await algodClient.sendRawTransaction(signedTxns).do();

//   //Notify about completion
//   const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

//   console.log(
//     'Group transaction ' +
//       txId +
//       ' confirmed in round ' +
//       confirmedTxn['confirmed-round']
//   );
// }

// /**
//  *
//  * Function to delete an Event from the blockchain
//  *
//  */
// export async function deleteEventAction(senderAddress: string, index: number) {
//   console.log('Deleting application...');

//   let suggestedParams = await algodClient.getTransactionParams().do();

//   // Create ApplicationDeleteTxn
//   let txn = algosdk.makeApplicationDeleteTxnFromObject({
//     from: senderAddress,
//     suggestedParams,
//     appIndex: index,
//   });

//   const sender = (await selectRow(`SELECT * FROM users where address=?`, [
//     senderAddress,
//   ])) as any;

//   const { txId } = await signAndSendTransaction(
//     sender.walletId,
//     sender.password,
//     txn
//   );

//   // Get application id of deleted application and notify about completion
//   let transactionResponse = await algodClient
//     .pendingTransactionInformation(txId)
//     .do();
//   let appId = transactionResponse['txn']['txn'].apid;
//   console.log('Deleted app-id: ', appId);
// }

// /**
//  *
//  * Function to Get all Events from the blockchain
//  *
//  */

// export async function getEventsAction() {
//   console.log('Fetching events...');

//   // Get latest round for minRound filter
//   const latestRound = await getStatus();

//   console.log({ latestRound });

//   let note = new TextEncoder().encode(quotesNote);
//   let encodedNote = Buffer.from(note).toString('base64');

//   console.log({ encodedNote });

//   // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
//   let transactionInfo = await indexerClient
//     .searchForTransactions()
//     .minRound(latestRound)
//     .do();

//   console.log({ transactionInfo });

//   let events: Event[] = [];
//   console.log({ events });
//   for (const transaction of transactionInfo.transactions) {
//     let appId = transaction['created-application-index'];
//     if (appId) {
//       // Step 2: Get each application by application id
//       let event = await getApplication(appId);
//       if (event) {
//         events.push(event);
//       }
//     }
//   }
//   console.log('events fetched.');
//   return events;
// }

// /**
//  *
//  * Function to rate an Event on the blockchain
//  *
//  */

// export async function rateEventAction(
//   senderAddress: string,
//   appId: number,
//   rating: number
// ) {
//   const suggestedParams = await algodClient.getTransactionParams().do();

//   const rateArg = new TextEncoder().encode('rate');
//   const ratingArg = algosdk.encodeUint64(rating);
//   const appArgs = [rateArg, ratingArg];

//   const txn = algosdk.makeApplicationCallTxnFromObject({
//     from: senderAddress,
//     appIndex: appId,
//     onComplete: algosdk.OnApplicationComplete.NoOpOC,
//     suggestedParams,
//     appArgs,
//   });

//   const sender = (await selectRow(`SELECT * FROM users where address=?`, [
//     senderAddress,
//   ])) as any;

//   const { confirmedTxn } = await signAndSendTransaction(
//     sender.walletId,
//     sender.password,
//     txn
//   );

//   return confirmedTxn;
// }

// /**
//  *
//  * Function to flag an Event on the blockchain
//  *
//  */

// export async function flagEventAction(senderAddress: string, appId: number) {
//   console.log('Flagging event...');

//   const suggestedParams = await algodClient.getTransactionParams().do();

//   const flagArg = new TextEncoder().encode('flag');
//   const appArgs = [flagArg];

//   const txn = algosdk.makeApplicationCallTxnFromObject({
//     suggestedParams,
//     appIndex: appId,
//     onComplete: algosdk.OnApplicationComplete.NoOpOC,
//     appArgs,
//     from: senderAddress,
//   });

//   const sender = (await selectRow(`SELECT * FROM users where address=?`, [
//     senderAddress,
//   ])) as any;

//   const { confirmedTxn } = await signAndSendTransaction(
//     sender.walletId,
//     sender.password,
//     txn
//   );

//   return confirmedTxn;
// }

// /**
//  *
//  * Helpers
//  *
//  */

// const getStatus = async () => {
//   try {
//     const status = await algodClient.status().do();
//     const latestRound = status['last-round'];

//     if (!latestRound) {
//       return minRound;
//     }

//     return Number(latestRound) - 1000 || minRound;
//   } catch (error) {
//     console.error('Error getting status:', error);
//     throw error;
//   }
// };

// const getApplication = async (appId: number) => {
//   try {
//     // 1. Get application by appId
//     let response = await indexerClient
//       .lookupApplications(appId)
//       .includeAll(true)
//       .do();
//     if (response.application.deleted) {
//       return null;
//     }
//     let globalState = response.application.params['global-state'];

//     // 2. Parse fields of response and return event
//     let owner = response.application.params.creator;
//     let name = '';
//     let image = '';
//     let desc = '';
//     let price = 0;
//     let tickets_sold = 0;
//     let total_ratings = 0;
//     let num_of_times_rated = 0;
//     let num_of_times_flagged = 0;

//     function getField(fieldName: string, globalState: any) {
//       return globalState.find((state: any) => {
//         return state.key === utf8ToBase64String(fieldName);
//       });
//     }

//     if (getField('NAME', globalState) !== undefined) {
//       let field = getField('NAME', globalState).value.bytes;
//       name = base64ToUTF8String(field);
//     }

//     if (getField('IMAGE', globalState) !== undefined) {
//       let field = getField('IMAGE', globalState).value.bytes;
//       image = base64ToUTF8String(field);
//     }

//     if (getField('desc', globalState) !== undefined) {
//       let field = getField('desc', globalState).value.bytes;
//       desc = base64ToUTF8String(field);
//     }

//     if (getField('PRICE', globalState) !== undefined) {
//       price = getField('PRICE', globalState).value.uint;
//     }

//     if (getField('TICKETS_SOLD', globalState) !== undefined) {
//       tickets_sold = getField('TICKETS_SOLD', globalState).value.uint;
//     }
//     if (getField('TOTAL_RATINGS', globalState) !== undefined) {
//       total_ratings = getField('TOTAL_RATINGS', globalState).value.uint;
//     }
//     if (getField('NUM_OF_TIMES_RATED', globalState) !== undefined) {
//       num_of_times_rated = getField('NUM_OF_TIMES_RATED', globalState).value
//         .uint;
//     }
//     if (getField('NUM_OF_TIMES_FLAGGED', globalState) !== undefined) {
//       num_of_times_flagged = getField('NUM_OF_TIMES_FLAGGED', globalState).value
//         .uint;
//     }

//     return new Event(
//       name,
//       image,
//       desc,
//       price,
//       tickets_sold,
//       total_ratings,
//       num_of_times_rated,
//       num_of_times_flagged,
//       Number(appId),
//       owner
//     );
//   } catch (err) {
//     return null;
//   }
// };

// // Compile smart contract in .teal format to program
// async function compileProgram(programSource: string) {
//   let encoder = new TextEncoder();
//   let programBytes = encoder.encode(programSource);
//   let compileResponse = await algodClient.compile(programBytes).do();
//   return new Uint8Array(Buffer.from(compileResponse.result, 'base64'));
// }

// // Function to handle the signing and sending of transactions using algodClient and kmdClient
// async function signAndSendTransaction(
//   walletId: string,
//   password: string,
//   txn: Transaction
// ) {
//   try {
//     const res = await kmdClient.initWalletHandle(walletId, password);
//     const walletHandle = res.wallet_handle_token;

//     const signedTxn = await kmdClient.signTransaction(
//       walletHandle,
//       password,
//       txn
//     );
//     const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

//     // Wait for confirmation
//     const confirmedTxn = await algosdk.waitForConfirmation(
//       algodClient,
//       txId,
//       4
//     );

//     console.log(
//       'Transaction confirmed in round:',
//       confirmedTxn['confirmed-round']
//     );

//     return { confirmedTxn, txId };
//   } catch (error) {
//     console.error('Failed to sign and send transaction:', error);
//     throw error;
//   }
// }
