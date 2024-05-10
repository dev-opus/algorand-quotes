import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import auth from './routes/auth';
import faucet from './routes/faucet';
import misc from './routes/misc';
import quotes from './routes/quotes';

const app = new Hono();

// Middleware
app.use(cors({ origin: '*' })); // Enable CORS for all origins
app.use(logger()); // Enable logging

// Default route
app.get('/', (c) => {
  return c.json({ msg: 'Hello Hono!' }); // Return a simple hello message
});

// Routes
app.route('/users/auth', auth); // Authentication routes
app.route('/wallet/faucet', faucet); // Faucet routes
app.route('/misc', misc); // Miscellaneous routes
app.route('/quotes', quotes); // Quotes routes

// Error handling middleware
app.onError((err: any, c) => {
  console.log(err);
  console.log(err.res);
  return c.json({ errMsg: err.message }, err.status ? err.status : 500); // Return error message
});

const port = process.env.PORT || 3000; // Read port from environment variable, default to 3000 if not set
console.log(`Server is running on port ${port}`); // Log server start

// Start server
serve({
  fetch: app.fetch,
  port,
});
