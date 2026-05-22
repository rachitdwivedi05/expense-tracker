import UserModel from './user.model.js';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import { sendMail } from '../utils/mail.js';
import { otpTemplate } from '../utils/otp.template.js';
import { generateOTP } from '../utils/generate.otp.js';
import { forgotPasswordTemplate } from '../utils/forgot-template.js';
// import { use } from 'react';

const normalizeEmail = (email = "") => email.toString().trim().toLowerCase();

const getFrontendUrl = () => {
    const configuredUrl = process.env.FRONTEND_URL || process.env.DOMAIN || "http://localhost:5180";
    return configuredUrl.split(",")[0].trim().replace(/\/$/, "");
}

const createToken = async(user) => {
    const payload = {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
    };

    const token = jwt.sign(payload, process.env.AUTH_SECRET, {expiresIn: '1d'});
    return token;

}


export const createUser = async (req, res) => {
    try {
        const data = {
            ...req.body,
            email: normalizeEmail(req.body.email)
        };
        const exists = await UserModel.findOne({email: data.email});
        if(exists){
            return res.status(409).json({message: "Email already registered !"});
        }
        const user = new UserModel(data);
        await user.save();
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const sendEmail = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        if(!email){
            return res.status(400).json({message: "Email is required"});
        }
        const OTP = generateOTP();
        const isEmail = await UserModel.findOne({email});
        if(isEmail){
            return  res.status(400).json({message: "Email already registered !"});
        }
       const sent = await sendMail(email, "OTP For Signup",otpTemplate(OTP));
        if(!sent.success){
            return res.json({
                message: "Email service unavailable. Use OTP shown on screen.",
                otp : OTP,
                success: true,
                emailSent: false
            });
        }
        res.json({
            message: "Email sent successfully",
            otp : OTP,
            success: true,
            emailSent: sent.success
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const {password} = req.body;
        const email = normalizeEmail(req.body.email);
        const user = await UserModel.findOne({email});
        if(!user)
            return res.status(404).json({message: "user not found !"});

            if(!user.status)
            return res.status(404).json({message: "You are not active Member !"});
        
        const isLogged = await bcrypt.compare(password, user.password);
        if(!isLogged)
            return  res.status(401).json({message: "incorrect password !"});

        const token = await createToken(user);
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.ENVIRONMENT !== "DEV",
          sameSite : process.env.ENVIRONMENT === "DEV" ? "lax" : "none",
          path : "/",
          domain: undefined,
          maxAge: 86400000,
        });
        res.json({message: "login successful", role: user.role});
        
      } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("auth_token", null, {
        httpOnly: true,
        secure: process.env.ENVIRONMENT !== "DEV",
        sameSite: process.env.ENVIRONMENT === "DEV" ? "lax" : "none",
        path : "/",
        domain: undefined,
        maxAge: 0,
    });
    res.status(200).json({message: "Logout successful"});
      } catch (error) {
        res.status(401).json({ message: error.message || "Logout Failed"});
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(404).json({message: "user not found !"});
        }
        const token = await jwt.sign({Id: user._id},process.env.FORGOT_TOKEN_SECRET, {expiresIn: '15m'});
        const frontendUrl = getFrontendUrl();
        const link = `${frontendUrl}/forgot-password?token=${token}`;
        const sent = await sendMail(
            email,
           "Expense - Forgot Password ?", forgotPasswordTemplate(user.fullname, link)
        );
        if(!sent.success){
            return res.json({
                message: "Email service unavailable. Reset password below.",
                resetLink: link,
                emailSent: false
            });
        }
        res.json({message: "Please check your email for reset link", emailSent: true});
        
      } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



export const verifyToken = async (req, res) => {
    try {
       res.json("Verification success");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


export const changePassword = async (req, res) => {
    try {
        const {password} = req.body;
        const encrypted = await bcrypt.hash(password.toString(),12);
        await UserModel.findByIdAndUpdate(req.user.Id, {password: encrypted});
        res.json("Password updated successfully");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


export const getAllUsers = async (req, res) => {
    try {
         const { page=1 ,limit=5}= req.query;
         const pageNumber = parseInt(page);
const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
         const users = await UserModel.find().sort({createdAt: -1})
         .skip(skip).limit(limitNumber);
          const total = await UserModel.countDocuments();
         res.json({
            data : users,
            total
        });
    } catch (err) {
        res.status(500).json({ message: err.message || "Internal Server error"})
    }
}


export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        const user = await UserModel.findByIdAndUpdate(id, { status }, {new: true});
        if(!user)          
            return res.status(404).json({message: "User not found !",
            user});
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message || "Internal Server error"})
    }
}
