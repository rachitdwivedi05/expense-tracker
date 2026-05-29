import UserModel from './user.model.js';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import { sendMail } from '../utils/mail.js';
import { otpTemplate } from '../utils/otp.template.js';
import { generateOTP } from '../utils/generate.otp.js';
import { forgotPasswordTemplate } from '../utils/forgot-template.js';
import { clientUrl, forgotTokenSecret, getMongoUriDebugInfo, isProduction, jwtSecret } from '../config/env.js';
// import { use } from 'react';


const createToken = async(user) => {
    const payload = {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
    };

    const token = jwt.sign(payload, jwtSecret, {expiresIn: '1d'});
    return token;

}


export const createUser = async (req, res) => {
    try {
        const data = req.body;
        const user = new UserModel(data);
        await user.save();
        const token = await createToken(user);
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: isProduction,
          sameSite : isProduction ? "none" : "lax",
          path : "/",
          domain: undefined,
          maxAge: 86400000,
        });
        res.json({message: "signup successful", role: user.role});
      } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const sendEmail = async (req, res) => {
    try {
        const {email} = req.body;
        const OTP = generateOTP();
        const isEmail = await UserModel.findOne({email});
        if(isEmail){
            return  res.status(400).json({message: "Email already registered !"});
        }
       const sent = await sendMail(email, "OTP For Signup",otpTemplate(OTP));
        res.json({
            message: sent.success ? "Email sent successfully" : "OTP generated successfully",
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
        const {email, password} = req.body;
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
          secure: isProduction,
          sameSite : isProduction ? "none" : "lax",
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
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
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
    console.log("forgot-password start");

    const email = req.body.email?.trim();

    console.log("MONGO URI DB:", getMongoUriDebugInfo());
    console.log("DB NAME:", UserModel.db.name);
    console.log("COLLECTION NAME:", UserModel.collection.name);

    console.log("before listCollections");
    const collections = await UserModel.db.db.listCollections().toArray();
    console.log("COLLECTIONS:", collections.map((collection) => collection.name));

    console.log("before countDocuments");
    const totalUsers = await UserModel.countDocuments();
    console.log("TOTAL USERS:", totalUsers);

    console.log("before find all users");
    const allUsers = await UserModel.find({}, { email: 1, fullname: 1 }).limit(10).lean();
    console.log("ALL USERS:", allUsers);

    console.log("before findOne user");
    const user = await UserModel.findOne({ email });

    console.log("EMAIL:", email);
    console.log("FOUND USER:", user);

    if (!user) {
      const response = res.status(404).json({
        message: "user not found !"
      });
      console.log("forgot-password response sent");
      return response;
    }

    console.log("user found");

    const token = jwt.sign({ Id: user._id }, forgotTokenSecret, { expiresIn: "1h" });
    const resetLink = `${clientUrl}/forgot-password?token=${token}`;

    console.log("before sendMail");
    const sent = await sendMail(
      email,
      "Reset Your Password",
      forgotPasswordTemplate(user.fullname, resetLink)
    );
    console.log("after sendMail");

    if (!sent.success) {
      const response = res.status(500).json({ message: "Failed to send reset email" });
      console.log("forgot-password response sent");
      return response;
    }

    res.json({ message: "Password reset link sent successfully" });
    console.log("forgot-password response sent");

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
