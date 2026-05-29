export const sendMail = async (email, subject, html) => {
    try {
        console.log("sendMail start");
        const resendApiKey = process.env.RESEND_API_KEY?.trim();
        const fromEmail = process.env.FROM_EMAIL?.trim();

        if (!resendApiKey || !fromEmail) {
            throw new Error("Resend email credentials are missing");
        }

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: fromEmail,
                to: email,
                subject,
                html,
            }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            console.error("sendMail fail:", {
                status: response.status,
                error: result,
            });
            throw new Error(result.message || `Resend request failed with status ${response.status}`);
        }

        console.log("sendMail success:", result);
        return { success: true };

    } catch (error) {
        console.error("Mail send failed:", error.message);
        return { success: false, error: error.message };
    }
}
