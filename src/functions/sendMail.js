import sgMail from "@sendgrid/mail";
import db from "../dbConfig.js";
import dotenv from "dotenv";
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendMail(orderId) {
    try {
        const orderInfo = await db.query(
            `
        SELECT orders.date, orders.name as "billingName", orders.address, orders.cc, orders.total, orders."confirmationSent",
        users.email,users.name AS "userName", "ordersProducts".*  
        FROM orders JOIN users ON users.id = orders."userId"
        JOIN "ordersProducts" ON "ordersProducts"."orderId" = orders.id
        WHERE orders.id = $1`,
            [orderId]
        );
        console.log(orderInfo.rows);
        const { userName, email, total, address, date } = orderInfo.rows[0];
        let message = `
        <h2>Your order has been placed!</h2>
        <br />
        <p><strong>Name: ${userName}</strong><p>
        <p><strong>Date: ${address}</strong><p>
        <p><strong>Date: ${date}</strong><p>
        <p><strong>Order id: ${orderId}</strong><p>
        <p><strong>Total id: ${total}</strong><p>
        <br />
        <h2>Thank you shopping with us!</h2>
        `;
        const msg = {
            to: email,
            from: process.env.SENDGRID_SENDER,
            subject: "[iBacaxi] You order was placed.",
            text: "Hello!",
            html: message,
        };
        await sgMail.send(msg);
        await db.query(
            `UPDATE orders SET orders."confirmationSent" = true WHERE orders.id = $1`,
            [orderId]
        );
        console.log("Email sent");
    } catch (e) {
        console.log(e);
    }
}
