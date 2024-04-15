// import { Hono } from 'hono';
// import { authenticator } from './utils';
// import { z } from 'zod';
// import { zValidator } from '@hono/zod-validator';
// import {
//   getEventsAction,
//   createEventAction,
//   bookEventAction,
//   rateEventAction,
//   flagEventAction,
//   deleteEventAction,
// } from '../utils';

// const app = new Hono();

// /**
//  *
//  * Schemas
//  *
//  */

// const createSchema = z.object({
//   name: z.string(),
//   desc: z.string(),
//   image: z
//     .string()
//     .max(30, { message: 'image url too long, try entering a shorter one' }),
//   price: z.number().gt(0, { message: 'price must be greater than zero' }),
//   userAddress: z.string(),
// });

// const bookSchema = z.object({
//   userAddress: z.string(),
//   owner: z.string(),
//   appId: z.number().gte(0),
//   count: z.number().gt(0),
//   price: z.number().gt(0, { message: 'price must be greater than zero' }),
// });

// const rateSchema = z.object({
//   userAddress: z.string(),
//   appId: z.number().gte(0),
//   rating: z.number().min(1).max(5),
// });

// const deleteSchema = z.object({
//   userAddress: z.string(),
//   index: z.number().gte(0),
// });

// const flagSchema = z.object({
//   userAddress: z.string(),
//   appId: z.number().gte(0),
// });

// /**
//  *
//  * Routes
//  *
//  */

// app.get('/', async (c) => {
//   const events = await getEventsAction();
//   return c.json({ msg: 'successfully retrieved events', data: events }, 200);
// });

// app.post(
//   '/create',
//   authenticator,
//   zValidator('json', createSchema, (result, c) => {
//     if (!result.success) {
//       return c.json({ msg: 'validation error', err: result.error }, 400);
//     }
//   }),
//   async (c) => {
//     const payload = c.req.valid('json');
//     const createEventPayload = {
//       name: payload.name,
//       desc: payload.desc,
//       price: payload.price,
//       image: payload.image,
//     };

//     const appId = await createEventAction(
//       payload.userAddress,
//       createEventPayload
//     );

//     return c.json({ msg: 'Event successfully created', data: { appId } }, 201);
//   }
// );

// app.post(
//   '/book',
//   authenticator,
//   zValidator('json', bookSchema, (result, c) => {
//     if (!result.success) {
//       return c.json({ msg: 'validation error', err: result.error }, 400);
//     }
//   }),
//   async (c) => {
//     const payload = c.req.valid('json');
//     const bookEventPayload = {
//       owner: payload.owner,
//       price: payload.price,
//       count: payload.count,
//       appId: payload.appId,
//     };

//     await bookEventAction(payload.userAddress, bookEventPayload);
//     return c.json(
//       {
//         msg:
//           'successfully booked a ticket to the event with appId: ' +
//           payload.appId,
//       },
//       201
//     );
//   }
// );

// app.post(
//   '/rate',
//   authenticator,
//   zValidator('json', rateSchema, (result, c) => {
//     if (!result.success) {
//       return c.json({ msg: 'validation error', err: result.error }, 400);
//     }
//   }),
//   async (c) => {
//     const payload = c.req.valid('json');
//     await rateEventAction(payload.userAddress, payload.appId, payload.rating);

//     return c.json(
//       { msg: 'successfully rated an event with appId: ' + payload.appId },
//       200
//     );
//   }
// );

// app.post(
//   '/flag',
//   authenticator,
//   zValidator('json', flagSchema, (result, c) => {
//     if (!result.success) {
//       return c.json({ msg: 'validation error', err: result.error }, 400);
//     }
//   }),
//   async (c) => {
//     const payload = c.req.valid('json');
//     await flagEventAction(payload.userAddress, payload.appId);

//     return c.json(
//       { msg: 'successfully flagged an event with appId: ' + payload.appId },
//       200
//     );
//   }
// );

// app.post(
//   '/delete',
//   authenticator,
//   zValidator('json', deleteSchema, (result, c) => {
//     if (!result.success) {
//       return c.json({ msg: 'validation error', err: result.error }, 400);
//     }
//   }),
//   async (c) => {
//     const payload = c.req.valid('json');
//     await deleteEventAction(payload.userAddress, payload.index);

//     return c.json({
//       msg: 'successfully deleted an event with appId: ' + payload.index,
//     });
//   }
// );

// export default app;
