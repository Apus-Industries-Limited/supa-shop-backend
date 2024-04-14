const { PrismaClient } = require( '@prisma/client' );


const prisma = new PrismaClient();


const logout = async ( req, res ) =>
{
      try {
            //Getting the cookies
            const cookies = req.cookies;
            if ( !cookies?.refreshToken ) return res.sendStatus( 204 );
            const oldRefresh = cookies.refreshToken;

            const foundUser = await prisma.user.findFirst( {
                  where: {
                        refresh_token: {
                        has: oldRefresh
                  }
                  }
            } )

            // if user not found clear the cookie
            if ( !foundUser ) {
                  res.clearCookie( 'refreshToken', {
                        httpOnly: true,
                        sameSite:"None",
                        secure: true
                  } )
                  return res.sendStatus( 204 );
            }

            //If found remove the refresh token from the database
            const token = foundUser.refresh_token.filter( refresh => refresh !== oldRefresh )
            foundUser.refresh_token = [ ...token ]
            
            await prisma.user.update( { where: { email: foundUser.email }, data: foundUser } )

            res.clearCookie( 'refreshToken', {
                  httpOnly: true,
                  sameSite:"None",
                  secure: true
            } )
            return res.sendStatus( 204 );
      } catch (e) {
            return res.status(500).json({message:"internal server error", error:e})
      } finally {
            await prisma.$disconnect()
      }
};

module.exports = logout