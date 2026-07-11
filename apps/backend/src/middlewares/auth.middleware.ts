import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type AccesTokenPayload = {
  sub: string;
  email: string;
};

export async function authenticate(req: Request, res: Response, next: NextFunction){
    try{
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : req.cookies?.accessToken;

    if (!token) {
      throw new Error("No accessToken provided");
    }

    const decodedToken = (await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    )) as AccesTokenPayload;
    // @ts-ignore
    // req.user = decodedToken
    req.user = {
        id: Number(decodedToken.sub),
        email: decodedToken.email
    }

    next()
}
catch{
    return res.status(402).json("Invalid access token")
}
}

// export async function refreshToken(req: Request, res: Response, next: NextFunction){

// }