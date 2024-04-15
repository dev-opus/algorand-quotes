import 'dotenv/config';
import { Hono } from 'hono';
import { authenticator } from './utils';
import { microalgosToAlgos } from 'algosdk';
import { algodClient, faucet } from '../utils';
import { insertRow, selectRow, selectRows, updateRow } from '../db';

const app = new Hono();

app.post('/', authenticator, async (c) => {
  const jwtPayload = c.get('jwtPayload');
  const userEmail = jwtPayload.sub;

  const sql = `SELECT * FROM users WHERE email=?`;
  const params = [userEmail];
  const userData = (await selectRow(sql, params)) as any;

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

  await faucet(userData.address);

  const dateString = new Date().toISOString();
  await insertRow(
    `INSERT INTO faucets(address, amount, createdAt) VALUES(?, ?, ?) `,
    [
      userData.address,
      microalgosToAlgos(Number.parseInt(process.env.FAUCET_AMOUNT as string)),
      dateString,
    ]
  );

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

  const faucetRecord = (await selectRow(
    `SELECT * FROM faucets WHERE createdAt=?`,
    [dateString]
  )) as any;

  return c.json({ msg: 'faucet successful', data: faucetRecord });
});

export default app;
