import db from "../dbConfig.js";

export async function getProducts(req, res) {
    try {
        const { category, price } = req.query;

        const categoryQuery = `AND "categoryId" = ${category}`;
        const priceQuery = (
            price === "maior" ? `ORDER BY price DESC` : `ORDER BY price`
        ); 

        const query = `
            SELECT * FROM products
            WHERE 1 = 1
            ${category ? categoryQuery : ""}
            ${price ? priceQuery : ""}
        `;

        const products = await db.query(query);
        res.send(products.rows);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}
