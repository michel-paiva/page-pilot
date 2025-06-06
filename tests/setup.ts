import { execSync } from "child_process";

export const setupDb = (dbPath: string) => {
  process.env.DATABASE_URL = dbPath; 

  try {
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

const globalSetup = () => {
  setupDb('file:./test.testdb');
}

export default globalSetup;