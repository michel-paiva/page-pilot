import crypto from 'crypto';
import util from 'util';
import { User } from '../generated/prisma';
import prisma from '../lib/prisma';

const scrypt = util.promisify(crypto.scrypt);

const createUser = async (user: User) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(user.password, salt, 64)) as Buffer;
  const passwordHash = derivedKey.toString('base64');

  user.password = `${salt}:${passwordHash}`;

  const newUser = await prisma.user.create({
    data: user,
  });

  const { password, ...userWithoutPassword } = newUser;

  return userWithoutPassword;
};

const getUserByEmailWithoutPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user;
};

const verifyUser = async (email: string, passwordToVerify: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }
  const [salt, passwordHash] = user.password.split(':');
  const derivedKey = (await scrypt(passwordToVerify, salt, 64)) as Buffer;

  const { password, ...userWithoutPassword } = user;

  return derivedKey.toString('base64') === passwordHash ? userWithoutPassword : null;
};

export { createUser, getUserByEmail, getUserByEmailWithoutPassword, verifyUser };
