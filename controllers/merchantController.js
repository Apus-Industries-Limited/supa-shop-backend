const { PrismaClient, Prisma } = require("@prisma/client");
const argon = require("argon2");
const randomString = require("crypto-random-string");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/mail");

const prisma = new PrismaClient();


/**
 * @swagger
 * /merchant/auth/register:
 *   post:
 *     summary: Register a new merchant
 *     tags: [Merchant Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone_number
 *               - username
 *               - password
 *               - address
 *               - city
 *               - country
 *               - dp  
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string  
 *               dp:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     username:
 *                       type: string
 *       400:
 *         description: All fields are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */

const createMerchant = async ( req, res ) =>
{
      const { name, email, phone_number, username, password, address, city, country } = req.body;
      const { dp } = req.files;
  try {
    if (!name || !email || !phone_number || !username || !password || !address || !city || !country || !dp )
      return res.status( 400 ).json( { message: "All field is required" } );

    const hashedPassword = await argon.hash(password);
    const code = randomString({ length: 6, type: "numeric" });
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
      color: #fefefe
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
      border: none;
      box-shadow: 2px, 2px, 5px, #ff7500
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to SupaShop!</h1>
    </div>
    <div class="content">
      <p>Thank you for signing up for a merchant account on SupaShop. To verify your email address and unlock full access to our features, please enter the verification code below.</p>
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
            `;
    const subject = "Verify your account SupaShop!";
    const from = `Supashop Support<${process.env.EMAIL}>`;

    const user = await prisma.merchant.create({
      data: {
        name,
        email,
        phone_number,
        username,
        password: hashedPassword,
        verification_code: code,
        address, 
        city, 
        country,
        dp: dp[0].originalname
      },
    });
    delete user.password;
    delete user.verification_code;
    delete user.refresh_token
    await sendMail(from, email, subject, html);
    res.status(201).json({ message: "Account created", user });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002")
        return res.status(409).json({ message: "Email already exist" });
    }
    return res.status(500).json({ message: "internal server error", error: e });
  } finally {
    setTimeout(async () => {
      await prisma.user.update({
        where: { email },
        data: {
          verification_code: "",
        },
      });
    }, 900000);
    await prisma.$disconnect();
  }
};


/**
 * @swagger
 * /merchant/auth/login:
 *   post:
 *     summary: Logs in a merchant
 *     tags: [Merchant Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login was successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login was successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: All fields are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All fields are required
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       404:
 *         description: Merchant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: internal server error
 */

const loginMerchant = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ message: "All field is required" });
    const foundUser = await prisma.merchant.findUniqueOrThrow({ where: { email } });

    const validatePassword = await argon.verify(foundUser.password, password);
    if (!validatePassword)
      return res.status(401).json({ message: "Invalid credentials" });

    // create jwt token
    const accessToken = jwt.sign(
      {
        email: foundUser.email,
        id: foundUser.id,
        name: foundUser.name
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "3h",
      }
    );

    const refreshToken = jwt.sign(
      {
        email: foundUser.email,
        id: foundUser.id,
        name: foundUser.name
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "30d",
      }
    );

    await prisma.merchant.update({
      where: { email },
      data: {
        refresh_token: [...foundUser.refresh_token, refreshToken],
      },
    });

    const user = { ...foundUser, accessToken };

    delete user.password;
    delete user.refresh_token;
    delete user.verification_code;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    res.status(200).json({ message: "Login was successful", user });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Merchant not found" });
    }
    return res.status(500).json({ message: "internal server error", error: e });
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * @swagger
 * /merchant/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Merchant Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent to your email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset link sent to your email
 *       400:
 *         description: Email is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required
 *       404:
 *         description: Merchant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Error details
 */

const forgotMerchantPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Checking if the user exists
    const user = await prisma.merchant.findUniqueOrThrow({
      where: {
        email,
      },
    });


    const resetToken = jwt.sign(
      { user: user.email },
      process.env.PSWD_RESET_TOKEN,
      {
        expiresIn: "1hr",
      }
    );

    await prisma.merchant.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
      },
    });

    // Create a reset password email
    const html = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title> Password Reset Email </title>
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
                <h1> You have requested a password reset for your SupaShop account. </h1>
            </div>
    
            <div class="content">
                <p>Click on the following link to reset your password within 1 hour:</p>
                <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
            </div>
    
            <div class="content">
                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
`;
    const subject = "SupaShop Password Reset";
    const from = `Supashop Support<${process.env.EMAIL}>`;

    // Send the reset password email
    await sendMail(from, email, subject, html);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch ( e ) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Merchant not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * @swagger
 * /merchant/auth/reset-password:
 *   post:
 *     summary: Reset Merchant password
 *     tags: [Merchant Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Reset token received via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired reset token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: internal server error
 *                 error:
 *                   type: string
 *                   example: Error details
 */

const resetMerchantPassword = async (req, res) => {
  const { token } = req.query;
  const { password } = req.body;

  try {
    // Check if reset token is valid
    let email = "";
    if (token) {
      jwt.verify(token, process.env.PSWD_RESET_TOKEN, (err, decoded) => {
        if (err) throw new Error("Invalid or expired reset token");
        email = decoded.user;
      });
    }

    const user = await prisma.merchant.findUniqueOrThrow({
      where: {
        email,
        resetPasswordToken: token,
      },
    });
    // console.log(user, "user");
        
        const validate = await argon.verify(user.password,password)
        if (validate) return res.status(400).json({message:"New password must be differnt from old password"})
    const hashedPassword = await argon.hash(password);

    // Update user with the new password and remove reset token
    await prisma.merchant.update({
      where: { email: user.email },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
      },
    });
    res.status(200).json({ message: "Password reset successful" });
  } catch ( e ) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Merchant not found" });
    }
    if (e.message === "Invalid or expired reset token") {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {createMerchant, loginMerchant,forgotMerchantPassword,resetMerchantPassword}