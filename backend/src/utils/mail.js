import nodemailer from 'nodemailer';

export const sendMail = async (email, subject, template) => {
    try {
        const senderEmail = process.env.SENDER_EMAIL?.trim();
        const senderPassword = process.env.SENDER_PASSWORD?.replace(/\s+/g, "");

        if (!senderEmail || !senderPassword) {
            throw new Error("Email sender credentials are missing");
        }

        const config = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 30000,
            auth : {
                user : senderEmail,
                pass : senderPassword
            }
        });

        const options = {
            from : senderEmail,
            to : email,
            subject : subject,
            html : template
        }

        await config.sendMail(options);
        return { success: true };

    } catch (error) {
        console.error("Mail send failed:", error.message);
        return { success: false, error: error.message };
    }
}
