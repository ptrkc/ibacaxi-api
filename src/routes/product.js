import db from "../dbConfig.js";
import { integerValidation } from "../functions/validations.js";

export async function getProduct(req, res) {
    const id = integerValidation(req.params);
    if (!id) {
        res.sendStatus(400);
        return;
    }
    let dbQuery = `SELECT * FROM products WHERE id = $1`;
    try {
        const product = await db.query(dbQuery, [id]);
        if (product.rows.length === 0) {
            res.sendStatus(404);
        } else {
            res.send(product.rows[0]);
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}
