import jwt from "jsonwebtoken";
import { forgotTokenSecret, isProduction, jwtSecret } from "../config/env.js";

export const verifyTokenGuard = async (req, res, next) => {
    try {
        const authorization = req.headers['authorization'];
        if(!authorization)
            return res.status(400).json({message: "Bad request"});
        
        const [type, token] = authorization.split(" ");

        if(type !== "Bearer")
            return res.status(400).json({message: "Bad request"});

        const payload = await jwt.verify(token, forgotTokenSecret);
        
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({message: "Invalid or expired token"});
    }
}

const invalid = async (res) => {
    res.cookie("auth_token", null, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path : "/",
        domain: undefined,
        maxAge: 0,
    })
    return res.status(400).json({message: "Bad request"});
}

export const AdminUserGuard = async (req, res, next) => {  
    try {
    console.log("REQ HEADERS COOKIE:", req.headers.cookie);
    console.log("REQ COOKIES:", req.cookies);
    const {auth_token} = req.cookies;
    console.log("AUTH TOKEN:", req.cookies?.auth_token);
    if(!auth_token)
     return invalid(res);   

    const payload = await jwt.verify(auth_token, jwtSecret);
    console.log("JWT PAYLOAD:", payload);
    
    if(payload.role !== "user" && payload.role !== "admin")
        return invalid(res);

    req.user = payload;
    next();
    } catch (error) {
        console.log("JWT VERIFY ERROR:", error.message);
        return invalid(res);
    }
   
}


export const AdminGuard = async (req, res, next) => {  
    try {
    const {auth_token} = req.cookies;
    if(!auth_token)
     return invalid(res);   

    const payload = await jwt.verify(auth_token, jwtSecret);
    
    
    if( payload.role !== "admin")
        return invalid(res);

    req.user = payload;
    next();
    } catch {
        return invalid(res);
    }
   
}
