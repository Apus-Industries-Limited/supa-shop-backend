const { PrismaClient, Prisma } = require( "@prisma/client" );

const prisma = new PrismaClient();

const addToWishlist = async ( req, res ) => {
      const { userId, productId } = req.body;
      try {
            if ( userId || productId ) return res.status( 400 ).json( { message: "user Id or Product id is missing" } );
            await prisma.user.findFirstOrThrow( {
                  where:{id:userId}
            } )
            await prisma.product.findFirstOrThrow( {
                  where:{id:productId}
            } )
            
            const wishlist = await prisma.wishlist.create( {
                  data: {
                        userId,
                        productId
                  }
            } )
            
            return res.status(201).json({message:"Item added to wishlist", wishlist})
      } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                  if (e.code === "P2025")
                  return res.status(404).json({message:"User or Product not found"})
            }
            return res.status(500).json(e)
      }
};

const getWishlist = async (req,res) =>
{
      
      try {
            const { id } = req.params
            if ( !id ) return res.status( 400 ).json( { message: "user Id is missing" } );

            const cacheKey = `wishlist:user:${ id }`;
            const cacheData = await req.redisClient.get( cacheKey );
            if ( cacheData ) return res.status( 200 ).json( JSON.parse( cacheData ) );
            await prisma.user.findFirstOrThrow( {
                  where: {
                  id
                  }
            } )
            const wishlist = await prisma.wishlist.findMany( {
                  where: {
                        userId : id
                  }
            } )

            await req.redisClient.set( cacheKey, JSON.stringify( wishlist ), { EX: 3600 } )
            
            return res.status( 200 ).json( wishlist );
      } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                  if (e.code === "P2025")
                  return res.status(404).json({message:"User not found"})
            }
            return res.status(500).json(e)
      }
};

const removeWishlist = async ( req, res ) =>
{
      try {
            const { id } = req.params;
            if ( !id ) return res.status( 400 ).json( { message: "wishlist item Id is missing" } );
            await prisma.wishlist.delete( { where: { id } } )
            return res.status(202).json({message:"Item removed from wishlist"})
      } catch (e) {
            return res.status(500).json(e)
      }
};

const removeAllWishlist = async ( req, res ) =>
{
      try {
            const { userId } = req.query;
            if ( !userId ) return res.status( 400 ).json( { message: "user Id is missing" } );
            await prisma.wishlist.deleteMany( {
                  where:{userId}
            } )
            return res.status(202).json({message:"Wishlist is cleared"})
      } catch (e) {
            return res.status(500).json(e)
      }
};

module.exports ={addToWishlist,removeAllWishlist, removeWishlist, getWishlist}