import nodemailer from "nodemailer";
import { emailPass, emailUser } from "../config/env.js";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

export const sendMail = async (email, subject, html) => {
    try {
        if (!emailUser || !emailPass) {
            throw new Error("Gmail SMTP credentials are missing");
        }

        const info = await transporter.sendMail({
            from: emailUser,
            to: email,
            subject,
            html,
        });

        console.log("sendMail success:", info.messageId);
        return { success: true };
    } catch (error) {
        console.error("Mail send failed:", error.message);
        return { success: false, error: error.message };
    }
};
