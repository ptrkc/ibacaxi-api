import app from "../app.js";
import db from "../dbConfig.js";
import supertest from "supertest";

beforeAll(async () => {
    await db.query(`
        DELETE FROM categories;
        INSERT INTO categories (name) VALUES ('Smartphones'), ('Tablets'), ('Mouses');
    `);
});

afterAll(async () => {
    db.end();
});

describe("GET /categories", () => {
    it("returns an array of objects for valid params", async () => {
        const res = await supertest(app).get("/categories");

        expect(res.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: expect.any(String),
                }),
            ])
        );
    });
});
