import { execSync } from "child_process";

const globalTeardown = () => {
    try {
        execSync('rm ./prisma/*.testdb');
        execSync('rm ./prisma/*.testdb-journal');
    } catch (error) {
        console.log('No dbs deleted');
    }
}

export default globalTeardown;