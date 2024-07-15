import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import auth from './routes/auth';
import faucet from './routes/faucet';
import misc from './routes/misc';
import quotes from './routes/quotes';

const envs = {
  salt: process.env.SALT_FACTOR,
  mnemonic: process.env.FAUCET_MNEMONIC,
  jwtSecret: process.env.JWT_SECRET,
  faucetAmaount: process.env.FAUCET_AMOUNT,
};

const app = new Hono();

app.use(cors({ origin: '*' }));
app.use(logger());

app.get('/', (c) => {
  return c.json({ msg: 'Hello Hono!', envs });
});

app.route('/users/auth', auth);
app.route('/wallet/faucet', faucet);
app.route('/misc', misc);
app.route('/quotes', quotes);

app.onError((err: any, c) => {
  console.log(err);
  console.log(err.res);
  return c.json({ errMsg: err.message }, err.status ? err.status : 500);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
