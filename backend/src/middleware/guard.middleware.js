import jwt from "jsonwebtoken";
import { forgotTokenSecret, jwtSecret } from "../config/env.js";
import { getClearAuthCookieOptions } from "../utils/auth-cookie.js";

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

const invalid = async (req, res) => {
    res.clearCookie("auth_token", getClearAuthCookieOptions(req));
    return res.status(400).json({message: "Bad request"});
}

export const AdminUserGuard = async (req, res, next) => {  
    try {
    console.log("REQ HEADERS COOKIE:", req.headers.cookie);
    console.log("REQ COOKIES:", req.cookies);
    const {auth_token} = req.cookies;
    console.log("AUTH TOKEN:", req.cookies?.auth_token);
    if(!auth_token)
     return invalid(req, res);   

    const payload = await jwt.verify(auth_token, jwtSecret);
    console.log("JWT PAYLOAD:", payload);
    
    if(payload.role !== "user" && payload.role !== "admin")
        return invalid(req, res);

    req.user = payload;
    next();
    } catch (error) {
        console.log("JWT VERIFY ERROR:", error.message);
        return invalid(req, res);
    }
   
}


export const AdminGuard = async (req, res, next) => {  
    try {
    const {auth_token} = req.cookies;
    if(!auth_token)
     return invalid(req, res);   

    const payload = await jwt.verify(auth_token, jwtSecret);
    
    
    if( payload.role !== "admin")
        return invalid(req, res);

    req.user = payload;
    next();
    } catch {
        return invalid(req, res);
    }
   
}
