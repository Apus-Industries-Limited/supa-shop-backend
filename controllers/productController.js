const { PrismaClient, Prisma } = require( "@prisma/client" );
const jwt = require("jsonwebtoken")

const prisma = new PrismaClient();

const createProduct = async (req, res) => {
  console.log(req.body);
  const { name, desc, price } = req.body;
  try {
    if (!name || !price || !desc)
      return res.status(400).json({ message: "All field is required" });
    const product = await prisma.product.create({
      data: {
        ...req.body,
        merchantId: res.merchant.id,
      },
    });

    res.status(201).json({ product });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  } finally {
    await prisma.$disconnect();
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = req.body;
    console.log(product, "product");

    const updatedProduct = await prisma.product.update({
      where: {
        id: req.params.id,
        merchantId: res.merchant.id,
      },
      data: product,
    });

    res.status(200).json({ updatedProduct });
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

const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: {
        id: req.params.id,
        merchantId: res.merchant.id,
      },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (e) {
    if (e instanceof PrismaInstance.PrismaClientKnownRequestError) {
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

const listProducts = async (req, res) => {
  try {
    const count = await prisma.product.count();
    const products = await prisma.product.findMany({
      skip: +req.query.skip || 0,
      take: 10,
    });

    res.status(200).json({
      count,
      data: products,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  } finally {
    await prisma.$disconnect();
  }
};

const getProductById = async (req, res) => {
  try {
    const {id} = req.params
    const product = await prisma.product.findFirstOrThrow({
      where: { id },
    } );
    
    res.status(200).json({
      product,
    });
  } catch (e) {
    if (e instanceof PrismaInstance.PrismaClientKnownRequestError) {
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


const getMerchantProduct = async ( req, res ) =>
{
  try {
    const cookies = req.cookies;
    if ( !cookies?.refreshToken ) return res.sendStatus( 401 );
    const token = cookies.refreshToken
    let id;
    const foundUser = await prisma.merchant.findFirst( {
      where: {
            refresh_token: {
            has: token
      }
      }
    } )
    if ( !foundUser ) return res.sendStatus( 403 );

    jwt.verify( token, process.env.REFRESH_TOKEN_SECRET, async ( err, decoded ) =>
    {
      if ( err || foundUser.email !== decoded.email ) return res.status( 403 );
      id = foundUser.id
      const product = await prisma.product.findMany({
        where: { merchantId: id },
        skip: +req.query.skip || 0,
        take: 10,
      });
      res.status(200).json({
        product,
      });
    })

    
  } catch (e) {
    if (e instanceof PrismaInstance.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  } finally {
    await prisma.$disconnect();
  }
}

const getSingleProductMerchant = async ( req, res ) =>
{
  try {
    const cookies = req.cookies;
    const { id } = req.params;
    let userId;
    if ( !cookies?.refreshToken ) return res.sendStatus( 401 );
    const token = cookies.refreshToken;
    const foundUser = await prisma.merchant.findFirst( {
      where: {
        refresh_token: {
          has: token
        }
      }
    } );
    if ( !foundUser ) return res.sendStatus( 403 );

    jwt.verify( token, process.env.REFRESH_TOKEN_SECRET, async ( err, decoded ) =>
    {
      if ( err || foundUser.email !== decoded.email ) return res.status( 403 );
      userId = foundUser.id;
      const product = await prisma.product.findFirstOrThrow( {
        where: { merchantId: userId, id }
      } );
      res.status( 200 ).json( {
        product,
      } );
    } );

  } catch (e) {
    if (e instanceof PrismaInstance.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = {
  createProduct,
  getProductById,
  deleteProduct,
  listProducts,
  updateProduct,
  getMerchantProduct,
  getSingleProductMerchant
};
