const { PrismaClient, Prisma } = require("@prisma/client");
const { productSelect } = require( "../constant/safeData" );
// const { json } = require( "../utils/bigint-serializer" );

const prisma = new PrismaClient()

const addProductReview = async ( req, res ) =>
{
      const { review, rating, productId } = req.body;
      try {
            if(!productId || !review || !rating) return res.status(400).json({message:'Product Id is required'})
            const product = await prisma.product.findUniqueOrThrow( { where: { id: productId } } );
            if ( product.reviews ) {
                  const existReveiw = product.reviews.find( review => review.userId === res.user.id )
                  if ( existReveiw ) return res.status( 409 ).json( { message: "User already made a review" } );
                  product.reviews = [ { userId: res.user.id, review }, ...product.reviews ]
                  product.ratings = [ { userId: res.user.id, rating }, ...product.ratings ]
                  await prisma.product.update( {
                  where: { id: productId },
                  data: product
            } )
            return res.status(201).json({ratings:product.ratings, review:product.reviews})
            }
            product.reviews = [ { userId:res.user.id, review } ]
            product.ratings = [ { userId: res.user.id, rating } ];
            await prisma.product.update( {
                  where: { id: productId },
                  data: product
            } )
            return res.status(201).json({ratings:product.ratings, review:product.reviews})
      } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
            return res.status(404).json({ message: "Product or User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}

const deleteProductReview = async ( req, res ) =>
{
      const { productId } = req.body;
      try {
            if(!productId) return res.status(400).json({message:'Product Id is required'})
            const product = await prisma.product.findUniqueOrThrow( {
                  where: {
                        id: productId
                  },
                  select: productSelect
            } )

            const newReview = product.reviews.filter( review => review.userId !== res.user.id);
            const newRating = product.ratings.filter( rating => rating.userId !== res.user.id );
            product.reviews = newReview;
            product.ratings = newRating;
            
            await prisma.product.update( {
                  where: { id: productId },
                  data: product
            } )
            return res.status(201).json({ratings:newRating, review:newReview})

      } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
            return res.status(404).json({ message: "Product or User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}

const addStoreReview = async ( req, res ) =>
{
      const { review, rating, storeId } = req.body;
      try {
            if(!storeId || !review || !rating) return res.status(400).json({message:'Product Id is required'})
            const store = await prisma.merchant.findUniqueOrThrow( { where: { id: storeId } } );
            if ( store.reviews ) {
                  const existReveiw = store.reviews.find( review => review.userId === res.user.id )
                  if ( existReveiw ) return res.status( 409 ).json( { message: "User already made a review" } );
                  store.reviews = [ { userId: res.user.id, review }, ...store.reviews ]
                  store.ratings = [ { userId: res.user.id, rating }, ...store.ratings ]
                  await prisma.merchant.update( {
                  where: { id: storeId },
                  data: store
            } )
            return res.status(201).json({ratings:store.ratings, review:store.reviews})
            }
            store.reviews = [ { userId:res.user.id, review } ]
            store.ratings = [ { userId: res.user.id, rating } ];
            await prisma.merchant.update( {
                  where: { id: storeId },
                  data: store
            } )
            return res.status(201).json({ratings:store.ratings, review:store.reviews})
      } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
            return res.status(404).json({ message: "store or User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}

const deleteStoreReview = async ( req, res ) =>
{
      const { storeId } = req.body;
      try {
            if(!storeId) return res.status(400).json({message:'store Id is required'})
            const store = await prisma.merchant.findUniqueOrThrow( {
                  where: {
                        id: storeId
                  },
                  select: storeSelect
            } )

            const newReview = store.reviews.filter( review => review.userId !== res.user.id);
            const newRating = store.ratings.filter( rating => rating.userId !== res.user.id );
            store.reviews = newReview;
            store.ratings = newRating;
            
            await prisma.merchant.update( {
                  where: { id: storeId },
                  data: store
            } )
            return res.status(200).json({ratings:newRating, review:newReview})

      } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
            return res.status(404).json({ message: "Product or User not found" });
    }
    return res
      .status(500)
      .json({ message: "internal server error", error: e.message });
  }
}


module.exports={addProductReview,deleteProductReview,addStoreReview,deleteStoreReview}