import nodemailer from 'nodemailer';

export const sendMail = async (email, subject, template) => {
    try {
        console.log("sendMail start");
        const senderEmail = process.env.SENDER_EMAIL?.trim();
        const senderPassword = process.env.SENDER_PASSWORD?.trim();

        if (!senderEmail || !senderPassword) {
            throw new Error("Email sender credentials are missing");
        }

        const config = nodemailer.createTransport({
            service : "gmail",
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            auth : {
                user : senderEmail,
                pass : senderPassword
            }
        });

        console.log("transporter verify start");
        try {
            await config.verify();
            console.log("transporter verify success");
        } catch (error) {
            console.error("transporter verify fail:", error.message);
            throw error;
        }

        const options = {
            from : senderEmail,
            to : email,
            subject : subject,
            html : template
        }

        try {
            await config.sendMail(options);
            console.log("sendMail success");
        } catch (error) {
            console.error("sendMail fail:", error.message);
            throw error;
        }

        return { success: true };

    } catch (error) {
        console.error("Mail send failed:", error.message);
        return { success: false, error: error.message };
    }
}
