import { z } from 'zod';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { selectRow, insertRow } from '../db';
import { HTTPException } from 'hono/http-exception';
import {
  createWallet,
  comparePassword,
  signToken,
  hashPassword,
} from '../utils';

const app = new Hono();

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post(
  '/',

  zValidator('json', schema, (result, c) => {
    if (!result.success) {
      return c.json({ msg: 'Invalid payload', err: result.error }, 400);
    }
  }),

  async (c) => {
    const userPayload = c.req.valid('json');
    const sql = `SELECT * FROM users WHERE email=?`;
    const params = [userPayload.email];
    const existingUser: any = await selectRow(sql, params);

    if (existingUser) {
      const valid = await comparePassword(
        userPayload.password,
        existingUser.password
      );

      if (!valid) {
        throw new HTTPException(401, {
          message: 'Authorization failed: Invalid email or password',
        });
      }
      const token = await signToken(existingUser.email);
      return c.json(
        {
          msg: 'user login',
          data: {
            accessToken: token,
            user: { ...existingUser, password: undefined },
          },
        },
        200
      );
    }

    if (!existingUser) {
      const hashedPassword = await hashPassword(userPayload.password);
      const walletData = await createWallet(userPayload.email, hashedPassword);

      const dateString = new Date().toISOString();

      const sql = `
      INSERT INTO users(email, password, address, algoBalance, walletId, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        userPayload.email,
        hashedPassword,
        walletData.address,
        walletData.algoBalance,
        walletData.walletId,
        dateString,
        dateString,
      ];

      await insertRow(sql, params);
      const user = (await selectRow(`SELECT * FROM users WHERE email=?`, [
        userPayload.email,
      ])) as any;

      const token = await signToken(user.email);
      return c.json(
        {
          msg: 'user signup',
          data: {
            accessToken: token,
            user: { ...user, password: undefined },
          },
        },
        201
      );
    }
  }
);

export default app;
