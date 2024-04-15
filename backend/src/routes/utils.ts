import { Context, Next } from 'hono';
import { verifyToken } from '../utils';
import { HTTPException } from 'hono/http-exception';
import { StatusCode } from 'hono/utils/http-status';

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

export function APIResponse(
  c: Context,
  msg: string,
  data: any,
  status: StatusCode
) {
  return c.json({ msg, data }, status);
}

export function ERRResponse(
  c: Context,
  msg: string,
  err: any,
  status: StatusCode
) {
  return c.json({ msg, err }, status);
}
