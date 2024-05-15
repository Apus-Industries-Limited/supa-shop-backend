const { PrismaClient, Prisma } = require("@prisma/client");
const { sendMail } = require("../utils/mail");

const prisma = new PrismaClient();
const date = new Date();
const year = date.getFullYear();

/**
 * @swagger
 * /waitlist:
 *   post:
 *     summary: Join the waitlist
 *     tags: [Waitlist]
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
 *       201:
 *         description: Successfully joined the waitlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You have successfully joined supashop customer waitlist. Stay tuned for updates on your mail.
 *       400:
 *         description: Invalid email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Enter a valid email
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email already exist
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
const joinWaitlist = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Enter a valid email" });
    await prisma.waitlist.create({
      data: {
        email,
      },
    });

    const html = `
                  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thanks for Joining the Waitlist!</title>
  <style>
    /* Basic styles */
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 0;
      color: #fff;
      background-color: #ff7900;
    }
    .container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    /* Header styles */
    header {
      text-align: center;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    img {
      width: 150px;
      height: auto;
      margin: 0 auto;
      display: block;
    }
    /* Body styles */
    p {
      line-height: 1.5;
    }
    .cta {
      text-align: center;
      margin-top: 20px;
    }
    a {
      background-color: #333;
      color: white;
      padding: 10px 15px;
      text-decoration: none;
      border-radius: 5px;
    }
    /* Footer styles */
    footer {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #aaa;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Thanks for Joining the Waitlist for SupaShop!</h1>
    </header>
    <p>Hi,</p>
    <p>We're thrilled you're interested in SupaShop! You're now on the waitlist and will be among the first to be notified when it becomes available.</p>
    <p>In the meantime, you can learn more about SupaShop by visiting our product page</p>
    <p>We'll send you an email as soon as SupaShop has successfully be launched and fit for use. Don't miss out!</p>
    <div class="cta">
      <a href="https://supashop.co/213edaq3ew2">Learn More About SupaShop</a>
    </div>
    <footer>
      <p>&#169; SupaShop ${year}</p>
    </footer>
  </div>
</body>
</html>
            `;
    const subject = "Wailtist subscription";
    const from = `Supashop Support<${process.env.EMAIL}>`;
    await sendMail(from, email, subject, html);
    return res.status(201).json({
      message:
        "You have successfully joined supashop customer waitlist. Stay tuned for updates on your mail.",
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002")
        return res.status(409).json({ message: "Email already exist" });
    }
    return res.status(500).json({ message: "internal server error", error: e });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { joinWaitlist };
