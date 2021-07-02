import db from "../dbConfig.js";
import { integerValidation } from "../functions/validations.js";
import { checkJWT } from "../functions/jwtokens.js";
import checkUser from "../functions/checkUser.js";
import { sendMail } from "../functions/sendMail.js";

export async function getOrder(req, res) {
    try {
        const uuidToken = checkJWT(req.headers);
        if (!uuidToken) return res.sendStatus(401);

        const user = await checkUser(uuidToken);
        if (!user) {
            return res.sendStatus(401);
        }
        const id = integerValidation(req.query);
        if (!id) {
            return res.sendStatus(400);
        }
        const orderDetails = await db.query(
            `
            SELECT orders.id AS "orderId", orders.date, users.email, orders."confirmationSent" 
            FROM orders JOIN users ON users.id = orders."userId" WHERE orders.id = $1 AND users.id = $2
        `,
            [id, user.userId]
        );
        if (orderDetails.rows.length === 0) {
            return res.sendStatus(404);
        }
        if (orderDetails.rows[0].confirmationSent !== true) {
            await sendMail(orderDetails.rows[0].orderId);
        }
        return res.send(orderDetails.rows[0]);
    } catch (e) {
        console.log(e);
        return res.sendStatus(500);
    }
}
