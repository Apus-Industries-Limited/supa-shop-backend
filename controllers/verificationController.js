const { PrismaClient } = require( '@prisma/client' );
const randomString = require("crypto-random-string");
const { sendMail } = require( '../utils/mail' );

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

            const code = randomString( { length: 6, type: "numeric" } );
            const html = `
                  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email Address</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
      border-radius: 5px;
      background-color: #ff7900;
    }
    .header {
      text-align: center;
    }
    .content {
      padding: 20px;
    }
    .cta {
      text-align: center;
      margin-top: 20px;
    }
    a {
      color: #fff2eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to SupaShop!</h1>
    </div>
    <div class="content">
      <p>Thank you for signing up for an account on SupaShop. To verify your email address and unlock full access to our features, please enter the verification code below.</p>
    </div>
    <div class="cta">
      <h1>${code}</h1>
    </div>
    <div class="content">
      <p>For your security, this verification code will expire in 15 minutes.</p>
    </div>
    <div class="content">
      <p>If you didn't create an account on SupaShop, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
            `
            const subject = "Verify your account SupaShop!"
            const from = `Supashop Support<${process.env.EMAIL}>`

            await prisma.user.update( {
                  where: { email },
                  data: {
                        verification_code: code,
                  }
            } )
            
            await sendMail(from,email,subject,html)
            res.status(200).json({message:"Verification mail has been sent"})
            
      } catch (error) {
            console.error( error )
            return res.status(500).json({message:error})
      }setTimeout( async () =>
        {
              await prisma.user.update( {
                    where: { email },
                    data: {
                          verification_code: ""
                    }
              } )
        }, 900000)
        await prisma.$disconnect()
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
            } )
            const html = `
                  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Email is Verified!</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ff7900;
    }
    .header {
      text-align: center;
    }
    .content {
      padding: 20px;
    }
    .cta {
      text-align: center;
      margin-top: 20px;
    }
    a {
      text-decoration: none;
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to SupaShop!</h1>
    </div>
    <div class="content">
      <p>Hi ${user.name},</p>
      <p>Your email address has been successfully verified. You're now ready to explore all the great things SupaShop has to offer.</p>
    </div>
    <div class="cta">
      <a href="https://supashop.co/213edaq3ew2">Start Exploring Now!</a>
    </div>
  </div>
</body>
</html>
            `
            const subject = "Verification Successful!"
            const from = `Supashop Support<${ process.env.EMAIL }>`
            
            await sendMail(from,email,subject,html)
            return res.status(202).json({message:"User has been verified successfully"})
      } catch (error) {
            console.error( error )
            return res.status(500).json({message:error})
      }finally {
            await prisma.$disconnect()
      }
}


module.exports={verificationMail,verifyCode}