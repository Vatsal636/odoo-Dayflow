import nodemailer from 'nodemailer'

// Create a transporter. 
// For dev, we often use Ethereal or just console logs if no SMTP provided.
// Since User didn't provide SMTP, we will use a "stream" transport for JSON logs in console
// equivalent to "Mock Mode" but cleaner.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function sendWelcomeEmail(to, name, employeeId, password) {
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/login"

    const mailOptions = {
        from: '"Dayflow HR" <admin@dayflow.app>',
        to,
        subject: 'Welcome to Dayflow - Your Credentials',
        text: `Hello ${name},\n\nWelcome to Dayflow! Your account has been created.\n\nLogin ID: ${employeeId}\nTemporary Password: ${password}\n\nPlease login at: ${loginUrl}\n\nYou will be required to change your password upon first login.\n\nRegards,\nHR Team`,
        html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to Dayflow, ${name}!</h2>
        <p>Your account has been successfully created.</p>
        <div style="background: #f4f6f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Login ID:</strong> ${employeeId}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
        </div>
        <p>Please login at <a href="${loginUrl}">${loginUrl}</a></p>
        <p><em>You will be asked to change your password immediately.</em></p>
      </div>
    `
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log("---------------------------------------------------")
        console.log("📧 [MOCK EMAIL SENT] To:", to)
        console.log("Message JSON:", info.message) // This contains the literal JSON of the message
        console.log("---------------------------------------------------")
        return true
    } catch (error) {
        console.error("Failed to send email:", error)
        return false
    }
}
