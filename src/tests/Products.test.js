import app from "../app.js";
import db from "../dbConfig.js";
import supertest from "supertest";

beforeAll(async () => {
    await db.query(`
        DELETE FROM products;
        DELETE FROM categories;
        INSERT INTO categories (name) VALUES ('Smartphones'), ('Tablets'), ('Mouses');
        INSERT INTO products (name, category, image, quantity, brief, description, price)
        VALUES
        ('iPhone 11', 'Smartphones', 'https://images-americanas.b2w.io/produtos/01/00/img/1611315/9/1611315984_1GG.jpg', 5, 'iPhone 11 (64gb)', 'iPhonezao massa demais!', 400000),
        ('iPhone 12', 'Smartphones', 'https://images-americanas.b2w.io/produtos/01/00/img/1611315/9/1611315984_1GG.jpg', 3, 'iPhone 12 (128gb)', 'iPhonezao mais massa ainda!', 600000),
        ('Mouse ergonômico', 'Mouses', 'https://images-americanas.b2w.io/produtos/01/00/img/1611315/9/1611315984_1GG.jpg', 7, 'Mouse ergonômico vertical', 'Mouse muito bonito!', 50000),
        ('Tablet', 'Tablets', 'https://images-americanas.b2w.io/produtos/01/00/img/1611315/9/1611315984_1GG.jpg', 10, 'Tablet Samsung', 'Tablet Samsung Galaxy', 200000);
    `);
});

afterAll(async () => {
    db.end();
});

describe("GET /products", () => {
    it("returns an array of objects for valid params", async () => {
        const res = await supertest(app).get("/products");

        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    category: expect.any(String),
                    image: expect.any(String),
                    quantity: expect.any(Number),
                    brief: expect.any(String),
                    description: expect.any(String),
                    price: expect.any(Number),
                })
            ])
        );
    });

    it("returns an array of objects of a specific category for category query", async () => {
        const res = await supertest(app).get("/products").query({ category: "Smartphones" });

        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    category: "Smartphones",
                    image: expect.any(String),
                    quantity: expect.any(Number),
                    brief: expect.any(String),
                    description: expect.any(String),
                    price: expect.any(Number),
                })
            ])
        );
    });

    it("returns an array of objects sorted out by price for price query", async () => {
        const res = await supertest(app).get("/products").query({ price: "higher" });

        expect(res.body[0].price).toBeGreaterThanOrEqual(res.body[1].price);
    });

    it("returns an empty array for category query with inexistent category", async () => {
        const res = await supertest(app).get("/products").query({ category: "Banana" });

        expect(res.body).toEqual([]);
    });
});