import db from "../dbConfig.js";

export async function getCategories(req, res) {
    try {
        const products = await db.query(`
            SELECT category AS name FROM products GROUP BY category
        `);
        return res.send(products.rows);
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }
}