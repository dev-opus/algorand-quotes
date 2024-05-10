import { Hono } from 'hono';
import { authenticator } from './utils';
import { miscService } from '../services';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

/**
 * Schema for request query validation
 */
const schema = z.object({
  address: z.string(),
});

/**
 * Routes for fetching user and faucet analytics
 */
app.get(
  '/analytics/user',
  authenticator,
  zValidator('query', schema, (result, c) => {
    if (!result.success) {
      return c.json({ msg: 'validation error', err: result.error }, 400);
    }
  }),
  async (c) => {
    const payload = c.req.valid('query');
    const data = await miscService.getUserAnalytics(payload.address);

    return c.json({ msg: 'fetched user analytics', data: { ...data } }, 200);
  }
);

app.get(
  '/analytics/faucet',
  authenticator,
  zValidator('query', schema, (result, c) => {
    if (!result.success) {
      return c.json({ msg: 'validation error', err: result.error }, 400);
    }
  }),
  async (c) => {
    const payload = c.req.valid('query');
    const data = await miscService.getFaucetAnalytics(payload.address);

    return c.json({ msg: 'fetched faucet analytics', data: { ...data } }, 200);
  }
);

export default app;
