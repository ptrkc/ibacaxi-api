import db from "../dbConfig.js";

export async function getProducts(req, res) {
    try {
        const { category, price } = req.query;

        let categoryQuery = "";
        if(typeof(category) === "string") {
            categoryQuery = `AND category = '${category}'`;
        } else if (typeof(category) === "object") {
            categoryQuery = `AND category = '${category[0]}'`;
            for(let i = 1; i < category.length; i++) {
                categoryQuery += `OR category = '${category[i]}'`;
            }
        }
        
        const priceQuery = (
            price === "higher" ? `ORDER BY price DESC` : `ORDER BY price`
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