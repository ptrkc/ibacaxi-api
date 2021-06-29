import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

let dbConfig;
if (process.env.DATABASE_URL) {
    dbConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    };
} else {
    dbConfig = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database:
            process.env.NODE_ENV === "test"
                ? process.env.DB_TEST_DATABASE
                : process.env.DB_DATABASE,
    };
}

const db = new pg.Pool(dbConfig);

export default db;
