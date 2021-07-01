import db from "../dbConfig.js";

export async function getSearchProducts(req, res) {
    try {
        console.log("oi")
        const { product } = req.query;
        console.log(product);

        const products = await db.query(`
            SELECT * FROM products
            WHERE name ILIKE $1||'%'
        `, [product]);

        return res.send(products.rows);
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }
}