require("dotenv").config();
const compression = require( "compression" )
const express = require("express");
const cors = require("cors");
const credentials = require("./middleware/credentials");
const { verifyJwt,verifyMerchant } = require("./middleware/auth");
const cookieParser = require( "cookie-parser" );
const { swaggerSpec, swaggerUi } = require( './utils/swagger' )
const figlet = require( 'figlet' );
const multer = require( 'multer' );

const waitlist = require( "./routes/waitlist" );
const refresh = require( "./routes/refresh" );
const auth = require( "./routes/auth" );
const logout = require( "./routes/logout" )
const verify = require("./routes/verify")
const product = require( "./routes/product" )
const merchantAuth = require("./routes/merchantAuth")
const cart = require("./routes/cart")
const merchant = require("./routes/merchant");
const { redisMiddleware } = require( "./middleware/redis" );
const corsOption = require( "./config/corsOptions" );

const PORT = process.env.PORT || 3500;

const app = express();

app.use(compression({
  level: 8,
  threshold: 1024,
} ) );

// Middlewares
app.use(credentials);
app.use( cors(corsOption) );
const storage = multer.diskStorage( {
    destination: './public/product',
    filename: ( req,file, cb )=>{
      cb( null, file.originalname );
    }
} )

const userStorage = multer.diskStorage( {
    destination: './public/user',
    filename: ( req,file, cb )=>{
      cb( null, file.originalname );
    }
} )

const storeStorage = multer.diskStorage( {
  destination: './public/store',
  filename: ( req, file, cb ) =>
  {
    cb(null, file.originalname)
  }
} )

const storeUpload = multer( { storeStorage } )
const storecp = storeUpload.fields(  { name: "dp", maxCount: 1 } )

const upload = multer({storage})
const cp = upload.fields( [ { name: 'dp', maxCount: 1 }, { name: 'images', maxCount: 3 } ] )

const userUpload = multer({storage})
const userCp = userUpload.fields( { name: 'dp', maxCount: 1 } )

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use( cookieParser() );
app.use( redisMiddleware );

app.use( express.static( "public" ) )

// End of Middleware

app.get( "/", ( req, res ) =>
{
  return res.status(301).redirect('/docs')
})
app.use( "/docs", swaggerUi.serve, swaggerUi.setup( swaggerSpec ) );
// Route to handle waitlist
app.use( "/waitlist", waitlist.router );
//Route that handles authentication of a user
app.use("/refresh", refresh.router);
app.use("/auth", auth.router);
app.use( "/logout", logout.router );
app.use( "/verify-mail", verify.router );
// Route that handles fetching products and stores for user
app.use( "/product", product.router );
app.use( "/store", require( "./routes/store" ) )
// Route that handles authentication for Merchants
app.use( "/merchant/auth", storecp, merchantAuth.router );



// Routes which requires authorization
app.use( verifyJwt );
app.use( "/cart", cart.router );
app.use('/wishlist', require("./routes/wishlist"))
app.use('/profile',userCp,require("./routes/profile"))

//This route handles the logic for merchants
app.use(verifyMerchant)
app.use( '/merchant/product', cp, merchant.router )
app.use('/merchant/profile', storecp, require("./routes/merchantProfile"))



const server = app.listen( PORT, () =>
{
  figlet.text( 'SupaShop API 1.0', {
    font: 'Doom',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 100,
    whitespaceBreak: true,
  }, (err, asciiArt) => {
    if (err) {
      console.error(err);
      return;
    }
      console.log( asciiArt );
      console.log( `server is running on port ${ PORT }` );
  } );
      
} );

process.on( "SIGINT", async () =>
{
  server.close( async () =>
  {
    Promise.all( [ auth.cleanUp(), waitlist.cleanUp(), refresh.cleanUp(), logout.cleanUp(), verify.cleanUp(), product.cleanUp(), merchantAuth.cleanUp(), cart.cleanUp(),
      merchant.cleanUp()
    ])
  })
})


