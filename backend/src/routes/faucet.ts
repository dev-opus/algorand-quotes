import 'dotenv/config';
import { Hono } from 'hono';
import { authenticator } from './utils';
import { microalgosToAlgos } from 'algosdk';
import { algodClient, faucet } from '../utils';
import { insertRow, selectRow, selectRows, updateRow } from '../db';

const app = new Hono();

/**
 * Endpoint for requesting faucet
 */
app.post('/', authenticator, async (c) => {
  const jwtPayload = c.get('jwtPayload');
  const userEmail = jwtPayload.sub;

  // Fetch user data from the database
  const sql = `SELECT * FROM users WHERE email=?`;
  const params = [userEmail];
  const userData = (await selectRow(sql, params)) as any;

  // Check if the user has reached the maximum faucet limit
  const faucetRows = (await selectRows(
    `SELECT * FROM faucets WHERE address=?`,
    [userData.address]
  )) as any;
  if (faucetRows.length >= 10) {
    return c.json(
      { msg: 'cannot faucet, user reached max faucets already' },
      403
    );
  }

  // Request faucet for the user's address
  await faucet(userData.address);

  // Record faucet transaction in the database
  const dateString = new Date().toISOString();
  await insertRow(
    `INSERT INTO faucets(address, amount, createdAt) VALUES(?, ?, ?) `,
    [
      userData.address,
      microalgosToAlgos(Number.parseInt(process.env.FAUCET_AMOUNT as string)),
      dateString,
    ]
  );

  // Update user's balance in the database
  const accountInfo = await algodClient
    .accountInformation(userData.address)
    .do();
  const microAlgoBalance = accountInfo.amount as number;
  const algoBalance = microalgosToAlgos(microAlgoBalance);
  await updateRow(`UPDATE users SET algoBalance=?, updatedAt=? WHERE id=?`, [
    algoBalance,
    dateString,
    userData.id,
  ]);

  // Fetch faucet transaction record from the database
  const faucetRecord = (await selectRow(
    `SELECT * FROM faucets WHERE createdAt=?`,
    [dateString]
  )) as any;

  return c.json({ msg: 'faucet successful', data: faucetRecord });
});

export default app;
