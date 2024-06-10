const { PrismaClient, Prisma } = require("@prisma/client");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const prisma = new PrismaClient();

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // invalid token
    res.user = { email: decoded.email, id: decoded.id, name: decoded.name };
    next();
  });
};

const verifyMerchant = async (req, res, next) => {
  try {
    const merchant = await prisma.merchant.findUniqueOrThrow({
      where: {
        email: res.user.email,
        id: res.user.id,
      },
    });
    res.merchant = merchant;

    next();
  } catch (e) {
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

module.exports = {
  verifyJwt,
  verifyMerchant,
};
