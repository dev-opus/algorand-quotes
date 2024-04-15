import 'dotenv/config';
import bycrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';

async function hashPassword(plain: string) {
  const salt = Number(process.env.SALT_FACTOR as string);
  const hashed = await bycrypt.hash(plain, salt);

  return hashed;
}

async function comparePassword(plain: string, hashed: string) {
  const isValid = await bycrypt.compare(plain, hashed);
  return isValid;
}

async function signToken(email: string) {
  const payload = {
    sub: email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 24,
  };
  const token = await sign(payload, process.env.JWT_SECRET as string);
  return token;
}

async function verifyToken(token: string) {
  const payload = await verify(token, process.env.JWT_SECRET as string);
  return payload;
}

export { hashPassword, comparePassword, signToken, verifyToken };
