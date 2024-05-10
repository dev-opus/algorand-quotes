import 'dotenv/config';
import bcrypt from 'bcryptjs'; // Corrected typo in import statement
import { sign, verify } from 'hono/jwt';

/**
 * Hashes a password using bcrypt
 * @param plain The plain text password
 * @returns The hashed password
 */
async function hashPassword(plain: string) {
  const salt = Number(process.env.SALT_FACTOR as string);
  const hashed = await bcrypt.hash(plain, salt);
  return hashed;
}

/**
 * Compares a plain text password with a hashed password
 * @param plain The plain text password
 * @param hashed The hashed password
 * @returns Boolean indicating whether the passwords match
 */
async function comparePassword(plain: string, hashed: string) {
  const isValid = await bcrypt.compare(plain, hashed);
  return isValid;
}

/**
 * Signs a JWT token
 * @param email The user's email address
 * @returns The signed JWT token
 */
async function signToken(email: string) {
  const payload = {
    sub: email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 24, // Expiry set to 24 hours
  };
  const token = await sign(payload, process.env.JWT_SECRET as string);
  return token;
}

/**
 * Verifies a JWT token
 * @param token The JWT token to verify
 * @returns The token payload if verification is successful
 */
async function verifyToken(token: string) {
  const payload = await verify(token, process.env.JWT_SECRET as string);
  return payload;
}

export { hashPassword, comparePassword, signToken, verifyToken };
