const { PrismaClient, Prisma } = require( '@prisma/client' );
const nodemailer = require( 'nodemailer' );
const randomString = require("crypto-random-string")

const prisma = new PrismaClient();

const verificationMail = async ( req, res ) =>
{
      try {
            const { email } = req.params;
            if (!email) return res.status(400).json({message: "Email is required"});
            
            // Checking if the user
            const user = await prisma.user.findUnique( {
                  where: {
                  email
                  }
            } )
            
            if ( !user ) return res.status( 404 ).json( { message: "User not found" } )

            const code = randomString({ length: 6, type:"numeric" });


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

            await prisma.user.update( {
                  where: { email },
                  data: {
                        verification_code: code,
                  }
            })
            
            const mail = await transporter.sendMail( {
                  from: `Supashop Support<${process.env.EMAIL}>`,
                  to: email,
                  subject: "Verify your account SupaShop!",
                  body:`You recently requested for a verification code. \n Your verification code is ${code}`
            } )
            
            res.status(200).json({message:"Verification mail has been sent"})
            
      } catch (error) {
            console.error( error )
            return res.status(500).json({message:error})
      } finally {
            await prisma.$disconnect()
      }
};

const verifyCode = async ( req, res ) =>
{
      try {
            const { code, email } = req.body;
            if ( !email || !code ) return res.status( 400 ).json( { message: "All field is required" } );
            
            const user = await prisma.user.findUnique( { where: { email } } )
            if ( !user ) return res.status( 404 ).json( { message: "User not found" } )

            if ( user.verification_code !== code ) return res.status( 400 ).json( { message: 'Invalid Verification code' } )
            
            await prisma.user.update( {
                  where: {
                        email
                  },
                  data: {
                        isVerified: true,
                        verification_code: null
                  }
            })
            return res.status(202).json({message:"User has been verified successfully"})
      } catch (error) {
            console.error( error )
            return res.status(500).json({message:error})
      }finally {
            await prisma.$disconnect()
      }
}


module.exports={verificationMail,verifyCode}