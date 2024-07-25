const { PrismaClient,Prisma } = require("@prisma/client");
const randomString = require("crypto-random-string");
const { sendMail } = require("../utils/mail");

const prisma = new PrismaClient();

/**
 * @swagger
 * /verify-mail/{email}:
 *   get:
 *     summary: Send a verification email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: User's email address to send the verification code
 *     responses:
 *       200:
 *         description: Verification mail has been sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification mail has been sent
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
 *         description: User not found
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
 *                   example: Error details
 */
const verificationMail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Checking if the user
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        email,
      },
    });

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
            `;
    const subject = "Verify your account SupaShop!";
    const from = `Supashop Support<${process.env.EMAIL}>`;

    await prisma.user.update({
      where: { email },
      data: {
        verification_code: code,
      },
    });

    await sendMail(from, email, subject, html);
    res.status(200).json({ message: "Verification mail has been sent" });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "internal server error", error: e });
  }finally {
    setTimeout(async () => {
    await prisma.merchant.update({
      where: { email },
      data: {
        verification_code: "",
      },
    });
  }, 900000);
  }
};

/**
 * @swagger
 * /verify-mail:
 *   post:
 *     summary: Verify user's email with a verification code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       202:
 *         description: User has been verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User has been verified successfully
 *       400:
 *         description: Bad request - Missing email or code, or invalid verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All field is required or Invalid Verification code
 *       404:
 *         description: User not found
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
 */
const verifyCode = async (req, res) => {
  try {
    const { code, email } = req.body;
    if (!email || !code)return res.status(400).json({ message: "All field is required" });

    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    if (user.verification_code !== code)
      return res.status(400).json({ message: "Invalid Verification code" });

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        isVerified: true,
        verification_code: null,
      },
    });
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
      <p>Hi ${ user.name },</p>
      <p>Your email address has been successfully verified. You're now ready to explore all the great things SupaShop has to offer.</p>
    </div>
    <div class="cta">
      <a href="${process.env.FRONTEND_URL}">Start Exploring Now!</a>
    </div>
  </div>
</body>
</html>
            `;
    const subject = "Verification Successful!";
    const from = `Supashop Support<${process.env.EMAIL}>`;

    await sendMail(from, email, subject, html);
    return res
      .status(202)
      .json({ message: "User has been verified successfully" });
  }catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "internal server error", error: e });
  }
};


/**
 * @swagger
 * /merchant/auth/verify-mail/{email}:
 *   get:
 *     summary: Send a verification email
 *     tags: [Merchant Auth]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: Merchant's email address to send the verification code
 *     responses:
 *       200:
 *         description: Verification mail has been sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification mail has been sent
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
 *                   example: Error details
 */

const verificationMerchantMail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Checking if the user
    const user = await prisma.merchant.findUniqueOrThrow({
      where: {
        email,
      },
    });

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

    await prisma.merchant.update({
      where: { email },
      data: {
        verification_code: code,
      },
    });

    await sendMail(from, email, subject, html);
    res.status(200).json({ message: "Verification mail has been sent" });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "internal server error", error: e });
  } finally {
    setTimeout(async () => {
    await prisma.merchant.update({
      where: { email },
      data: {
        verification_code: "",
      },
    });
  }, 900000);
  }
};


/**
 * @swagger
 * /merchant/auth/verify-mail:
 *   post:
 *     summary: Verify merchant's email with a verification code
 *     tags: [Merchant Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       202:
 *         description: merchant has been verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: merchant has been verified successfully
 *       400:
 *         description: Bad request - Missing email or code, or invalid verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All field is required or Invalid Verification code
 *       404:
 *         description: merchant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: merchant not found
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
 */

const verifyMerchantCode = async (req, res) => {
  try {
    const { code, email } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "All field is required" });

    const user = await prisma.merchant.findUniqueOrThrow({ where: { email } });

    if (user.verification_code !== code)
      return res.status(400).json({ message: "Invalid Verification code" });

    await prisma.merchant.update({
      where: {
        email,
      },
      data: {
        isVerified: true,
        verification_code: null,
      },
    });
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
      <a href="${process.env.FRONTEND_URL}/merchnt">Start Exploring Now!</a>
    </div>
  </div>
</body>
</html>
            `;
    const subject = "Verification Successful!";
    const from = `Supashop Support<${process.env.EMAIL}>`;

    await sendMail(from, email, subject, html);
    return res
      .status(202)
      .json({ message: "User has been verified successfully" });
  }catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "internal server error", error: e });
  }
};
const cleanUp = async () =>
{
  await prisma.$disconnect();
}


module.exports = { verificationMail, verifyCode,verificationMerchantMail,verifyMerchantCode,cleanUp };
