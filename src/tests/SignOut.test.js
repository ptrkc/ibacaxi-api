import app from "../app.js";
import supertest from "supertest";
import db from "../dbConfig.js";
import jwt from 'jsonwebtoken';

const uuidToken = "c26bb280-cdd5-4dfe-9f8b-59b2dada886f";
const jwToken = "eyJhbGciOiJIUzI1NiJ9.YzI2YmIyODAtY2RkNS00ZGZlLTlmOGItNTliMmRhZGE4ODZm.K6KrU8_VsgB0Cbq7f4aiOSvsdLgp3C0eFop9BDkM7t8"

beforeAll(async () => {
    await db.query(`
        DELETE FROM users;
        DELETE FROM sessions;
        INSERT INTO users (name, email, password) 
        VALUES ('Banânio Bananácio', 'bananio@bmail.com', '$2b$10$KnNtpPbovIneGGG0B3FRv.PFZHtX0Xqg4G7LZIH32LzV0vBrW9UjG');
        INSERT INTO sessions ("userId", token) 
        VALUES ((SELECT id FROM users WHERE email = 'bananio@bmail.com'),'${uuidToken}');
    `);
});

afterAll(async () => {
    await db.query(`
        DELETE FROM users;
        DELETE FROM sessions;
    `);
    db.end();
});

describe("POST /sign-out", () => {
    it("returns 200 for valid token", async () => {
        await supertest(app)
            .post("/sign-out")
            .set("Authorization", `Bearer ${jwToken}`)
            .expect(200);

        const dbCheck = await db.query(`
            SELECT * FROM sessions WHERE sessions.token = $1`,
            [uuidToken]
        );
        expect(dbCheck.rows.length).toEqual(0);
    });

    it("returns 401 for invalid token", async () => {
        await supertest(app)
            .post("/sign-out")
            .set("Authorization", `Bearer 000-this-isnot-atoken-000`)
            .expect(401);
    });

    it("returns 401 for no authorization header", async () => {
        await supertest(app).post("/sign-out").expect(401);
    });
});
