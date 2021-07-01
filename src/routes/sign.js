import db from "../dbConfig.js";
import {
    signInValidation,
    signUpValidation,
} from "../functions/validations.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const secretKey = process.env.JWT_SECRET;

export async function postSignIn(req, res) {
    try {
        const validUser = signInValidation(req.body);
        if (!validUser) {
            res.sendStatus(400);
            return;
        }
        const { email, password } = validUser;
        const checkUser = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (checkUser.rows.length === 0) {
            res.sendStatus(401);
            return;
        }
        const user = checkUser.rows[0];
        const authorized = bcrypt.compareSync(password, user.password);
        if (!authorized) {
            res.sendStatus(401);
            return;
        }
        const sessionToken = uuid();
        await db.query(
            `INSERT INTO sessions ("userId", token) VALUES ($1, $2)`,
            [user.id, sessionToken]
        );
        const token = jwt.sign(sessionToken, secretKey);
        res.send({ name: user.name, token });
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}

export async function postSignOut(req, res) {
    if (!req.headers["authorization"]) {
        res.sendStatus(401);
        return;
    }
    const jwToken = req.headers["authorization"].replace("Bearer ", "");
    let uuidToken;
    try {
        uuidToken = jwt.verify(jwToken, secretKey);
    } catch {
        return res.sendStatus(401);
    }
    try {
        await db.query(`DELETE FROM sessions WHERE token = $1`, [uuidToken]);
        res.send();
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}

export async function postSignUp(req, res) {
    try {
        const newUser = signUpValidation(req.body);
        if (!newUser) {
            res.sendStatus(400);
            return;
        }
        const { name, email, password } = newUser;
        const checkUser = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if (checkUser.rows.length > 0) {
            res.sendStatus(409);
            return;
        }
        const hash = bcrypt.hashSync(password, 10);
        await db.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
            [name, email, hash]
        );
        res.sendStatus(201);
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
}
