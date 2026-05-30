import jwt from "jsonwebtoken";
import { forgotTokenSecret, jwtSecret } from "../config/env.js";

const getBearerToken = (req) => {
    const authorization = req.headers['authorization'];
    if(!authorization) return null;

    const [type, token] = authorization.trim().split(/\s+/);
    if(type?.toLowerCase() !== "bearer" || !token) return null;

    return token;
}

export const verifyTokenGuard = async (req, res, next) => {
    try {
        const token = getBearerToken(req);
        if(!token)
            return res.status(400).json({message: "Bad request"});

        const payload = await jwt.verify(token, forgotTokenSecret);
        
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({message: "Invalid or expired token"});
    }
}

const invalid = async (res) => {
    return res.status(400).json({message: "Bad request"});
}

const unauthorized = async (res) => {
    return res.status(401).json({message: "Invalid or expired token"});
}

export const AdminUserGuard = async (req, res, next) => {  
    try {
    console.log("AUTH HEADER", req.headers.authorization);
    const token = getBearerToken(req);
    if(!token)
     return invalid(res);

    const payload = await jwt.verify(token, jwtSecret);
    console.log("SESSION USER", payload);
    
    if(payload.role !== "user" && payload.role !== "admin")
        return invalid(res);

    req.user = payload;
    next();
    } catch {
        return unauthorized(res);
    }
   
}


export const AdminGuard = async (req, res, next) => {  
    try {
    const token = getBearerToken(req);
    if(!token)
     return invalid(res);

    const payload = await jwt.verify(token, jwtSecret);
    
    
    if( payload.role !== "admin")
        return invalid(res);

    req.user = payload;
    next();
    } catch {
        return unauthorized(res);
    }
   
}
