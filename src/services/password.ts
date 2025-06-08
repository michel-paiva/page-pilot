import crypto from 'crypto';
import util from 'util';

const scrypt = util.promisify(crypto.scrypt);

export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const passwordHash = derivedKey.toString('base64');
  return `${salt}:${passwordHash}`;
};

export const verifyPassword = async (
  passwordToVerify: string,
  hashedPassword: string
): Promise<boolean> => {
  const [salt, passwordHash] = hashedPassword.split(':');
  const derivedKey = (await scrypt(passwordToVerify, salt, 64)) as Buffer;
  return derivedKey.toString('base64') === passwordHash;
};
