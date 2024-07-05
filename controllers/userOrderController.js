const { PrismaClient, Prisma } = require( "@prisma/client" );


const prisma = new PrismaClient();

const createOrder = async ( req, res ) =>
{
      const { userId, items,amount,address } = req.body;
      try {
            await prisma.user.findUniqueOrThrow( { where: { id: userId } } );

            const order = await prisma.order.create( {
                  data: {
                        user: {
                              connect:{id:userId}
                        },
                        products: {
                              create: items.map( item => ( {
                                    product: {
                                          connect:{id: item.productId}
                                    },
                                    quantity: parseInt(item.quantity)
                              }))
                        },
                        netAmount: parseFloat( amount ),
                        address
                  },
                  include: {
                        products:true
                  }
            } )
            
            return res.status(201).json(order)

      } catch ( e ) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
            return res.status(404).json({ message: "User not found" });
            }
            console.error(e.message)
            res.status(500).json({message:"Internal server error",erroe:e.message})
      }
};

const getUserOrder = async ( req, res ) =>
{
      const  id  = res.user.id;
      const cacheKey = `order:user:${id}`
      try {
            /* const cacheData = await req.redisClient.get( cacheKey );
            if ( cacheData ) return res.status(200).json( JSON.parse( cacheData ) ); */

            await prisma.user.findUniqueOrThrow( { where: { id } } );

            const orders = await prisma.order.findMany( { where: { userId: id },include:{products:true} } )

            await req.redisClient.set( cacheKey, JSON.stringify( orders ), { EX: 3600 } )
            
            return res.status(200).json(orders)
            
      } catch ( e ) {
            console.error(e)
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                  if (e.code === "P2025")
                        return res.status(404).json({ message: "User not found" });
            }
            res.status(500).json({message:"Internal server error",erroe:e.message})
      }
}
module.exports={createOrder,getUserOrder}