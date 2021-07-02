import app from "../app.js";
import db from "../dbConfig.js";
import supertest from "supertest";

const uuidToken = "c26bb280-cdd5-4dfe-9f8b-59b2dada886f";
const jwToken =
    "eyJhbGciOiJIUzI1NiJ9.YzI2YmIyODAtY2RkNS00ZGZlLTlmOGItNTliMmRhZGE4ODZm.K6KrU8_VsgB0Cbq7f4aiOSvsdLgp3C0eFop9BDkM7t8";
let orderId;
let userId;

beforeAll(async () => {
    await db.query(`
        DELETE FROM products;
        DELETE FROM cart;
        DELETE FROM users;
        DELETE FROM sessions;
        DELETE FROM orders;
        DELETE FROM "ordersProducts";
        INSERT INTO users (name, email, password) 
        VALUES ('Banânio Bananácio', 'bananio@bmail.com', '$2b$10$KnNtpPbovIneGGG0B3FRv.PFZHtX0Xqg4G7LZIH32LzV0vBrW9UjG');
    `);

    const insertSession = await db.query(`
        INSERT INTO sessions ("userId", token) 
        VALUES ((SELECT id FROM users WHERE email = 'bananio@bmail.com'),'${uuidToken}')
        RETURNING "userId"
    `);
    userId = insertSession.rows[0].userId;
});

afterAll(async () => {
    db.end();
});

beforeEach(async () => {
    const insertOrder = await db.query(
        `
    INSERT INTO orders (date,  "userId" , name, address, cc, expiration, total)
    VALUES (NOW(), $1, 'Bananio', 'Av Das Bananas', '1111222233334444', '12/29', 4975) RETURNING id;
`,
        [userId]
    );
    orderId = insertOrder.rows[0].id;
});

afterEach(async () => {
    await db.query(`
    DELETE FROM cart;
    DELETE FROM products;
    `);
});
describe("GET /order", () => {
    it("returns status 200 for valid params", async () => {
        const res = await supertest(app)
            .get(`/order?id=${orderId}`)
            .set("Authorization", `Bearer ${jwToken}`);

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            address: expect.any(String),
            date: expect.any(String),
            email: expect.any(String),
            name: expect.any(String),
            orderId: expect.any(Number),
            total: expect.any(Number),
        });
    });

    it("returns status 400 for no id", async () => {
        const res = await supertest(app)
            .get(`/order`)
            .set("Authorization", `Bearer ${jwToken}`);

        expect(res.status).toEqual(400);
    });

    it("returns status 404 for inexistent id", async () => {
        const res = await supertest(app)
            .get(`/order?id=9999`)
            .set("Authorization", `Bearer ${jwToken}`);

        expect(res.status).toEqual(404);
    });
});
