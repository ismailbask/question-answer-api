//* MAİL YOLLAMA
const nodemailer=require('nodemailer');
const sendEmail=async(mailOptions)=>{
    let transporter=nodemailer.createTransport({//* mailoptionsları burada ayarlıyoruz.
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASS,
        }
    });
    let info= await transporter.sendMail(mailOptions);//* yukarda oluşturduğumuz mailoptionsları buraya yolluyoruz.
    console.log(`Message Send:${info.messageId}`);
};
module.exports =sendEmail;