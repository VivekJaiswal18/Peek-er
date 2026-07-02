import { compare } from "bcrypt";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { nextTick } from "process";
import { runInNewContext } from "vm";

export async function authenticate(req: Request, res: Response, next: NextFunction){
    try{
    const authHeader = req.headers.authorization;

    if(!authHeader?.startsWith("Bearer ")){
        throw new Error("No accessToken provided")
    }
    
    const token = authHeader.split(" ")[1]
    const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!)
    // @ts-ignore
    req.user = decodedToken
    next()
}
catch{
    return res.status(402).json("Invalid access token")
}
}

// export async function refreshToken(req: Request, res: Response, next: NextFunction){

// }