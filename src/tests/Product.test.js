import app from "../app.js";
import supertest from "supertest";
import db from "../dbConfig.js";

let testId;

beforeAll(async () => {
    await db.query(`
        DELETE FROM products;
    `);
    const insertProd = await db.query(`
    insert into products (name, category, image, quantity, brief, description, price )
    VALUES ('A Nice Product', 'Smartphone', 'assets/img/nice-product.jpg',
    10, 'Brief description', 'Bigger description', 1999) RETURNING id;
`);
    testId = insertProd.rows[0].id;
});

afterAll(async () => {
    await db.query(`
        DELETE FROM products;
    `);
    db.end();
});

describe("GET /product/:id", () => {
    it("returns 200 for valid id", async () => {
        const res = await supertest(app).get(`/product/${testId}`).expect(200);

        const dbCheck = await db.query(
            `
            SELECT * FROM products WHERE id = $1`,
            [testId]
        );
        expect(dbCheck.rows.length).toEqual(1);
        expect(res.body).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                name: "A Nice Product",
                category: "Smartphone",
                image: "assets/img/nice-product.jpg",
                quantity: 10,
                brief: "Brief description",
                description: "Bigger description",
                price: 1999,
            })
        );
    });

    it("returns 400 for invalid", async () => {
        await supertest(app).get("/product/1.9").expect(400);
    });

    it("returns 404 for inexistant id", async () => {
        await supertest(app).get("/product/99999").expect(404);

        const dbCheck = await db.query(
            `
            SELECT * FROM products WHERE id = 99999`
        );
        expect(dbCheck.rows.length).toEqual(0);
    });
});
