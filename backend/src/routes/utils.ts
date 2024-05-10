import { Context, Next } from 'hono';
import { verifyToken } from '../utils';
import { HTTPException } from 'hono/http-exception';
import { StatusCode } from 'hono/utils/http-status';

/**
 * Middleware to authenticate requests using JWT token
 * @param c The request context
 * @param next The next middleware function
 */
export async function authenticator(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    throw new HTTPException(401, { message: 'Authorization header not set' });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);

  c.set('jwtPayload', payload);
  await next();
}

/**
 * Returns a JSON response for API success
 * @param c The request context
 * @param msg The message to be sent in the response
 * @param data The data to be sent in the response
 * @param status The HTTP status code
 */
export function APIResponse(
  c: Context,
  msg: string,
  data: any,
  status: StatusCode
) {
  return c.json({ msg, data }, status);
}

/**
 * Returns a JSON response for API errors
 * @param c The request context
 * @param msg The error message to be sent in the response
 * @param err The error object
 * @param status The HTTP status code
 */
export function ERRResponse(
  c: Context,
  msg: string,
  err: any,
  status: StatusCode
) {
  return c.json({ msg, err }, status);
}
