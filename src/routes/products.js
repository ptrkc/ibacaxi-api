import db from "../dbConfig.js";

export async function getProducts(req, res) {
    try {
        const { category, price } = req.query;

        let categoryQuery = "";
        if(category.length > 1) {
            categoryQuery = `AND "categoryId" = ${category[0]}`;
            for(let i = 1; i < category.length; i++) {
                categoryQuery += `OR "categoryId" = ${category[i]}`;
            }
        } else {
            categoryQuery = `AND "categoryId" = ${category}`;
        }
        
        const priceQuery = (
            price === "maior" ? `ORDER BY price DESC` : `ORDER BY price`
        ); 

        const query = `
            SELECT products.*, categories.name AS "categoryName"
            FROM products JOIN categories
            ON products."categoryId" = categories.id
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
