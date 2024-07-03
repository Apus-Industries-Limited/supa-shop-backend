const { PrismaClient, Prisma } = require( "@prisma/client" );
const { safeMerchant } = require( "../constant/safeData" );

const prisma = new PrismaClient();

const getStores = async (req,res) =>
{
      const skip = +req.query.skip || 0;
      const cacheKey = `store:skip:${ skip }`;
      try {
            const cacheData = await req.redisClient.get( cacheKey );
            if ( cacheData ) return res.status( 200 ).json( JSON.parse( cacheData ) );
            
            const stores = await prisma.merchant.findMany( {
                  skip,
                  take: 10,
                  select: safeMerchant
            } )
            
            await req.redisClient.set( cacheKey, JSON.stringify( stores ), { EX: 3600 } );
            return res.status( 200 ).json( stores );
      } catch (e) {
            res.status(500).json({message:"Internal sever error", error: e.message})
      }
};

const getStoreProduct = async ( req, res ) =>
{
      try {
            const skip = +req.query.skip || 0;
            const storeId = req.query.storeId
            if(!storeId) return res.status(400).json({message: "StoreId is required"})
            const cacheKey = `store:${ storeId }:skip:${ skip }`;
            const cacheData = await req.redisClient.get( cacheKey );
            if ( cacheData ) return res.status( 200 ).json( JSON.parse( cacheData ) );
            
            const products = await prisma.product.findMany( {
                  where: {
                        merchantId:storeId
                  },
                  skip,
                  take: 10,
            } );

            await req.redisClient.set( cacheKey, JSON.stringify( products ),{EX:3600});

            return res.status( 200 ).json( products );

      } catch (e) {
            res.status(500).json({message:"Internal sever error", error: e.message})
      }
      
}

const getSingleStore = async (req,res) =>
{
      try {
            const storeId = req.params;
            if ( !storeId ) return res.status( 400 ).json( { message: "StoreId is required" } );
            const cacheKey = `store:${ storeId }`
            const cacheData = await req.redisClient.get( cacheKey );
            if ( cacheData ) return res.status( 200 ).json( JSON.parse( cacheData ) );
            
            const store = await prisma.merchant.findUniqueOrThrow( {
                  where: {
                        id: storeId
                  },
                  select:safeMerchant
            } );
            
            await req.redisClient.set( cacheKey, JSON.stringify( store ), { EX: 3600 } );
            return res.status( 202 ).json( store );

      } catch ( e ) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                  if (e.code === "P2025")
                        return res.status(404).json({ message: "Product not found" });
            }
            res.status(500).json({message:"Internal sever error", error: e.message})
      }
}

const getFeatureStores = async ( req, res ) =>
{
      const skip = +req.query.skip || 0;
      const cacheKey = `store:skip:${ skip }:isFeatured`;
      try {
            const cacheData = await req.redisClient.get( cacheKey );
            if ( cacheData ) return res.status( 200 ).json( JSON.parse( cacheData ) );
            const stores = await prisma.merchant.findMany( {
                  where: {
                        isPromoted: true
                  }, select: safeMerchant
            } )

            await req.redisClient.set( cacheKey, JSON.stringify( stores ), { EX: 3600 } );
            return res.status( 200 ).json( stores );
      } catch (e) {
            res.status( 500 ).json( { message: "Internal sever error", error: e.message } );
      }
}

const getStoreCategory = async ( req, res ) =>
{
      const skip = +req.query.skip || 0;
      const category = req.query.category;
      const cacheKey = `products:category:${ category }:skip:${ skip }`;
      
      try {
            const cacheData = await req.redisClient.get( cacheKey );
            if ( cacheData ) return res.status( 200 ).json( JSON.parse( cacheData ) );
            
            if ( !category ) return res.status( 400 ).send( "No category provided" );
            
            const stores = await prisma.merchant.findMany( {
                  where: {
                        category:category.toUpperCase()
                  },select:safeMerchant
            } )
            
            await req.redisClient.set( cacheKey, JSON.stringify( stores ), { EX: 3600 } );
            return res.status( 202 ).send( json( stores ) );
            
      } catch (e) {
            return res.status(500).json({message:"internal server error", error:e.message})
      }
}


module.exports = {getStores,getFeatureStores,getSingleStore,getStoreProduct,getStoreCategory}