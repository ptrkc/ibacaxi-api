import app from "../app.js";
import supertest from "supertest";
import db from "../dbConfig.js";

const token = "1446e02d-6a9c-457a-ac8c-2d012ec1064d";

beforeAll(async () => {
    await db.query(`
        DELETE FROM users;
        DELETE FROM sessions;
        INSERT INTO users (name, email, password) 
        VALUES ('Banânio Bananácio', 'bananio@bmail.com', '$2b$10$SprgUnx2K6H/qNpxfjShj.e4KGNdcp5XQu/mqZFinjfzVYOEzvPlG');
        INSERT INTO sessions ("userId", token) 
        VALUES ((SELECT id FROM users WHERE email = 'bananio@bmail.com'),'${token}');
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
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        const dbCheck = await db.query(
            `
            SELECT * FROM sessions WHERE sessions.token = $1`,
            [token]
        );
        expect(dbCheck.rows.length).toEqual(0);
    });

    it("returns 200 for valid token", async () => {
        await supertest(app)
            .post("/sign-out")
            .set("Authorization", `Bearer 000this-isnot-atoken000`)
            .expect(200);
    });

    it("returns 401 for authorization header", async () => {
        await supertest(app).post("/sign-out").expect(401);
    });
});
