const redis = require( "redis" );

const redisClient = redis.createClient( {
  url: process.env.REDIS_URL
});

redisClient.on( "error", ( err ) =>
{
  console.error( "Redis error", err );
} )

redisClient.on( "connect", () =>
{
  console.log("Connected to Redis")
} );


const redisMiddleware = async ( req, res, next ) =>
{
      try {
            if ( !redisClient.isOpen ) {
                  await redisClient.connect();
            }
            req.redisClient = redisClient;
            next()

      } catch (error) {
            res.status(500).send("Internal server error")
      }
};

module.exports = {redisMiddleware}