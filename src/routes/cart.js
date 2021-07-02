import db from "../dbConfig.js";
import { cartValidation, cartUpdateValidation } from "../functions/validations.js";
import { checkJWT } from "../functions/jwtokens.js";
import checkUser from "../functions/checkUser.js";

export async function postCart(req, res) {
    try {
        const uuidToken = checkJWT(req.headers)
        if (!uuidToken) return res.sendStatus(401);
        
        const user = await checkUser(uuidToken)

        if(user) {
            const validCart = cartValidation(req.body);
            if (!validCart) {
                res.sendStatus(400);
                return;
            }
            const { userId, productId, quantity } = validCart;

            const checkExistingProduct = await db.query(`
                SELECT * FROM cart
                WHERE "userId" = $1
                AND "productId" = $2
            `, [userId, productId]);

            const product = checkExistingProduct.rows[0];

            const checkInventory = await db.query(`
                SELECT quantity FROM products
                WHERE id = $1
            `, [productId]);

            const inventoryQuantity = checkInventory.rows[0].quantity;

            if (product) {
                const newQuantity = (quantity + product.quantity); 
                if (newQuantity > inventoryQuantity) {
                    return res.sendStatus(403);
                }

                await db.query(`
                    UPDATE cart
                    SET quantity = $1
                    WHERE "userId" = $2
                    AND "productId" = $3
                `, [newQuantity, userId, productId]);

                return res.sendStatus(200);
            } else {
                if (quantity > inventoryQuantity) {
                    return res.sendStatus(403);
                }

                await db.query(`
                    INSERT INTO cart
                    ("userId", "productId", quantity)
                    VALUES ($1, $2, $3)
                `, [userId, productId, quantity]);

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
        const uuidToken = checkJWT(req.headers);
        if (!uuidToken) return res.sendStatus(401);
        
        const user = await checkUser(uuidToken)
        
        if (user) {
            const cartProducts = await db.query(`
                SELECT cart.*,
                products.name AS "productName",
                products.quantity AS inventory,
                products.price AS price,
                products.image AS image,
                products.brief AS brief
                FROM cart JOIN products
                ON cart."productId" = products.id
                WHERE cart."userId" = $1
            `, [user.userId]);

            let total = 0;
            cartProducts.rows.forEach(p => {
                total += p.price * p.quantity
            });

            return res.send({products: cartProducts.rows, total});
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
        const uuidToken = checkJWT(req.headers)
        if (!uuidToken) return res.sendStatus(401);
        
        const user = await checkUser(uuidToken)
        
        if (user) {
            const validCartUpdate = cartUpdateValidation(req.body);
            if (!validCartUpdate) {
                res.sendStatus(400);
                return;
            }

            const { productId, quantity } = validCartUpdate;

            await db.query(`
                UPDATE cart
                SET quantity = $1
                WHERE "userId" = $2
                AND "productId" = $3
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

export async function deleteCart(req, res) {
    try {
        const uuidToken = checkJWT(req.headers)
        if (!uuidToken) return res.sendStatus(401);
        
        const user = await checkUser(uuidToken)
        
        if (user) {
            const { id } = req.query;

            await db.query(`
                DELETE FROM cart
                WHERE id = $1 
            `, [id]);

            return res.sendStatus(200);
        } else {
            return res.sendStatus(401);
        }
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }
}