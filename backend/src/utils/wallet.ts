import { algodClient, config, kmdClient } from '.';

/**
 *
 * Create a Wallet
 *
 */

async function createWallet(email: string, password: string) {
  try {
    const wallet = await kmdClient.createWallet(
      email,
      password,
      undefined,
      config.driver
    );

    const walletId = wallet.wallet.id;
    const walletData = await kmdClient.initWalletHandle(walletId, password);
    const walletHandle = walletData.wallet_handle_token;

    const account = await kmdClient.generateKey(walletHandle);

    const accountInfo = await algodClient
      .accountInformation(account.address)
      .do();

    return {
      address: account.address,
      algoBalance: accountInfo.amount,
      walletId,
    };
  } catch (error: any) {
    console.error(`An error happend: ${error.message}`);
    throw error;
  }
}

/**
 *
 * Recover a Wallet
 *
 */

async function recoverWallet(walletHandle: string, password: string) {
  try {
    const derivationData = await kmdClient.exportMasterDerivationKey(
      walletHandle,
      password
    );

    const exportedMDK = derivationData.master_derivation_key;

    const recoveredWallet = await kmdClient.createWallet(
      'genericName',
      password,
      exportedMDK,
      config.driver
    );

    const recoveredWalletId = recoveredWallet.wallet.id;
    const recoveredWalletData = await kmdClient.initWalletHandle(
      recoveredWalletId,
      password
    );

    const recoveredWalletHandle = recoveredWalletData.wallet_handle_token;
    const recoveredAccount = await kmdClient.generateKey(recoveredWalletHandle);

    const recoveredAccountInfo = await algodClient
      .accountInformation(recoveredAccount.address)
      .do();

    return {
      address: recoveredAccount.address,
      algoBalance: recoveredAccountInfo.amount,
      walletHandle: recoveredWalletHandle,
    };
  } catch (error: any) {
    console.error(`An error happend: ${error.message}`);
    throw error;
  }
}

export { createWallet, recoverWallet };
