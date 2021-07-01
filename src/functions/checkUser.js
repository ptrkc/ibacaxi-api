import db from "../dbConfig";

export default async function checkUser(uuidToken){
    const tokenValidation = await db.query(`
    SELECT * FROM sessions
    WHERE token = $1
    `, [uuidToken]);

    if(tokenValidation.rows.length === 1){
        return tokenValidation.rows[0]
    } else {
        return false
    }
}