import nodemailer from 'nodemailer';

export const sendMail = async (email, subject, template) => {
    try {
        const senderEmail = process.env.SENDER_EMAIL?.trim();
        const senderPassword = process.env.SENDER_PASSWORD?.trim();

        if (!senderEmail || !senderPassword) {
            throw new Error("Email sender credentials are missing");
        }

        const config = nodemailer.createTransport({
            service : "gmail",
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
