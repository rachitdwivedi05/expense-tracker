import UserModel from './user.model.js';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import { sendMail } from '../utils/mail.js';
import { otpTemplate } from '../utils/otp.template.js';
import { generateOTP } from '../utils/generate.otp.js';


const createToken = async(user) => {
    const payload = {
        Id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
    };

    const token = jwt.sign(payload, process.env.AUTH_SECRET, {expiresIn: '1d'});
    return token;

}


export const createUser = async (req, res) => {
    try {
        const data = req.body;
        const user = new UserModel(data);
        await user.save();
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const sendEmail = async (req, res) => {
    try {
        const {email} = req.body;
        const OTP = generateOTP();
       await sendMail(email, "OTP For Signup",otpTemplate(OTP));
        res.json({
            message: "Email sent successfully",
            otp : OTP,
            success: true
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(404).json({message: "user not found !"});
        }
        const isLogged = await bcrypt.compare(password, user.password);
        if(!isLogged)
            return  res.status(401).json({message: "incorrect password !"});

        const token = await createToken(user);
        res.cookie('auth_token', token, {
           maxAge: 24 * 60 * 60 * 1000,
           domain: process.env.ENVIRONMENT === 'DEV' ? 'localhost' : process.env.DOMAIN,
           secure : process.env.ENVIRONMENT === 'DEV' ? false : true,
           httpOnly: true
        });
        res.json({message: "login successful"});
        
      } catch (error) {
        res.status(500).json({ error: error.message });
    }
}