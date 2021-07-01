import app from "../app.js";
import db from "../dbConfig.js";
import supertest from "supertest";

const token = "1446e02d-6a9c-457a-ac8c-2d012ec1064d";
let productId;
let userId;

beforeAll(async () => {
    await db.query(`
        DELETE FROM products;
        DELETE FROM orders;
        DELETE FROM users;
        DELETE FROM sessions;
        INSERT INTO users (name, email, password) 
        VALUES ('Banânio Bananácio', 'bananio@bmail.com', '$2b$10$SprgUnx2K6H/qNpxfjShj.e4KGNdcp5XQu/mqZFinjfzVYOEzvPlG');
    `);

    const insertSession = await db.query(`
        INSERT INTO sessions ("userId", token) 
        VALUES ((SELECT id FROM users WHERE email = 'bananio@bmail.com'),'${token}')
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
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toEqual(400);
    });

    it("returns status 403 for quantity higher than product invetory", async () => {
        const body = { userId: userId, productId: productId, quantity: 11 };

        const res = await supertest(app)
            .post("/cart")
            .send(body)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toEqual(403);
    });
});