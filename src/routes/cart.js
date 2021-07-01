import db from "../dbConfig.js";
import { orderUpdateValidation } from "../functions/validations.js";

export async function postCart(req, res) {
    try {
        const authorization = req.headers["authorization"];
        const token = authorization?.replace("Bearer ", "");

        if(!token) return res.sendStatus(401);
        
        const tokenValidation = await db.query(`
            SELECT * FROM sessions
            WHERE token = $1
        `, [token]);

        const user = tokenValidation.rows[0];

        if(user) {
            const validCart = cartValidation(req.body);
            if (!validCart) {
                res.sendStatus(400);
                return;
            }
            const { userId, productId, quantity, closed } = validCart;

            const checkExistingProduct = await db.query(`
                SELECT * FROM orders
                WHERE "userId" = $1 AND "productId" = $2
            `, [userId, productId]);

            const product = checkExistingProduct.rows[0];

            const checkInventory = await db.query(`
                SELECT quantity FROM products
                WHERE id = $1
            `, [productId]);

            const inventoryQuantity = checkInventory.rows[0].quantity;

            if (product && product.closed === false) {
                const newQuantity = (quantity + product.quantity); 
                if (newQuantity > inventoryQuantity) {
                    return res.sendStatus(403);
                }

                await db.query(`
                    UPDATE orders
                    SET quantity = $1
                    WHERE "userId" = $2 AND "productId" = $3 
                `, [newQuantity, userId, productId]);

                return res.sendStatus(200);
            } else {
                if (quantity > inventoryQuantity) {
                    return res.sendStatus(403);
                }

                await db.query(`
                    INSERT INTO orders
                    ("userId", "productId", quantity, closed)
                    VALUES ($1, $2, $3, $4)
                `, [userId, productId, quantity, closed]);

                return res.sendStatus(200);
            }
        } else {
            return res.sendStatus(401);
        }
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }
}

export async function getCart(req, res) {
    try {
        const authorization = req.headers["authorization"];
        const token = authorization?.replace("Bearer ", "");

        if(!token) return res.sendStatus(401);
        
        const tokenValidation = await db.query(`
            SELECT * FROM sessions
            WHERE token = $1
        `, [token]);

        const user = tokenValidation.rows[0];
        
        if (user) {
            const cartProducts = await db.query(`
                SELECT orders.*,
                products.name AS "productName",
                products.quantity AS inventory,
                products.price AS price,
                products.image AS image,
                products.brief AS brief
                FROM orders JOIN products
                ON orders."productId" = products.id
                WHERE orders."userId" = $1
            `, [user.userId]);

            return res.send(cartProducts.rows);
        } else {
            return res.sendStatus(401);
        }
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }
}

export async function putCart(req, res) {
    try {
        const authorization = req.headers["authorization"];
        const token = authorization?.replace("Bearer ", "");

        if(!token) return res.sendStatus(401);
        
        const tokenValidation = await db.query(`
            SELECT * FROM sessions
            WHERE token = $1
        `, [token]);

        const user = tokenValidation.rows[0];
        
        if (user) {
            const validOrderUpdate = orderUpdateValidation(req.body);
            if (!validOrderUpdate) {
                res.sendStatus(400);
                return;
            }

            const { productId, quantity } = validOrderUpdate;
            
            console.log(quantity, user.userId, productId);

            await db.query(`
                UPDATE orders
                SET quantity = $1
                WHERE "userId" = $2 AND "productId" = $3 
            `, [quantity, user.userId, productId]);

            return res.sendStatus(200);
        } else {
            return res.sendStatus(401);
        }
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }
}