require("dotenv").config();

const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many messages sent. Please try again later."
    }
});

app.use(express.static(path.join(__dirname, "public")));

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

app.get("/api/health", (req, res) => {
    res.json({
        online: true,
        message: "Nova Studio backend is running."
    });
});

app.post("/api/contact", contactLimiter, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            subject,
            message
        } = req.body;

        if (!firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please complete all fields."
            });
        }

        if (
            firstName.length > 50 ||
            lastName.length > 50 ||
            email.length > 150 ||
            subject.length > 150 ||
            message.length > 5000
        ) {
            return res.status(400).json({
                success: false,
                message: "One or more fields are too long."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error("SMTP credentials are missing.");

            return res.status(500).json({
                success: false,
                message: "Email service is not configured yet."
            });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const safeFirstName = escapeHTML(firstName);
        const safeLastName = escapeHTML(lastName);
        const safeEmail = escapeHTML(email);
        const safeSubject = escapeHTML(subject);
        const safeMessage = escapeHTML(message).replace(/\n/g, "<br>");

        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.CONTACT_EMAIL,
            replyTo: email,
            subject: `Nova Studio Contact: ${subject}`,

            text: `
Nova Studio Contact Form

Name: ${firstName} ${lastName}
Email: ${email}
Subject: ${subject}

Message:
${message}
            `,

            html: `
                <div style="font-family:Arial,sans-serif;line-height:1.6;">
                    <h2>Nova Studio Contact Form</h2>

                    <p>
                        <strong>Name:</strong>
                        ${safeFirstName} ${safeLastName}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${safeEmail}
                    </p>

                    <p>
                        <strong>Subject:</strong>
                        ${safeSubject}
                    </p>

                    <hr>

                    <p>
                        <strong>Message:</strong>
                    </p>

                    <p>${safeMessage}</p>
                </div>
            `
        });

        res.json({
            success: true,
            message: "Your message has been sent successfully!"
        });

    } catch (error) {
        console.error("Contact form error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong while sending your message."
        });
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Nova Studio is running on port ${PORT}`);
});