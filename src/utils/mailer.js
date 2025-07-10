import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


const _filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(_filename);

const loadTemplate = (filename) => {
    const filepath = path.join(__dirname, '..', 'views', filename);
    return fs.readFile(filepath, 'utf-8');
  };

  const populateTemplate = (template, variables) => {
    return Object.entries(variables).reduce((html, [key, value]) => {
      return html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    },template);
  };

  const transporter =nodemailer.createTransport({
    host:process.env.MAIL_SERVICE,
    port:process.env.MAIL_PORT,
    secure:false,
    auth:{
        user:process.env.MAIL_USERNAME,
        pass:process.env.MAIL_PASSWORD,
    },
    logger: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production'
});



export async function sendPayerIdEmail(email, firstName, payerId) {
  const template = await loadTemplate('payer.html');
  let html = populateTemplate(template,{ 
    firstName, payerId
  });
  console.log(html)

  const mailOptions = {
    from: `"LAWMA KYC" <${process.env.MAIL_USERNAME}>`,
    to:email,
    subject: 'Your LAWMA Payer ID',
    html,
  };

    try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Payer Id Sent: " + info.response);
  } catch (error) {
    console.error("Error sending payerId:", error);
  }
}


export  async function sendConfirmationMail (email, firstName){
    const template = await loadTemplate('welcome.html');
    const html =populateTemplate(template, {
      firstName
    })
    const mailOptions = {
        from: `"LAWMA REG" <${process.env.MAIL_USERNAME}>`,
        to:email,
        subject:"Registration Successful",
        html:html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Confirmation Email sent: " + info.response);
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }

}


export  async function  sendResetEmail (email,firstName, resetToken)  {
  const template = await loadTemplate('forgotpassword.html');
  const html = populateTemplate(template,{
    firstName,
    resetPasswordLink : `https://smartbin.com.ng/reset-password?token=${resetToken}`
  })
  const mailOptions = {
    from: `"LAWMA KYC" <${process.env.MAIL_USERNAME}>`,
        to:email,
    subject: "Password Reset Request",
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Password Reset Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending reset email:", error);
  }

}