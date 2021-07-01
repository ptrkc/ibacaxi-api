import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

const secretKey = process.env.JWT_SECRET;

export function checkJWT(headers){
    if (!headers["authorization"]) {
        return false;
    }
    const jwToken = headers["authorization"].replace("Bearer ", "");
    try {
        const uuidToken = jwt.verify(jwToken, secretKey);
        return uuidToken;
    } catch {
        return false;
    }
}

export function signJWT(uuidToken){
    return jwt.sign(uuidToken, secretKey);
}
