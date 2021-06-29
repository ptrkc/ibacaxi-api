import db from "../dbConfig.js";

export async function getProducts(req, res) {
    try {
        const products = await db.query(`SELECT * FROM products WHERE 1 = 1`);
        res.send(products.rows);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}
