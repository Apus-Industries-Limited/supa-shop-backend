const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

const { json } = require("../utils/bigint-serializer");

const addToCart = async (req, res) => {
  let { productId, quantity } = req.body;
  quantity = parseInt(quantity);

  try {
    // check if cart product already exists
    const foundProduct = await prisma.cartItem.findFirst({
      where: {
        userId: res.user.id,
        productId: productId,
      },
    });
    if (foundProduct) {
      await prisma.cartItem.update({
        where: {
          id: foundProduct.id,
          userId: res.user.id,
        },
        data: {
          quantity: foundProduct.quantity + 1,
        },
      });

      res.status(200).send("Item quantity increased");
    } else {
      const product = await prisma.product.findFirstOrThrow({
        where: {
          id: productId,
        },
      });

      const cart = await prisma.cartItem.create({
        data: {
          userId: res.user.id,
          productId: product.id,
          quantity: quantity,
        },
      });
      res
        .status(201)
        .json({ message: "Cart successfully updated", cart: cart });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  } finally {
    await prisma.$disconnect();
  }
};

const removeFromCart = async (req, res) => {
  // check if user is deleting his own item
  try {
    await prisma.cartItem.delete({
      where: {
        id: req.params.id,
        userId: res.user.id,
      },
    });

    res.status(200).json({ message: "Item removed successfully" });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "CartItem not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  } finally {
    await prisma.$disconnect();
  }
};

// const emptyCart = async (req, res) => {
//   // check if user is deleting his own cart
//   try {
//     await prisma.cartItem.delete({
//       where: {
//         userId: res.user.id,
//       },
//     });

//     res.status(200).json({ message: "Cart deleted successfully" });
//   } catch (e) {
//     if (e instanceof Prisma.PrismaClientKnownRequestError) {
//       if (e.code === "P2025")
//         return res.status(404).json({ message: "No Cart Found For This User" });
//     }
//     return res
//       .status(500)
//       .json({ message: "internal server error", error: e.message });
//   } finally {
//     await prisma.$disconnect();
//   }
// };

const changeQuantity = async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity);
    // check if user is updating his own item
    const updatedCart = await prisma.cartItem.update({
      where: {
        id: req.params.id,
        userId: res.user.id,
      },
      data: {
        quantity: quantity,
      },
    });

    res
      .status(200)
      .json({ message: "Item quantity changed", cart: updatedCart });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Item not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  } finally {
    await prisma.$disconnect();
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await prisma.cartItem.findMany({
      where: {
        userId: res.user.id,
      },
      include: {
        product: true,
      },
    });

    res.status(200).send(json(cart));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Cart not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  // emptyCart,
  changeQuantity,
  getCart,
};
