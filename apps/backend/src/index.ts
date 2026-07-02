import express, {Request, Response} from "express";
import cors from "cors"
import bcrypt from "bcrypt"
import {generateAccessToken, generateRefreshToken} from "./utils/tokens"
import cookieParser from "cookie-parser";
import {authenticate} from "./middlewares/auth.middleware"

const app = express()
app.use(cookieParser())
app.use(cors())

app.post("/signup", async (req: Request, res: Response)=>{
    try{
    const {username, email, password} = req.body
    
    const existingUser = await prisma.user.findUnique(
        { where: email}
    )

    if(existingUser){
        return res.status(409).json("User already exists")
    }

    const passwordHash = await bcrypt.hash(password, 10)
    
    const refreshToken = await generateRefreshToken(username, email)
    const accesshToken = await generateAccessToken(email)

    const user = await prisma.user.create({
        data:{
            username,
            email,
            passwordHash,
            refreshToken
        }
    })
    
    res.cookie("refreshToken", refreshToken, {httpOnly: true, secure: false, sameSite: "lax", maxAge: 10 * 24 * 60 * 60 * 1000})

    return res.status(200).json({
        message: "User successfully signed in",
        accesshToken: accesshToken
    })
    }
    catch(error){
        res.status(402).json(error)
    }
}
)

// app.post("signin", authenticate, async(req, res)=>{
// })

// app.post("choose-repo", (req, res)=>{

// })

app.listen(8080)