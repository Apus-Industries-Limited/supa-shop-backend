const { PrismaClient,Prisma } = require( '@prisma/client' );
const jwt = require("jsonwebtoken")


const prisma = new PrismaClient();

/**
 * @swagger
 * /refresh:
 *   get:
 *     summary: Refresh access token for user
 *     tags: [Refresh Token]
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Newly generated access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVtYWlsQGV4YW1wbGUuY29tIiwiaWF0IjoxNjMzMjM5MDAwLCJleHAiOjE2MzMyNDA2MDB9.JkPj1XJ0U1_7x_7uFD3UnnVq-cmSHPpU2rUGkglAnhs
 *       401:
 *         description: Unauthorized - Missing or invalid refresh token
 *       403:
 *         description: Forbidden - User not found or invalid refresh token
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

const refresh = async ( req, res ) =>
{
      try {
            const cookies = req.cookies;
            if ( !cookies?.refreshToken ) return res.sendStatus( 401 );

            const oldRefresh = cookies.refreshToken;

            const foundUser = await prisma.user.findUniqueOrThrow( {
                  where: {
                        refresh_token: {
                        has: oldRefresh
                  }
                  }
            } )
            

            jwt.verify( oldRefresh, process.env.REFRESH_TOKEN_SECRET, async ( err, decoded ) =>
            {
                  if ( err || foundUser.email !== decoded.email ) return res.status( 403 );
                  // Creation of new refresh and access token
                  const refreshToken = jwt.sign( {
                        email: foundUser.email,
                        id: foundUser.id,
                        name: foundUser.name
                        }, process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: '30d'
                  } )

                  const accessToken = jwt.sign( {
                        email: foundUser.email,
                        id: foundUser.id,
                        name: foundUser.name
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
                  const user = { ...foundUser, accessToken };

                        delete user.password;
                        delete user.refresh_token;
                        delete user.verification_code;
                  
                  return res.status(200).json(user)
            })

      } catch ( e ) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                  if (e.code === "P2025")
                  return res.sendStatus( 403 );
            }
            return res.status(500).json({message:"internal server error", error:e})
      }
};



/**
 * @swagger
 * /refresh/merchant:
 *   get:
 *     summary: Refresh access token for merchant
 *     tags: [Refresh Token]
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Newly generated access token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVtYWlsQGV4YW1wbGUuY29tIiwiaWF0IjoxNjMzMjM5MDAwLCJleHAiOjE2MzMyNDA2MDB9.JkPj1XJ0U1_7x_7uFD3UnnVq-cmSHPpU2rUGkglAnhs
 *       401:
 *         description: Unauthorized - Missing or invalid refresh token
 *       403:
 *         description: Forbidden - User not found or invalid refresh token
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

const merchantRefresh = async ( req, res ) =>
{
      try {
            const cookies = req.cookies;
            if ( !cookies?.refreshToken ) return res.sendStatus( 401 );

            const oldRefresh = cookies.refreshToken;

            const foundUser = await prisma.merchant.findUniqueOrThrow( {
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
                        email: foundUser.email,
                        id: foundUser.id,
                        name: foundUser.name
                  }, process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: '30d'
                  } )

                  const accessToken = jwt.sign( {
                        email: foundUser.email,
                        id: foundUser.id,
                        name: foundUser.name
                  }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '3h'
                  } )

                  //removal of previous refresh token from the database
                  const token = foundUser.refresh_token.filter( refresh => refresh !== oldRefresh )
                  foundUser.refresh_token = [ ...token, refreshToken ]
                  
                  await prisma.merchant.update( { where: { email: foundUser.email }, data: foundUser } )
                  
                  res.cookie( 'refreshToken', refreshToken, {
                  httpOnly: true,
                  maxAge: 30 * 24 * 60 * 60 * 1000,
                  sameSite:"None",
                  secure: true
                  } )
                  const user = { ...foundUser, accessToken };

                        delete user.password;
                        delete user.refresh_token;
                        delete user.verification_code;
                  return res.status(200).json(user)
            })

      } catch ( e ) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                  if (e.code === "P2025")
                  return res.sendStatus( 403 );
            }
            return res.status(500).json({message:"internal server error", error:e})
      }
}

const cleanUp = async () =>
{
  await prisma.$disconnect();
}
module.exports = {refresh,merchantRefresh,cleanUp}