import app from "../app.js";
import db from "../dbConfig.js";
import supertest from "supertest";

const uuidToken = "c26bb280-cdd5-4dfe-9f8b-59b2dada886f";
const jwToken =
    "eyJhbGciOiJIUzI1NiJ9.YzI2YmIyODAtY2RkNS00ZGZlLTlmOGItNTliMmRhZGE4ODZm.K6KrU8_VsgB0Cbq7f4aiOSvsdLgp3C0eFop9BDkM7t8";
let productId;
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
    const insertProd = await db.query(`
    INSERT INTO products (name, category, image, quantity, brief, description, price )
    VALUES ('A Nice Product', 'Smartphone', 'assets/img/nice-product.jpg',
    10, 'Brief description', 'Bigger description', 1999) RETURNING id;
`);
    productId = insertProd.rows[0].id;

    await db.query(
        `
    INSERT INTO cart ("userId", "productId", quantity)
    VALUES ($1, $2, 1)`,
        [userId, productId]
    );
});

afterEach(async () => {
    await db.query(`
    DELETE FROM cart;
    DELETE FROM products;
    `);
});
describe("POST /checkout", () => {
    it("returns status 200 for valid params", async () => {
        const body = {
            name: "Banânio Bananácio",
            address: "Av. das Bananas 2000",
            creditCard: "1111222233334444",
            expiration: "12/21",
            cvv: "123",
            totalPrice: 1999,
        };
        const res = await supertest(app)
            .post("/checkout")
            .send(body)
            .set("Authorization", `Bearer ${jwToken}`);

        const cart = await db.query(`SELECT * FROM cart`);
        const products = await db.query(`SELECT * FROM products WHERE id=$1`, [
            productId,
        ]);

        expect(res.status).toEqual(200);
        expect(cart.rows.length).toEqual(0);
        expect(products.rows[0].quantity).toEqual(9);
    });

    it("returns status 401 for no token", async () => {
        const body = {
            name: "Banânio Bananácio",
            address: "Av. das Bananas 2000",
            creditCard: "1111222233334444",
            expiration: "12/21",
            cvv: "123",
            totalPrice: 1999,
        };
        const res = await supertest(app).post("/checkout").send(body);

        expect(res.status).toEqual(401);
    });

    it("returns status 400 for cart bigger than inventory", async () => {
        await db.query(`UPDATE cart SET quantity = 11`);

        const body = {
            name: "Banânio Bananácio",
            address: "Av. das Bananas 2000",
            creditCard: "1111222233334444",
            expiration: "12/21",
            cvv: "123",
            totalPrice: 1999,
        };
        const res = await supertest(app)
            .post("/checkout")
            .send(body)
            .set("Authorization", `Bearer ${jwToken}`);

        const cart = await db.query(`SELECT * FROM cart`);
        const products = await db.query(`SELECT * FROM products WHERE id=$1`, [
            productId,
        ]);

        expect(res.status).toEqual(400);
        expect(cart.rows.length).toEqual(1);
        expect(products.rows[0].quantity).toEqual(10);
    });

    it("returns status 400 if cart total and totalPrice do not match", async () => {
        const body = {
            name: "Banânio Bananácio",
            address: "Av. das Bananas 2000",
            creditCard: "1111222233334444",
            expiration: "12/21",
            cvv: "123",
            totalPrice: 2000,
        };
        const res = await supertest(app)
            .post("/checkout")
            .send(body)
            .set("Authorization", `Bearer ${jwToken}`);

        const cart = await db.query(`SELECT * FROM cart`);
        const products = await db.query(`SELECT * FROM products WHERE id=$1`, [
            productId,
        ]);

        expect(res.status).toEqual(400);
        expect(cart.rows.length).toEqual(1);
        expect(products.rows[0].quantity).toEqual(10);
    });
});
