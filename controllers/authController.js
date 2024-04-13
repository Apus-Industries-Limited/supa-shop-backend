const { PrismaClient, Prisma } = require( '@prisma/client' );
const argon = require( "argon2" )
const randomString = require( "crypto-random-string" );
const jwt = require("jsonwebtoken")
const { sendMail } = require( '../utils/mail' );


const prisma = new PrismaClient()

const createUser = async ( req, res ) =>
{
      const { name, email, phone_number, username, password } = req.body
      try {
            if ( !name || !email || !phone_number || !username || !password ) return res.status( 400 ).json( { message: "All field is required" } );
            
            const hashedPassword = await argon.hash( password )
            
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

            const user = await prisma.user.create( {
                  data: {
                        name,
                        email,
                        phone_number,
                        username,
                        password: hashedPassword,
                        verification_code: code
                  }
            } )
            delete user.password
            delete user.verification_code

            console.log(user)
            await sendMail( from, email, subject, html )
            res.status(201).json({message:"Account created", user})
      } catch (e) {
            if ( e instanceof Prisma.PrismaClientKnownRequestError ) {
                  if(e.code === 'P2002') return res.status(409).json({message:"Email already exist"})
            }
            return res.status(500).json({message:"internal server error", error:e})
      } finally {
            setTimeout( async () =>
            {
                  await prisma.user.update( {
                        where: { email },
                        data: {
                              verification_code: ""
                        }
                  } )
            }, 900000)
            await prisma.$disconnect()
      }
};

const loginUser = async ( req, res ) =>
{
      const { email, password } = req.body
      try {
            if ( !email || !password ) return res.status( 400 ).json( { message: "All field is required" } );
            const foundUser = await prisma.user.findUniqueOrThrow( { where: { email } } )
            
            const validatePassword = await argon.verify(foundUser.password,  password );
            if ( !validatePassword ) return res.status( 401 ).json( { message: "Invalid credentials" } )
            
            // create jwt token
            const accessToken = jwt.sign( {
                  "email":foundUser.email
            }, process.env.ACCESS_TOKEN_SECRET, {
                  expiresIn: '3h'
            } )
            
            const refreshToken = jwt.sign( {
                  "email":foundUser.email
            }, process.env.REFRESH_TOKEN_SECRET, {
                  expiresIn: '30d'
            } )

            await prisma.user.update( {
                  where: { email },
                  data: {
                        refresh_token: [...foundUser.refresh_token,refreshToken]
                  }
            }
            )

            const user = { ...foundUser, accessToken }
            
            delete user.password
            delete user.refresh_token
            delete user.verification_code
            

            res.cookie( 'refreshToken', refreshToken, {
                  httpOnly: true,
                  maxAge: 30 * 24 * 60 * 60 * 1000,
                  sameSite:"None",
                  secure: true
            } )


            res.status(200).json({message:"Login was successful", user})

      } catch ( e ) {
            if ( e instanceof Prisma.PrismaClientKnownRequestError ) {
                  if(e.code === 'P2025') return res.status(404).json({message:"User not found"})
            }
            return res.status(500).json({message:"internal server error", error:e})
      } finally {
            await prisma.$disconnect()
      }
}


module.exports ={createUser,loginUser}