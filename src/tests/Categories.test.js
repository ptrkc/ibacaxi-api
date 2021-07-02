import app from "../app.js";
import db from "../dbConfig.js";
import supertest from "supertest";

beforeAll(async () => {
    const insertProd = await db.query(`
    INSERT INTO products (name, category, image, quantity, brief, description, price )
    VALUES ('A Nice Product', 'Smartphone', 'assets/img/nice-product.jpg',
    10, 'Brief description', 'Bigger description', 1999);
`);
});

afterAll(async () => {
    await db.query(`
        DELETE FROM products;
    `);
    db.end();
});

describe("GET /categories", () => {
    it("returns an array of objects for valid params", async () => {
        const res = await supertest(app).get("/categories");

        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Smartphone",
                }),
            ])
        );
    });
});
