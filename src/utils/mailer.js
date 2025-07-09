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
    logger: true, 
    debug: true 
});



export async function sendPayerIdEmail(email, firstName, payerId) {
  const template =loadTemplate('payer.html');
  let html = populateTemplate(templatePath,{ 
    firstName, payerId
  });

  const mailOptions = {
    from: `"LAWMA KYC" <${process.env.MAIL_USER}>`,
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


export  async function sendConfirmationMail (email, name){
    const template = loadTemplate('welcome.html');
    const html =populateTemplate(template, {
        name,
    })
    const mailOptions = {
        from:process.env.EMAIL_FROM, 
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


export  async function  sendResetEmail (email,name, resetToken)  {
  const template = loadTemplate('forgotpassword.html');
  const html = populateTemplate(template,{
    name,
    resetPasswordLink : `https://smartbin.com.ng/reset-password?token=${resetToken}`
  })
  const mailOptions = {
    from:process.env.EMAIL_FROM,
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