import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET

// if(!accessTokenSecret || !refreshTokenSecret){
//     throw new Error("TOKEN secret missing")
// }
export async function generateRefreshToken(username: string, email: string){
    return jwt.sign(
        {
            username,
            email
        },
        refreshTokenSecret!,
        {
            expiresIn: "10d"
        }
    )
};
export async function generateAccessToken(email: string){
    return jwt.sign(
        {
            email
        },
        accessTokenSecret!,
        {
            expiresIn: "6h"
        }
    )
}

// export function verifyAccessToken(token: string){
//     return jwt.verify(token, accessTokenSecret!)
// }
// export function verifyRefreshToken(token: string){
//     return jwt.verify(token, refreshTokenSecret!)
// }