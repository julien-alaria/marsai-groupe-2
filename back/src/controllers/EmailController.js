import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail(to, subject, html) {
  let info = await transporter.sendMail({
    from: '"//YOUR NAME" <//YOUR MAIL>', // sender address, add YOUR NAME & YOUR MAIL
    to, // list of receivers
    subject, // Subject line
    html,
  });
  return info.response;
}

export default { sendMail };