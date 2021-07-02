import db from "../dbConfig.js";
import { checkoutValidation } from "../functions/validations.js";
import { checkJWT } from "../functions/jwtokens.js";
import checkUser from "../functions/checkUser.js";

export async function postCheckout(req, res) {
    try {
        const uuidToken = checkJWT(req.headers);
        if (!uuidToken) return res.sendStatus(401);

        const user = await checkUser(uuidToken);
        if (!user) {
            return res.sendStatus(401);
        }

        const checkout = checkoutValidation(req.body);
        if (!checkout) {
            return res.sendStatus(400);
        }
        const { name, address, creditCard, expiration, totalPrice } = checkout;

        const cartProducts = await db.query(
            `
            SELECT cart."productId",
            cart.quantity AS "cartQuantity",
            products.quantity AS inventory,
            products.price AS price
            FROM cart JOIN products
            ON cart."productId" = products.id
            WHERE cart."userId" = $1
        `,
            [user.userId]
        );
        let cartTotal = 0;
        let updateInvetoryQuery = "";
        for (let i = 0; i < cartProducts.rows.length; i++) {
            const p = cartProducts.rows[i];
            if (p.cartQuantity > p.inventory) {
                return res.status(400).send("Quantity larger than inventory");
            }
            updateInvetoryQuery += `UPDATE products SET quantity = ${
                p.inventory - p.cartQuantity
            }; `;
            cartTotal += p.cartQuantity * p.price;
        }
        if (cartTotal !== totalPrice) {
            return res.status(400).send("Total does not match cart");
        }
        const order = await db.query(
            `
        INSERT INTO orders
        (date , "userId" , name , address , cc , expiration , total)
        VALUES (NOW(), $1, $2, $3, $4, $5, $6) RETURNING id
        `,
            [user.userId, name, address, creditCard, expiration, totalPrice]
        );
        const values = {
            productId: [],
            cartQuantity: [],
            orderId: [],
            price: [],
        };
        cartProducts.rows.forEach((p) => {
            values.productId.push(p.productId);
            values.cartQuantity.push(p.cartQuantity);
            values.orderId.push(order.rows[0].id);
            values.price.push(p.price);
        });
        await db.query(
            `INSERT INTO "ordersProducts" ("productId", quantity, "orderId", price) SELECT * FROM UNNEST ($1::int[], $2::int[], $3::int[], $4::int[])`,
            [
                values.productId,
                values.cartQuantity,
                values.orderId,
                values.price,
            ]
        );
        await db.query(`DELETE FROM cart WHERE "userId" = $1`, [user.userId]);
        await db.query(updateInvetoryQuery);
        return res.sendStatus(200);
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }
}
