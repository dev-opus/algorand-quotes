import { algodClient, config, kmdClient } from '.';

/**
 * Create a Wallet
 * @param email User's email
 * @param password Wallet password
 * @returns Object containing wallet information
 */
async function createWallet(email: string, password: string) {
  try {
    // Create wallet
    const wallet = await kmdClient.createWallet(
      email,
      password,
      undefined,
      config.driver
    );

    // Initialize wallet handle
    const walletId = wallet.wallet.id;
    const walletData = await kmdClient.initWalletHandle(walletId, password);
    const walletHandle = walletData.wallet_handle_token;

    // Generate account
    const account = await kmdClient.generateKey(walletHandle);

    // Get account information
    const accountInfo = await algodClient
      .accountInformation(account.address)
      .do();

    return {
      address: account.address,
      algoBalance: accountInfo.amount,
      walletId,
    };
  } catch (error: any) {
    console.error(`An error happened: ${error.message}`);
    throw error;
  }
}

/**
 * Recover a Wallet
 * @param walletHandle Wallet handle
 * @param password Wallet password
 * @returns Object containing recovered wallet information
 */
async function recoverWallet(walletHandle: string, password: string) {
  try {
    // Export master derivation key
    const derivationData = await kmdClient.exportMasterDerivationKey(
      walletHandle,
      password
    );
    const exportedMDK = derivationData.master_derivation_key;

    // Create recovered wallet
    const recoveredWallet = await kmdClient.createWallet(
      'genericName',
      password,
      exportedMDK,
      config.driver
    );

    // Initialize recovered wallet handle
    const recoveredWalletId = recoveredWallet.wallet.id;
    const recoveredWalletData = await kmdClient.initWalletHandle(
      recoveredWalletId,
      password
    );
    const recoveredWalletHandle = recoveredWalletData.wallet_handle_token;

    // Generate account for recovered wallet
    const recoveredAccount = await kmdClient.generateKey(recoveredWalletHandle);

    // Get account information for recovered account
    const recoveredAccountInfo = await algodClient
      .accountInformation(recoveredAccount.address)
      .do();

    return {
      address: recoveredAccount.address,
      algoBalance: recoveredAccountInfo.amount,
      walletHandle: recoveredWalletHandle,
    };
  } catch (error: any) {
    console.error(`An error happened: ${error.message}`);
    throw error;
  }
}

export { createWallet, recoverWallet };
