import app from "../app.js";
import db from "../dbConfig.js";
import supertest from "supertest";

beforeAll(async () => {
    await db.query(`
        DELETE FROM users;
        DELETE FROM sessions;
        INSERT INTO users (name, email, password) 
        VALUES ('Banânio Bananácio', 'bananio@bmail.com', '$2b$10$qkXdlVBGhyA53kOhktHysudu38Fup8ToM19rofT8Bi3WZXLEeABca');
    `);
});

afterAll(async () => {
    await db.query(`
        DELETE FROM users;
        DELETE FROM sessions;
    `);
    db.end();
});

describe("POST /sign-in", () => {
    it("returns 200 for valid params", async () => {
        const body = {
            email: "bananio@bmail.com",
            password: "bBb2@2nNa@an@a@!?!?",
        };
        const res = await supertest(app)
            .post("/sign-in")
            .send(body)
            .expect(200);

        expect(res.body).toEqual(
            expect.objectContaining({
                name: expect.any(String),
                token: expect.any(String),
            })
        );
        const dbCheck = await db.query(`
            SELECT sessions.id, sessions.token, users.email FROM sessions 
            JOIN users ON sessions."userId" = users.id 
            WHERE users.email = 'bananio@bmail.com'
        `);
        console.log(dbCheck.rows);
        expect(dbCheck.rows[0]).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                token: expect.any(String),
                email: "bananio@bmail.com",
            })
        );
    });

    it("returns 400 for bad email", async () => {
        const body = {
            email: "  bananio@bmail ",
            password: "bBb2@2nNa@an@a@!?!?",
        };
        await supertest(app).post("/sign-in").send(body).expect(400);
    });

    it("returns 400 for empty email", async () => {
        const body = {
            email: "     ",
            password: "bBb2@2nNa@an@a@!?!?",
        };
        await supertest(app).post("/sign-in").send(body).expect(400);
    });

    it("returns 400 for empty password", async () => {
        const body = {
            email: "bananio@bmail.com",
            password: "",
        };
        await supertest(app).post("/sign-in").send(body).expect(400);
    });

    it("returns 401 for wrong password", async () => {
        const body = {
            email: "bananio@bmail.com",
            password: "asdfasdfasdfasdf",
        };
        await supertest(app).post("/sign-in").send(body).expect(401);
    });

    it("returns 401 for wrong/inexistent email", async () => {
        const body = {
            email: "thisemail@isnotinthedatabase.com",
            password: "thiscanbeanything",
        };
        await supertest(app).post("/sign-in").send(body).expect(401);
    });

    it("returns 400 for no body", async () => {
        await supertest(app).post("/sign-in").expect(400);
    });
});
