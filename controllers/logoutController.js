const { PrismaClient } = require( '@prisma/client' );


const prisma = new PrismaClient();

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Log out the user
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: Accepted - Successfully logged out or no refresh token in cookies
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
            return res.send( 202 ).json({message:"User Logged out successful"});
      } catch (e) {
            return res.status(500).json({message:"internal server error", error:e})
      }
};

/**
 * @swagger
 * /logout/merchant:
 *   get:
 *     summary: Log out A merchant
 *     tags: [Merchant Auth]
 *     responses:
 *       202:
 *         description: Accepted - Successfully logged out or no refresh token in cookies
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
const logoutMerchant = async ( req, res ) =>
{
      try {
            //Getting the cookies
            const cookies = req.cookies;
            if ( !cookies?.refreshToken ) return res.sendStatus( 204 );
            const oldRefresh = cookies.refreshToken;

            const foundUser = await prisma.merchant.findFirst( {
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
            return res.send( 202 ).json({message:"Merchant Logged out successful"});
      } catch (e) {
            return res.status(500).json({message:"internal server error", error:e})
      }
}


const cleanUp = async () =>
{
  await prisma.$disconnect();
}
module.exports = {cleanUp,logout, logoutMerchant}