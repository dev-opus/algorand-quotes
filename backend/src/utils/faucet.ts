require('dotenv/config');
import algosdk from 'algosdk';
import { algodClient } from '.';

const FAUCET_MNEMONIC = process.env.FAUCET_MNEMONIC as string;

async function faucet(userAddress: string) {
  try {
    const faucetAccount = algosdk.mnemonicToSecretKey(FAUCET_MNEMONIC);
    const suggestedParams = await algodClient.getTransactionParams().do();

    const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: faucetAccount.addr,
      suggestedParams,
      to: userAddress,
      amount: Number.parseInt(process.env.FAUCET_AMOUNT as string),
      note: new Uint8Array(Buffer.from('Algorand Events Free Faucet:uv1')),
    });

    const signedTxn = ptxn.signTxn(faucetAccount.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

    const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
    return result;
  } catch (error: any) {
    console.error(`An error happend: ${error.message}`);
    throw error;
  }
}

export { faucet };
