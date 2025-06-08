import { User } from '../generated/prisma';
import prisma from '../lib/prisma';
import { hashPassword, verifyPassword } from './password';

const createUser = async (user: User) => {
  user.password = await hashPassword(user.password);

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

  const isValid = await verifyPassword(passwordToVerify, user.password);
  if (!isValid) {
    return null;
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export { createUser, getUserByEmail, getUserByEmailWithoutPassword, verifyUser };
