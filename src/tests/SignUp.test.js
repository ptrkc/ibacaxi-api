import app from "../app.js";
import supertest from "supertest";
import db from "../dbConfig.js";

const token = "1446e02d-6a9c-457a-ac8c-2d012ec1064d";

beforeAll(async () => {
    await db.query(`
        DELETE FROM users;
        INSERT INTO users (name, email, password) 
        VALUES ('Banânio Bananácio', 'bananio@bmail.com', '$2b$10$qkXdlVBGhyA53kOhktHysudu38Fup8ToM19rofT8Bi3WZXLEeABca');
    `);
});

afterAll(async () => {
    await db.query(`DELETE FROM users`);
    db.end();
});

describe("POST /sign-up", () => {
    it("returns 201 for valid params", async () => {
        const body = {
            name: "Juvenal Juvêncio",
            email: "juvenaljuvencio@test.com",
            password: "SenhaSecretaDoJuvenal123",
        };
        await supertest(app).post("/sign-up").send(body).expect(201);
        const res = await db.query(
            `SELECT * from users WHERE email = 'juvenaljuvencio@test.com'`
        );
        expect(res.rows.length).toEqual(1);
        expect(res.rows[0]).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                name: "Juvenal Juvêncio",
                email: "juvenaljuvencio@test.com",
                password: expect.any(String),
            })
        );
    });

    it("returns 400 for bad name", async () => {
        const body = {
            name: "<><<><",
            email: "bananio@bmail.com",
            password: "bBb2@2nNa@an@a@!?!?",
        };
        await supertest(app).post("/sign-up").send(body).expect(400);
    });

    it("returns 400 for empty name", async () => {
        const body = {
            name: "",
            email: "bananio@bmail.com",
            password: "bBb2@2nNa@an@a@!?!?",
        };
        await supertest(app).post("/sign-up").send(body).expect(400);
    });

    it("returns 400 for empty email", async () => {
        const body = {
            name: "Banânio Bananácio",
            email: "",
            password: "bBb2@2nNa@an@a@!?!?",
        };
        await supertest(app).post("/sign-up").send(body).expect(400);
    });

    it("returns 400 for bad email", async () => {
        const body = {
            name: "Banânio Bananácio",
            email: "bananio@bmail",
            password: "bBb2@2nNa@an@a@!?!?",
        };
        await supertest(app).post("/sign-up").send(body).expect(400);
    });

    it("returns 400 for empty password", async () => {
        const body = {
            name: "Banânio Bananácio",
            email: "bananio@bmail.com",
            password: "",
        };
        await supertest(app).post("/sign-up").send(body).expect(400);
    });

    it("returns 409 for email in use", async () => {
        const body = {
            name: "Banânio Bananácio",
            email: "bananio@bmail.com",
            password: "DoIAlreadyHaveAnAccount?",
        };
        await supertest(app).post("/sign-up").send(body).expect(409);
    });

    it("returns 400 for no body", async () => {
        await supertest(app).post("/sign-up").expect(400);
    });
});
