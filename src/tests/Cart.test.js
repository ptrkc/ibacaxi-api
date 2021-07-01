import app from "../app.js";
import db from "../dbConfig.js";
import supertest from "supertest";
import jwt from 'jsonwebtoken';

const uuidToken = "c26bb280-cdd5-4dfe-9f8b-59b2dada886f";
const jwToken = "eyJhbGciOiJIUzI1NiJ9.YzI2YmIyODAtY2RkNS00ZGZlLTlmOGItNTliMmRhZGE4ODZm.K6KrU8_VsgB0Cbq7f4aiOSvsdLgp3C0eFop9BDkM7t8"
let productId;
let userId;

beforeAll(async () => {
    await db.query(`
        DELETE FROM products;
        DELETE FROM orders;
        DELETE FROM users;
        DELETE FROM sessions;
        INSERT INTO users (name, email, password) 
        VALUES ('Banânio Bananácio', 'bananio@bmail.com', '$2b$10$KnNtpPbovIneGGG0B3FRv.PFZHtX0Xqg4G7LZIH32LzV0vBrW9UjG');
    `);

    const insertSession = await db.query(`
        INSERT INTO sessions ("userId", token) 
        VALUES ((SELECT id FROM users WHERE email = 'bananio@bmail.com'),'${uuidToken}')
        RETURNING "userId"
    `);
    userId = insertSession.rows[0].userId;

    const insertProd = await db.query(`
        INSERT INTO products (name, category, image, quantity, brief, description, price )
        VALUES ('A Nice Product', 'Smartphone', 'assets/img/nice-product.jpg',
        10, 'Brief description', 'Bigger description', 1999) RETURNING id;
    `);
    productId = insertProd.rows[0].id;
});

afterAll(async () => {
    db.end();
});

describe("POST /cart", () => {
    it("returns status 401 for empty headers", async () => {
        const res = await supertest(app).post("/cart");

        expect(res.status).toEqual(401);
    });

    it("returns status 401 for invalid user/token", async () => {
        const res = await supertest(app)
            .post("/cart")
            .set("Authorization", `Bearer banana`);

        expect(res.status).toEqual(401);
    });

    it("returns status 400 for invalid body", async () => {
        const body = { productId: 0, quantity: 0 };

        const res = await supertest(app)
            .post("/cart")
            .send(body)
            .set("Authorization", `Bearer ${jwToken}`);

        expect(res.status).toEqual(400);
    });

    it("returns status 403 for quantity higher than product invetory", async () => {
        const body = { userId: userId, productId: productId, quantity: 11 };
       
        const res = await supertest(app)
            .post("/cart")
            .send(body)
            .set("Authorization", `Bearer ${jwToken}`);

        expect(res.status).toEqual(403);
    });

    it("returns status 200 for valid params", async () => {
        const body = { userId: userId, productId: productId, quantity: 1 };
       
        const firstTry = await supertest(app)
            .post("/cart")
            .send(body)
            .set("Authorization", `Bearer ${jwToken}`)
            .expect(200);

            const secondTry = await supertest(app)
            .post("/cart")
            .send(body)
            .set("Authorization", `Bearer ${jwToken}`);

        expect(secondTry.status).toEqual(200);
    });
});

describe("GET /cart", () => {
    it("returns status 401 for empty headers", async () => {
        const res = await supertest(app).get("/cart");

        expect(res.status).toEqual(401);
    });

    it("returns status 401 for invalid user/token", async () => {
        const res = await supertest(app)
            .get("/cart")
            .set("Authorization", `Bearer banana`);

        expect(res.status).toEqual(401);
    });

    it("returns an array of objects for valid params", async () => {        
        const res = await supertest(app)
            .get("/cart")
            .set("Authorization", `Bearer ${jwToken}`);

        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    userId: expect.any(Number),
                    productId: expect.any(Number),
                    closed: expect.any(Boolean),
                    productName: expect.any(String),
                    inventory: expect.any(Number),
                    price: expect.any(Number),
                    image: expect.any(String),
                    brief: expect.any(String),
                })
            ])
        );
    });
});

describe("PUT /cart", () => {
    it("returns status 401 for empty headers", async () => {
        const res = await supertest(app).put("/cart");

        expect(res.status).toEqual(401);
    });

    it("returns status 401 for invalid user/token", async () => {
        const res = await supertest(app)
            .put("/cart")
            .set("Authorization", `Bearer banana`);

        expect(res.status).toEqual(401);
    });

    it("returns status 400 for invalid body", async () => {
        const body = { productId: 0, quantity: 0 };

        const res = await supertest(app)
            .put("/cart")
            .send(body)
            .set("Authorization", `Bearer ${jwToken}`);

        expect(res.status).toEqual(400);
    });

    it("returns status 200 for valid params", async () => {
        const addCartBody = { userId: userId, productId: productId, quantity: 1 };

        const addCartProduct = await supertest(app)
            .post("/cart")
            .send(addCartBody)
            .set("Authorization", `Bearer ${jwToken}`)
            .expect(200);

        const updateCartBody = { productId: productId, quantity: 1 };

        const updateCartProduct = await supertest(app)
            .put("/cart")
            .send(updateCartBody)
            .set("Authorization", `Bearer ${jwToken}`);

        expect(updateCartProduct.status).toEqual(200);
    });
});