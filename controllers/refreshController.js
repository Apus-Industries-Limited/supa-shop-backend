const { PrismaClient } = require( '@prisma/client' );
const jwt = require("jsonwebtoken")


const prisma = new PrismaClient();


const refresh = async ( req, res ) =>
{
      try {
            const cookies = req.cookies;
            if ( !cookies?.refreshToken ) return res.sendStatus( 401 );

            const oldRefresh = cookies.refreshToken;

            const foundUser = await prisma.user.findFirst( {
                  where: {
                        refresh_token: {
                        has: oldRefresh
                  }
                  }
            } )
            
            if ( !foundUser ) return res.sendStatus( 403 );

            jwt.verify( oldRefresh, process.env.REFRESH_TOKEN_SECRET, async ( err, decoded ) =>
            {
                  if ( err || foundUser.email !== decoded.email ) return res.status( 403 );
                  // Creation of new refresh and access token
                  const refreshToken = jwt.sign( {
                  "email":foundUser.email
                  }, process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: '30d'
                  } )

                  const accessToken = jwt.sign( {
                  "email":foundUser.email
                  }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '3h'
                  } )

                  //removal of previous refresh token from the database
                  const token = foundUser.refresh_token.filter( refresh => refresh !== oldRefresh )
                  foundUser.refresh_token = [ ...token, refreshToken ]
                  
                  await prisma.user.update( { where: { email: foundUser.email }, data: foundUser } )
                  
                  res.cookie( 'refreshToken', refreshToken, {
                  httpOnly: true,
                  maxAge: 30 * 24 * 60 * 60 * 1000,
                  sameSite:"None",
                  secure: true
                  } )
                  
                  return res.status(200).json({accessToken})
            })

      } catch (e) {
            return res.status(500).json({message:"internal server error", error:e})
      } finally {
            await prisma.$disconnect()
      }
};

module.exports = {refresh}