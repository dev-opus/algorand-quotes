import { z } from 'zod';
import { Hono } from 'hono';
import { authenticator } from './utils';
import { zValidator } from '@hono/zod-validator';
import { quotesService } from '../services';

const app = new Hono();

/**
 *
 * Schemas
 *
 */

const createSchema = z.object({
  author: z.string(),
  body: z.string(),
  image: z.string(),
  senderAddress: z.string(),
});

const tipSchema = z.object({
  senderAddress: z.string(),
  amount: z.number().gt(0),
  appId: z.number().gte(0),
  owner: z.string(),
});

const rateSchema = z.object({
  senderAddress: z.string(),
  appId: z.number().gte(0),
  rating: z.number().min(1).max(5),
});

const deleteSchema = z.object({
  senderAddress: z.string(),
  index: z.number().gte(0),
});

/**
 *
 * Routes
 *
 */

// get
app.get('/', async (c) => {
  const quotes = await quotesService.get();
  return c.json({ msg: 'successfully fetched quotes', data: quotes }, 200);
});

// create
app.post(
  '/',

  authenticator,

  zValidator('json', createSchema, (result, c) => {
    if (!result.success) {
      console.log({ err: result.error });
      return c.json({ msg: 'validation error', err: result.error }, 400);
    }
  }),

  async (c) => {
    const { senderAddress, author, body, image } = c.req.valid('json');
    const appId = await quotesService.create(senderAddress, {
      author,
      body,
      image,
    });

    return c.json(
      { msg: 'successfully created a quote', data: { appId } },
      201
    );
  }
);

// tip
app.post(
  '/tip',

  authenticator,
  zValidator('json', tipSchema, (result, c) => {
    if (!result.success) {
      return c.json({ msg: 'validation error', err: result.error }, 400);
    }
  }),

  async (c) => {
    const { senderAddress, amount, appId, owner } = c.req.valid('json');
    await quotesService.tip(senderAddress, amount, appId, owner);
    return c.json(
      { msg: 'successfully tipped a quote with appId: ' + appId, data: [] },
      200
    );
  }
);

// rate
app.post(
  '/rate',

  authenticator,

  zValidator('json', rateSchema, (result, c) => {
    if (!result.success) {
      return c.json({ msg: 'validation error', err: result.error }, 400);
    }
  }),

  async (c) => {
    const { senderAddress, appId, rating } = c.req.valid('json');
    await quotesService.rate(senderAddress, rating, appId);
    return c.json(
      { msg: 'successfully rated a quote with appId: ' + appId, data: [] },
      200
    );
  }
);

// delete
app.post(
  '/delete',

  authenticator,

  zValidator('json', deleteSchema, (result, c) => {
    if (!result.success) {
      return c.json({ msg: 'validation error', err: result.error }, 400);
    }
  }),

  async (c) => {
    const { senderAddress, index } = c.req.valid('json');
    await quotesService.delete(senderAddress, index);
    return c.json(
      { msg: 'successfully deleted a quote with appId: ' + index, data: [] },
      200
    );
  }
);

export default app;
