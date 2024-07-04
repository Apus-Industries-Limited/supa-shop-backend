const { PrismaClient, Prisma } = require("@prisma/client");
const { json } = require( "../utils/bigint-serializer" );
const fs = require( "fs" ).promises;
const prisma = new PrismaClient();
const redis = require( "redis" );

const redisClient = redis.createClient( {
  url: process.env.REDIS_URL
});

/**
 * @swagger
 * /merchant/product:
 *   post:
 *     summary: Create a new product
 *     tags: [Merchant Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         schema:
 *           type: string
 *           format: JWT
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - quantity
 *               - dp
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               category:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               dp:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     category:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     dp:
 *                       type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     merchantId:
 *                       type: integer
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All field is required
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Merchant not logged in
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
const createProduct = async (req, res) => {
  const { name, description, price, category, quantity } = req.body;
  const { dp, images } = req.files;
  try {
    if (!name || !price || !description || !category || !quantity || !dp)
      return res.status(400).json({ message: "All field is required" });
    if (!images)
      return res
        .status(400)
        .json({ message: "Add a minimum of 1 extra image of the product" });

    const product = await prisma.product.create({
      data: {
        name,
        quantity: parseInt(quantity),
        description,
        price: parseFloat(price),
        dp: dp[0].originalname,
        images: images.map((image) => image.originalname),
        category:category.toUpperCase(),
        merchantId: res.merchant.id,
      },
    });

    res.status(201).send(json(product));
  } catch (e) {
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

/**
 * @swagger
 * /merchant/product/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Merchant Products]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         schema:
 *           type: string
 *           format: JWT
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Product Name
 *               price:
 *                 type: number
 *                 example: 19.99
 *               description:
 *                 type: string
 *                 example: Updated Product Description
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: The updated product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedProduct:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     description:
 *                       type: string
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Merchant not logged in
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
const updateProduct = async (req, res) => {
  try {
    const product = req.body;
    if (res.merchant.id)
      return res.status(401).json({ message: "merchant not logged in" });

    const updatedProduct = await prisma.product.update({
      where: {
        id: req.params.id,
        merchantId: res.merchant.id,
      },
      data: product,
    });

    res.status(200).send(json(updatedProduct));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

/**
 * @swagger
 * /merchant/product/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Merchant Products]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         schema:
 *           type: string
 *           format: JWT
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
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

const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.delete({
      where: {
        id: req.params.id,
        merchantId: res.merchant.id,
      },
    });

    await fs.unlink(`/public/product/${product.dp}`);
    product.images.forEach(
      async (img) => await fs.unlink(`/public/product/${img}`)
    );

    res.status(200).send(json({ message: "Product deleted successfully" }));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

/**
 * @swagger
 * /merchant/product:
 *   get:
 *     summary: Get merchant products
 *     tags: [Merchant Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         schema:
 *           type: string
 *           format: JWT
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of records to skip for pagination
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123"
 *                       name:
 *                         type: string
 *                         example: "Product Name"
 *                       price:
 *                         type: number
 *                         example: 99.99
 *                       merchantId:
 *                         type: string
 *                         example: "merchant123"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "internal server error"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */

const getMerchantProduct = async ( req, res ) =>
{
  const skip = +req.query.skip || 0
  const merchantId = res.merchant.id
  const cacheKey = `merchant:${ merchantId }:products:skip:${ skip }`;
  try {
    const cacheData = await req.redisClient.get( cacheKey );
    if ( cacheData ) return res.status(200).json( JSON.parse( cacheData ) );

    const product = await prisma.product.findMany({
      where: { merchantId },
      skip,
      take: 10,
    } );

    await req.redisClient.set( cacheKey, JSON.stringify( product ), { EX: 3600 } )
    
    res.status(200).send(json(product));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

/**
 * @swagger
 * /merchant/product/{id}:
 *   get:
 *     summary: Get a single product for a merchant
 *     tags: [Merchant Products]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         schema:
 *           type: string
 *           format: JWT
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123"
 *                     name:
 *                       type: string
 *                       example: "Product Name"
 *                     price:
 *                       type: number
 *                       example: 99.99
 *                     description:
 *                       type: string
 *                       example: "Product Description"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
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
const getSingleProductMerchant = async ( req, res ) =>
{
  const merchantId = res.merchant.id;
  const { id } = req.params;
  const cacheKey = `merchant:${merchantId}:product:id${id}`
  try {
    const cacheData = await req.redisClient.get( cacheKey );
    if ( cacheData ) return res.status(200).json( JSON.parse( cacheData ) );
    
    const product = await prisma.product.findFirstOrThrow({
      where: { merchantId, id },
    } );
    await req.redisClient.set(cacheKey,JSON.stringify(product),{EX:3600})
    res.status(200).send(json(product));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

/**
 * @swagger
 * /merchant/product/upload/{image}:
 *   delete:
 *     summary: Delete a picture from a product
 *     tags: [Merchant Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         schema:
 *           type: string
 *           format: JWT
 *       - in: path
 *         name: image
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the image to delete
 *     responses:
 *       200:
 *         description: Image has been deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Image has been deleted
 *                 product:
 *                   type: object
 *                   description: Updated product object
 *       404:
 *         description: Images were not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Images were not found
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

const deletePicture = async ( req, res ) =>
{
  try {
    const { image } = req.params;
    const product = await prisma.product.findFirstOrThrow({
      where: {
        merchantId: res.merchant.id,
        images: {
          has: image,
        },
      },
    });

    product.images = product.images.filter((img) => img !== image);
    const updatedProduct = await prisma.product.update({
      where: {
        id: product.id,
        merchantId: res.merchant.id,
      },
      data: product,
    });

    await fs.unlink(`/public/product/${image}`);
    res
      .status(200)
      .send(
        json({ message: "Image has been deleted", product: updatedProduct })
      );
  } catch (error) {
    if (error.code === "ENOENT")
      return res.status(404).json({ message: "Images were not found" });
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /merchant/product/upload:
 *   post:
 *     summary: Upload a picture for a product
 *     tags: [Merchant Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         schema:
 *           type: string
 *           format: JWT
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Product ID
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Picture uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Picture uploaded successfully
 *       400:
 *         description: Product ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product ID is required
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       404:
 *         description: Product not found or Merchant ID does not match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found or Merchant ID does not match
 *       405:
 *         description: Maximum images allowed is five
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Maximum images allowed is five
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

const uploadPicture = async (req, res) => {
  try {
    const { id } = req.body;
    const { images } = req.files;
    if (!id) return res.status(400).json({ message: "Product Id is required" });

    const product = await prisma.product.findFirstOrThrow({
      where: { id, merchantId: res.merchant.id },
    });
    if (product.images.length > 5)
      return res
        .status(405)
        .json({ message: "Maximun images allowed is five" });

    product.images = [...product.images, images.originalname];

    await prisma.product.update( { data: product, where: { id } } );
    return res.status(202).json({message:"Image Updated"})
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/**
 * @swagger
 * /merchant/product/{id}:
 *   post:
 *     summary: Upload product display picture
 *     tags: [Merchant Products]
 *     description: Uploads a display picture for a product.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token
 *         required: true
 *         schema:
 *           type: string
 *           format: JWT
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product.
 *         schema:
 *           type: string
 *       - in: formData
 *         name: dp
 *         type: file
 *         description: The product display picture file.
 *     responses:
 *       202:
 *         description: Product display picture updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product dp updated
 *                 updated:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Product Name
 *                     dp:
 *                       type: string
 *                       example: dp_filename.jpg
 *                     merchantId:
 *                       type: integer
 *                       example: 123
 *       400:
 *         description: Product ID or file is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product or file is missing
 *       401:
 *         description: Unauthorized - Missing bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized - Missing bearer token
 *       403:
 *         description: Forbidden - The user does not have permission to update this product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden - You don't have permission to update this product
 *       404:
 *         description: Product not found or user not authorized.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found or user not authorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
const uploadDp = async (req, res) => {
  try {
    const { id } = req.params;
    const { dp } = req.files;
    if (!id || !dp)
      return res.status(400).json({ message: "Product or file is missing" });

    const product = await prisma.product.findFirstOrThrow({
      where: { id, merchantId: res.merchant.id },
    });

    await fs.unlink(`/public/product/${product.dp}`);

    product.dp = dp[0].originalname;

    const updated = await prisma.product.update({
      data: product,
      where: { id, merchantId: res.merchant.id },
    });

    return res
      .status(202)
      .send(json({ message: "product dp updated", updated }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    console.error( error )
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Product not found" });
    }
    res.status( 500 ).json( { message: "Internal server error" } );
  }
};

/**
 * @dev
 * The lines below are for users who want to scroll through our product
 */

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get a list of products
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           format: int64
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Total number of products
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Product ID
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: Product name
 *                         example: Product 1
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

const listProducts = async ( req, res ) =>
{
  const PAGE_NUMBER = 10
  const skip = +req.query.skip || 0;
  const cacheKey = `products:skip:${ skip }`;
  try {
    const cacheData = await req.redisClient.get( cacheKey );
    if ( cacheData ) return res.status( 200 ).json( JSON.parse( cacheData ) );
    const count = await prisma.product.count()
    const randomOffset = Math.floor(Math.random()*count)

    const adjustedOffset = Math.max(0,randomOffset - PAGE_NUMBER)
    const products = await prisma.product.findMany({
      skip:adjustedOffset,
      take: PAGE_NUMBER,
    } );
    
    await req.redisClient.set( cacheKey, JSON.stringify( products ),{EX:3600});

    res.status(200).send(
      json( products)
    );
    
    
  } catch ( e ) {
    console.error(e)
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the product to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123"
 *                     name:
 *                       type: string
 *                       example: "Product Name"
 *                     price:
 *                       type: number
 *                       example: 99.99
 *                     description:
 *                       type: string
 *                       example: "Product Description"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
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

const getProductById = async ( req, res ) =>
{
  const { id } = req.params;
    const cacheKey = `product:id${id}`
  try {
    const cacheData = await req.redisClient.get( cacheKey );
    if ( cacheData ) return res.status(200).json( JSON.parse( cacheData ) );


    const product = await prisma.product.findFirstOrThrow({
      where: { id },
    } );
    
    await req.redisClient.set(cacheKey,JSON.stringify(product),{EX:3600})

    res.status(200).send(json(product));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};





/**
 * @swagger
 * /product/category:
 *   get:
 *     summary: List all categories
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: object
 *                   properties:
 *                     FASHION:
 *                       type: string
 *                       example: fashion
 *                     ELECTRONICS:
 *                       type: string
 *                       example: electronics
 *                     LIFESTYLE:
 *                       type: string
 *                       example: lifestyle
 *                     PHONE:
 *                       type: string
 *                       example: phone
 *                     ACCESSORIES:
 *                       type: string
 *                       example: accessories
 *                     AUTOMOBILE:
 *                       type: string
 *                       example: automobiles
 *                     GROCERRIES:
 *                       type: string
 *                       example: groceries
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
 *                   example: error message
 */

const listcategory = async ( req, res ) =>
{
const cacheKey = "categories"
  try {
    const cacheData = await req.redisClient.get( cacheKey );
    if ( cacheData ) return res.status(200).json( JSON.parse( cacheData ) );
    const category = {
      FASHION: "fashion",
      ELECTRONICS: "elecronics",
      LIFESTYLE: "lifestyle",
      PHONE: "phone",
      ACCESSORIES: "accessories",
      AUTOMOBILE: "automobiles",
      GROCERRIES: "grocerries",
    };
    await req.redisClient.set(cacheKey,JSON.stringify(category),{EX:3600})
    return res.status(200).json({ category });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};




/**
 * @swagger
 * /product/category/product:
 *   get:
 *     tags: [Product]
 *     summary: Retrieve products by category
 *     description: Retrieve a list of products based on the specified category. The results are paginated.
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: The category of the products
 *       - in: query
 *         name: skip
 *         required: false
 *         schema:
 *           type: integer
 *         description: The number of items to skip before starting to collect the result set
 *     responses:
 *       202:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       price:
 *                         type: number
 *                         format: float
 *                 count:
 *                   type: integer
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
 *                   type: string
 */

const getProductByCategory = async ( req, res ) =>
{
  const PAGE_NUMBER = 10
  const skip = +req.query.skip || 0;
  const category = req.query.category;
  const cacheKey = `products:category:${category}:skip:${ skip }`;
  try {
    const cacheData = await req.redisClient.get( cacheKey );
    if ( cacheData ) return res.status( 200 ).json( JSON.parse( cacheData ) );
    if ( !category ) return res.status( 400 ).send( "No category provided" );
    const count = await prisma.product.count( {
      where: {
        category: category.toUpperCase()
      }
    })
    const randomOffset = Math.floor( Math.random() * count );

    const adjustedOffset = Math.max( 0, randomOffset - PAGE_NUMBER );

    const products = await prisma.product.findMany({
      where: {
        category: category.toUpperCase(),
      },
      skip:adjustedOffset,
      take: PAGE_NUMBER,
    } );
    
    await req.redisClient.set( cacheKey, JSON.stringify( products ), { EX: 3600 } );
    
    return res.status(202).send(json(products));
  } catch (e) {
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};




/**
 * @swagger
 * /product/search:
 *   get:
 *     tags: [Product]
 *     summary: Search and filter products
 *     description: Retrieve a list of products based on search criteria and price range. The results are paginated.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: The search keyword for the product name
 *       - in: query
 *         name: skip
 *         required: false
 *         schema:
 *           type: integer
 *         description: The number of items to skip before starting to collect the result set
 *       - in: query
 *         name: minPrice
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: The minimum price of the products
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: The maximum price of the products
 *     responses:
 *       202:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                         format: float
 *                 count:
 *                   type: integer
 *       400:
 *         description: Bad Request
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
 *                   type: string
 */
const searchFilter = async ( req, res ) =>
{

  try {
    const { search, skip, minPrice, maxPrice } = req.query;
    let whereClause = {};

    if (!search)
      return res.status(400).json({ message: "enter a search word" });
    whereClause.name = {
      contains: search,
      mode: "insensitive",
    };

    whereClause.description = {
      contains: search,
      mode: "insensitive",
    }

    if (minPrice && !isNaN(minPrice)) {
      whereClause.price = {
        gte: parseFloat(minPrice),
      };
    }

    if (maxPrice && !isNaN(maxPrice)) {
      whereClause.price = {
        ...whereClause.price,
        lte: parseFloat(maxPrice),
      };
    }
    const count = await prisma.product.count( { where: whereClause } );

    const randomOffset = Math.floor( Math.random() * count );

    const adjustedOffset = Math.max( 0, randomOffset - PAGE_NUMBER );

    const products = await prisma.product.findMany({
      where: whereClause,
      skip: adjustedOffset,
      take: 10,
    });
    return res.status(202).send(json(products));
  } catch (e) {
    console.error(e.message);
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
};

const cleanUp = async () =>
{
  await prisma.$disconnect();
  if ( !redisClient.isOpen ) return;
  return redisClient.quit();
}

module.exports = {
  cleanUp,
  createProduct,
  getProductById,
  deleteProduct,
  listProducts,
  updateProduct,
  getMerchantProduct,
  getSingleProductMerchant,
  deletePicture,
  uploadDp,
  uploadPicture,
  listcategory,
  getProductByCategory,
  searchFilter,
};
