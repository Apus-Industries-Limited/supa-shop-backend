const nodemailer = require( 'nodemailer' );

const transporter =  nodemailer.createTransport( {
                  host: process.env.HOST_MAIL,
                  port: process.env.MAIL_PORT,
                  auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD
                  },
                  tls: {
                        rejectUnauthorized:false
                  }
            } )

const sendMail = async (from,to,subject,html) =>
{
      try {
            await transporter.sendMail( {
                  from,
                  to,
                  subject,
                  html
            } )
            return console.log("Email sent")
      } catch (error) {
            throw new Error(error)
      }
};


module.exports ={sendMail}