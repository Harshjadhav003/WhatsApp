
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail({ to, name, verificationUrl }) {
  const safeName = String(name)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your WhatsApp account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>Welcome to WhatsApp!</h2>
        <p>Hi ${safeName},</p>
        <p>Please verify your email address by clicking the button below.</p>
        <a
          href="${verificationUrl}"
          style="display:inline-block;padding:12px 20px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;"
        >
          Verify Email
        </a>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  return data;
}

module.exports = { sendVerificationEmail };
